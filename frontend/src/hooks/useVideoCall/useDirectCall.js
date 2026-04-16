import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { logger } from '../../utils/logger';
import { ICE_SERVERS, WEBRTC_TIMEOUT } from '../../config/webrtcConfig';

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
    const processedIceCountRef = useRef(0);
    const connectionTimeoutRef = useRef(null);

    const cleanup = useCallback(() => {
        callEndedRef.current = true;
        if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
        }

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

    useEffect(() => {
        if (connectionState === 'connecting') {
            if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
            
            connectionTimeoutRef.current = setTimeout(() => {
                if (peerRef.current && (peerRef.current.connectionState === 'connecting' || peerRef.current.iceConnectionState === 'checking')) {
                    logger.warn('WebRTC connection timed out after 20s');
                    setConnectionState('failed');
                    setMediaError('Connection timed out. This often happens due to restrictive firewalls. Try refreshing or using a different network.');
                }
            }, WEBRTC_TIMEOUT);
        } else if (connectionState === 'connected' || connectionState === 'failed' || connectionState === 'disconnected') {
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current);
                connectionTimeoutRef.current = null;
            }
        }

        return () => {
            if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
        };
    }, [connectionState]);

    const getMedia = useCallback(async () => {
        setMediaError(null);
        try {
            const constraints = {
                audio: true,
                video: isVideoCall ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
            };
            
            logger.log('Requesting media with constraints:', constraints);
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

    const createPeer = useCallback(
        (mediaStream) => {
            const peer = new RTCPeerConnection(ICE_SERVERS);
            peerRef.current = peer;

            if (mediaStream) {
                mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream));
            }

            peer.ontrack = (event) => {
                if (!isMountedRef.current) return;
                const remote = event.streams[0];
                logger.log('Remote track received:', event.track.kind, 'Stream ID:', remote?.id);
                setRemoteStream(remote);
                if (userVideoRef.current && remote) {
                    if (userVideoRef.current.srcObject !== remote) {
                        userVideoRef.current.srcObject = remote;
                    }
                    userVideoRef.current.play().catch(e => logger.warn('Autoplay prevented or interrupted:', e));
                }
            };

            peer.onicecandidate = (event) => {
                if (!event.candidate) return;
                const to = isIncoming ? callerId : userToCall;
                socketRef.current?.emit('ice-candidate', { to, candidate: event.candidate });
            };

            peer.onconnectionstatechange = () => {
                if (!isMountedRef.current) return;
                const state = peer.connectionState;
                logger.log('Overall Connection state:', state);
                setConnectionState(state);
                if (state === 'connected') {
                    setStartTime(prev => prev ?? Date.now());
                } else if (state === 'failed') {
                    logger.error('WebRTC connection failed');
                    setMediaError('Connection failed to establish. Attempting relay via TURN server…');
                }
            };

            peer.oniceconnectionstatechange = () => {
                if (!isMountedRef.current) return;
                logger.log('ICE Connection state:', peer.iceConnectionState);
                if (peer.iceConnectionState === 'failed') {
                    logger.warn('ICE failed — triggering ICE restart');
                    peer.restartIce();
                }
            };

            peer.onicegatheringstatechange = () => {
                logger.log('ICE Gathering state:', peer.iceGatheringState);
            };

            return peer;
        },
        [isIncoming, callerId, userToCall, socketRef]
    );

    useEffect(() => {
        isMountedRef.current = true;
        let active = true;
        let socketCleanup;

        const init = async () => {
            const socket = socketRef.current;
            if (!socket) return;

            const onCallAccepted = async (signal) => {
                if (!active || callEndedRef.current) return;
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
                if (!active) return;
                logger.log('Remote ended the call');
                setCallEnded(true);
                cleanup();
                onEndCall?.();
            };

            socket.on('callAccepted', onCallAccepted);
            socket.on('callEnded', onCallEnded);
            socketCleanup = () => {
                socket.off('callAccepted', onCallAccepted);
                socket.off('callEnded', onCallEnded);
            };

            if (!isIncoming) {
                const mediaStream = await getMedia();
                if (!active) return;
                
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
                setConnectionState('incoming');
            }
        };

        init();

        return () => {
            active = false;
            isMountedRef.current = false;
            socketCleanup?.();
            cleanup();
        };
    }, []);

    useEffect(() => {
        if (myVideoRef.current && stream) {
            if (myVideoRef.current.srcObject !== stream) {
                logger.log('Setting local stream to video element');
                myVideoRef.current.srcObject = stream;
            }
        }
    }, [stream]);

    useEffect(() => {
        if (userVideoRef.current && remoteStream) {
            if (userVideoRef.current.srcObject !== remoteStream) {
                logger.log('Setting remote stream to video element');
                userVideoRef.current.srcObject = remoteStream;
                userVideoRef.current.play().catch(e => {
                    if (e.name !== 'AbortError') {
                        logger.error('Autoplay failed:', e);
                    }
                });
            }
        }
    }, [remoteStream]);

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
            logger.log('Answering call from', callerId, '| audio-only:', !isVideoCall);
            setConnectionState('connecting');

            const mediaStream = await getMedia();
            if (!mediaStream) {
               throw new Error('Media permission denied or hardware unavailable.');
            }

            const peer = createPeer(mediaStream);
            if (!peer) throw new Error('Could not instantiate WebRTC Peer');

            if (!callerSignal) throw new Error('No incoming signal found');
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
    }, [callerId, callerSignal, socketRef, flushIceCandidates, getMedia, createPeer, isVideoCall]);

    const leaveCall = useCallback(() => {
        const to = isIncoming ? callerId : userToCall;
        setCallEnded(true);
        cleanup();
        socketRef.current?.emit('endCall', { to });
        onEndCall?.();
    }, [isIncoming, callerId, userToCall, socketRef, cleanup, onEndCall]);

    const toggleMute = useCallback(() => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        }
    }, []);

    const toggleVideo = useCallback(() => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsVideoOff(!track.enabled);
        }
    }, []);

    const toggleScreenShare = useCallback(async () => {
        if (isScreenSharing) {
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
