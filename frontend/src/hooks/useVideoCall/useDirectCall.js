import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { logger } from '../../utils/logger';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
    ],
    iceCandidatePoolSize: 10,
};

export const useDirectCall = ({
    isIncoming,
    callerSignal,
    callerId,
    userToCall,
    iceCandidates = [],
    onEndCall,
    isVideoCall = true,
}) => {
    const { socketRef, user } = useChatContext();

    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [mediaError, setMediaError] = useState(null);
    const [connectionState, setConnectionState] = useState('initializing');
    const [startTime, setStartTime] = useState(null);

    const myVideoRef = useRef(null);
    const userVideoRef = useRef(null);
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const iceCandidateQueue = useRef([]);
    const isMountedRef = useRef(true);
    const callEndedRef = useRef(false);
    const initPromiseRef = useRef(null);
    const processedIceCountRef = useRef(0);

    // ── Cleanup ────────────────────────────────────────────────────────────
    const cleanup = useCallback(() => {
        callEndedRef.current = true;

        if (peerRef.current) {
            peerRef.current.ontrack = null;
            peerRef.current.onicecandidate = null;
            peerRef.current.onconnectionstatechange = null;
            peerRef.current.close();
            peerRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }

        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
        }

        iceCandidateQueue.current = [];
        setStream(null);
        setRemoteStream(null);
    }, []);

    // ── Get local media ────────────────────────────────────────────────────
    const getMedia = useCallback(async () => {
        setMediaError(null);
        try {
            const constraints = {
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                video: isVideoCall ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (!isMountedRef.current) {
                mediaStream.getTracks().forEach(t => t.stop());
                return null;
            }
            localStreamRef.current = mediaStream;
            setStream(mediaStream);
            if (myVideoRef.current && isVideoCall) {
                myVideoRef.current.srcObject = mediaStream;
            }
            return mediaStream;
        } catch (err) {
            logger.error('getMedia error:', err);
            const msg =
                err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
                    ? 'Please allow microphone and camera access in your browser.'
                    : err.name === 'NotReadableError'
                        ? 'Microphone or camera is in use by another application.'
                        : 'Could not access media devices. Please check your browser settings.';
            setMediaError(msg);
            return null;
        }
    }, [isVideoCall]);

    // ── Process queued ICE candidates ──────────────────────────────────────
    const flushIceCandidates = useCallback(() => {
        const peer = peerRef.current;
        if (!peer || !peer.remoteDescription) return;
        while (iceCandidateQueue.current.length > 0) {
            const candidate = iceCandidateQueue.current.shift();
            peer.addIceCandidate(candidate).catch(e =>
                logger.error('Error adding queued ICE candidate:', e)
            );
        }
    }, []);

    // ── Create peer connection ─────────────────────────────────────────────
    const createPeer = useCallback(
        (mediaStream) => {
            const peer = new RTCPeerConnection(ICE_SERVERS);
            peerRef.current = peer;

            // Add local tracks
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream));
            }

            // Remote stream handler
            peer.ontrack = (event) => {
                if (!isMountedRef.current) return;
                const remote = event.streams[0];
                setRemoteStream(remote);
                if (userVideoRef.current && remote) {
                    userVideoRef.current.srcObject = remote;
                }
            };

            // ICE candidate handler
            peer.onicecandidate = (event) => {
                if (!event.candidate) return;
                const to = isIncoming ? callerId : userToCall;
                socketRef.current?.emit('ice-candidate', { to, candidate: event.candidate });
            };

            // Connection state handler
            peer.onconnectionstatechange = () => {
                if (!isMountedRef.current) return;
                const state = peer.connectionState;
                logger.log('Connection state:', state);
                setConnectionState(state);
                if (state === 'connected' && !startTime) {
                    setStartTime(Date.now());
                } else if (state === 'failed') {
                    logger.error('WebRTC connection failed');
                }
            };

            return peer;
        },
        [isIncoming, callerId, userToCall, socketRef, startTime]
    );

    // ── Main init effect ───────────────────────────────────────────────────
    useEffect(() => {
        isMountedRef.current = true;

        const init = async () => {
            const socket = socketRef.current;
            if (!socket) return;

            // ── Register socket handlers FIRST so we don't miss events ────
            const onCallAccepted = async (signal) => {
                if (!isMountedRef.current || callEndedRef.current) return;
                logger.log('callAccepted received');
                setCallAccepted(true);
                setConnectionState('connecting');
                try {
                    await peerRef.current.setRemoteDescription(
                        new RTCSessionDescription(signal)
                    );
                    flushIceCandidates();
                } catch (e) {
                    logger.error('setRemoteDescription (callAccepted) failed:', e);
                }
            };

            const onCallEnded = () => {
                if (!isMountedRef.current) return;
                logger.log('Remote ended the call');
                setCallEnded(true);
                cleanup();
                onEndCall?.();
            };

            socket.on('callAccepted', onCallAccepted);
            socket.on('callEnded', onCallEnded);
            if (!isIncoming) {
                // ── OUTGOING ONLY: Fetch media & create/send offer ────────────────
                const mediaStream = await getMedia();
                if (!isMountedRef.current) return;
                
                const peer = createPeer(mediaStream);
                try {
                    setConnectionState('calling');
                    const offer = await peer.createOffer();
                    await peer.setLocalDescription(offer);
                    socket.emit('callUser', {
                        userToCall,
                        signalData: offer,
                        from: user?._id || user?.id,
                        name: user?.name,
                        isVideo: isVideoCall,
                    });
                    logger.log('Outgoing call offer sent to', userToCall);
                } catch (e) {
                    logger.error('createOffer failed:', e);
                    setMediaError('Failed to initiate the call. Please try again.');
                }
            } else {
                // ── INCOMING: Wait for user to answer before creating peer/media ─
                setConnectionState('incoming');
            }

            return () => {
                socket.off('callAccepted', onCallAccepted);
                socket.off('callEnded', onCallEnded);
            };
        };

        const promise = init();
        initPromiseRef.current = promise;
        let socketCleanup;
        promise.then(fn => { socketCleanup = fn; });

        return () => {
            isMountedRef.current = false;
            socketCleanup?.();
            cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync video refs when streams arrive
    useEffect(() => {
        if (myVideoRef.current && stream) myVideoRef.current.srcObject = stream;
    }, [stream]);

    // Sync remote streams when they arrive
    useEffect(() => {
        if (userVideoRef.current && remoteStream) {
            userVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Process incoming ICE candidates buffered in ChatContext
    useEffect(() => {
        const peer = peerRef.current;
        if (!peer || callEndedRef.current) return;

        const newCandidates = iceCandidates.slice(processedIceCountRef.current);
        if (newCandidates.length === 0) return;

        newCandidates.forEach(candidate => {
            const iceCandidate = new RTCIceCandidate(candidate);
            if (peer.remoteDescription?.type) {
                peer.addIceCandidate(iceCandidate).catch(e => logger.error('addIceCandidate error:', e));
            } else {
                iceCandidateQueue.current.push(iceCandidate);
            }
        });

        processedIceCountRef.current = iceCandidates.length;
    }, [iceCandidates, connectionState]);

    const answerCall = useCallback(async () => {
        if (callEndedRef.current) return;

        const socket = socketRef.current;
        if (!socket) {
            logger.error('Cannot answer call: socket not available');
            setMediaError('WebSockets unavailable. Please refresh.');
            return;
        }

        try {
            logger.log('Answering call from', callerId);
            setConnectionState('connecting');

            // 1. Fetch Media securely on button click
            const mediaStream = await getMedia();
            if (!mediaStream) {
               throw new Error('Media permission denied or hardware unavailable.');
            }

            // 2. Initialize Peer explicitly
            const peer = createPeer(mediaStream);
            if (!peer) throw new Error("Could not instantiate WebRTC Peer");

            if (!callerSignal) throw new Error("No incoming signal found");
            await peer.setRemoteDescription(new RTCSessionDescription(callerSignal));
            flushIceCandidates();

            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            socket.emit('answerCall', { signal: answer, to: callerId });
            setCallAccepted(true);
            setConnectionState('connecting');
            logger.log('Answer sent to', callerId);
        } catch (e) {
            logger.error('answerCall failed:', e);
            setMediaError('Failed to pick up: ' + (e.message || 'Network error'));
        }
    }, [callerId, callerSignal, socketRef, flushIceCandidates]);

    // ── Leave call ─────────────────────────────────────────────────────────
    const leaveCall = useCallback(() => {
        const to = isIncoming ? callerId : userToCall;
        setCallEnded(true);
        cleanup();
        socketRef.current?.emit('endCall', { to });
        onEndCall?.();
    }, [isIncoming, callerId, userToCall, socketRef, cleanup, onEndCall]);

    // ── Toggle mute ────────────────────────────────────────────────────────
    const toggleMute = useCallback(() => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        }
    }, []);

    // ── Toggle video ───────────────────────────────────────────────────────
    const toggleVideo = useCallback(() => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsVideoOff(!track.enabled);
        }
    }, []);

    // ── Screen sharing ─────────────────────────────────────────────────────
    const toggleScreenShare = useCallback(async () => {
        if (isScreenSharing) {
            // Stop screen share, restore camera
            screenStreamRef.current?.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;

            const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
            if (cameraTrack && peerRef.current) {
                const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
                sender?.replaceTrack(cameraTrack);
            }
            setIsScreenSharing(false);
        } else {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: 'always' },
                    audio: false,
                });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                if (peerRef.current && screenTrack) {
                    const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
                    sender?.replaceTrack(screenTrack);
                }

                screenTrack.onended = () => {
                    // User clicked "Stop sharing" in browser UI
                    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
                    if (cameraTrack && peerRef.current) {
                        const sender = peerRef.current
                            .getSenders()
                            .find(s => s.track?.kind === 'video');
                        sender?.replaceTrack(cameraTrack);
                    }
                    screenStreamRef.current = null;
                    setIsScreenSharing(false);
                };
                setIsScreenSharing(true);
            } catch (err) {
                logger.error('Screen share error:', err);
            }
        }
    }, [isScreenSharing]);

    return {
        stream,
        remoteStream,
        callAccepted,
        callEnded,
        isMuted,
        isVideoOff,
        isScreenSharing,
        mediaError,
        connectionState,
        startTime,
        myVideoRef,
        userVideoRef,
        answerCall,
        leaveCall,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
        getMedia,
    };
};
