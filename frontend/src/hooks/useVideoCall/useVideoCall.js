import { useState, useEffect, useRef, useCallback } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { logger } from '../../utils/logger';
import { ICE_SERVERS } from '../../config/webrtcConfig';

export const useVideoCall = () => {
    const { user, socketRef, socketConnected } = useChatContext();
    const [roomId, setRoomId] = useState('');
    const [inputRoomId, setInputRoomId] = useState('');
    const [isInRoom, setIsInRoom] = useState(false);
    const [copied, setCopied] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [stream, setStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [hasMedia, setHasMedia] = useState(false);

    // Chat state
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Connection state tracking
    const [peerStates, setPeerStates] = useState(new Map());

    // Loading and error states
    const [isJoining, setIsJoining] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);
    const [mediaError, setMediaError] = useState(null);
    const [socketError, setSocketError] = useState(null);

    const myVideoRef = useRef();
    const peersRef = useRef(new Map());
    const streamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const messagesEndRef = useRef(null);
    const isInRoomRef = useRef(false);
    const roomIdRef = useRef('');
    const makingOfferRef = useRef(new Map()); // Map of userId -> boolean
    const ignoreOfferRef = useRef(new Map()); // Map of userId -> boolean
    const initiatorsRef = useRef(new Map()); // Map of userId -> boolean
    const pendingCandidatesRef = useRef(new Map()); // Map of userId -> ICECandidate[]

    useEffect(() => {
        isInRoomRef.current = isInRoom;
        roomIdRef.current = roomId;
    }, [isInRoom, roomId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (!socketConnected) {
            setSocketError('Socket disconnected. Trying to reconnect...');
        } else {
            setSocketError(null);
            // Attempt to re-join room if we were in one
            if (isInRoomRef.current && roomIdRef.current && socketRef.current) {
                logger.log('Socket reconnected, re-joining room:', roomIdRef.current);
                socketRef.current.emit('joinRoom', {
                    roomId: roomIdRef.current,
                    userId: user._id,
                    userName: user.name
                });
            }
        }
    }, [socketConnected, user._id, user.name]);

    // Automatically attach stream to local video ref
    useEffect(() => {
        if (myVideoRef.current && stream) {
            myVideoRef.current.srcObject = stream;
        }
    }, [stream, hasMedia, isVideoOff, myVideoRef]);

    const generateRoomId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';
        for (let i = 0; i < 9; i++) {
            if (i === 3 || i === 6) id += '-';
            else id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getUserMedia = async () => {
        try {
            setMediaError(null);
            // Try getting both video and audio
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: { echoCancellation: true, noiseSuppression: true }
            });
            setStream(mediaStream);
            streamRef.current = mediaStream;
            setHasMedia(true);
            setIsVideoOff(false);
            return mediaStream;
        } catch (err) {
            logger.warn('Initial media access failed, trying audio only:', err);

            try {
                // Fallback to audio only
                const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
                    video: false,
                    audio: { echoCancellation: true, noiseSuppression: true }
                });
                setStream(audioOnlyStream);
                streamRef.current = audioOnlyStream;
                setHasMedia(true);
                setIsVideoOff(true);
                return audioOnlyStream;
            } catch (audioErr) {
                logger.error('Final media error:', audioErr);
                let errorMessage = 'Camera/microphone not available';

                if (audioErr.name === 'NotAllowedError' || audioErr.name === 'PermissionDeniedError') {
                    errorMessage = 'Camera/microphone permission denied. Please allow access in your browser settings.';
                } else if (audioErr.name === 'NotFoundError' || audioErr.name === 'DevicesNotFoundError') {
                    errorMessage = 'No camera or microphone found on this device.';
                }

                setMediaError(errorMessage);
                setHasMedia(false);
                return null;
            }
        }
    };

    const enableMedia = async () => {
        const mediaStream = await getUserMedia();
        if (mediaStream && peersRef.current.size > 0) {
            peersRef.current.forEach(peer => {
                mediaStream.getTracks().forEach(track => {
                    const sender = peer.getSenders().find(s => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        peer.addTrack(track, mediaStream);
                    }
                });
            });
        }
    };

    const createRoom = async () => {
        if (!socketRef.current || !socketConnected) {
            setError('Socket not connected. Please wait...');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const newRoomId = generateRoomId();
            await getUserMedia();

            setRoomId(newRoomId);
            setIsInRoom(true);
            isInRoomRef.current = true;
            roomIdRef.current = newRoomId;

            socketRef.current.emit('joinRoom', {
                roomId: newRoomId,
                userId: user._id,
                userName: user.name
            });
        } catch (err) {
            logger.error('Error creating room:', err);
            setError('Failed to create room. Please try again.');
            setIsInRoom(false);
        } finally {
            setIsCreating(false);
        }
    };

    const joinRoom = async () => {
        if (!inputRoomId.trim()) {
            setError('Please enter a room ID');
            return;
        }

        if (!socketRef.current || !socketConnected) {
            setError('Socket not connected. Please wait...');
            return;
        }

        setIsJoining(true);
        setError(null);

        try {
            await getUserMedia();

            const normalizedRoomId = inputRoomId.toUpperCase();
            setRoomId(normalizedRoomId);
            setIsInRoom(true);
            isInRoomRef.current = true;
            roomIdRef.current = normalizedRoomId;

            socketRef.current.emit('joinRoom', {
                roomId: normalizedRoomId,
                userId: user._id,
                userName: user.name
            });
        } catch (err) {
            logger.error('Error joining room:', err);
            setError('Failed to join room. Please try again.');
            setIsInRoom(false);
        } finally {
            setIsJoining(false);
        }
    };

    const sendMessage = () => {
        if (!messageInput.trim()) return;
        if (!socketRef.current) {
            logger.error('Socket not initialized');
            return;
        }

        const message = {
            id: Date.now(),
            text: messageInput,
            sender: user.name,
            senderId: user._id,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, message]);

        socketRef.current.emit('roomMessage', {
            roomId,
            message
        });

        setMessageInput('');
    };

    const stopStreamTracks = (mediaStream) => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => {
                track.stop();
                logger.log(`Stopped ${track.kind} track`);
            });
        }
    };

    const leaveRoom = () => {
        logger.log('Leaving room...');

        if (streamRef.current) {
            stopStreamTracks(streamRef.current);
            streamRef.current = null;
        }

        if (screenStreamRef.current) {
            stopStreamTracks(screenStreamRef.current);
            screenStreamRef.current = null;
        }

        peersRef.current.forEach((peer, userId) => {
            peer.close();
        });
        peersRef.current.clear();
        setRemoteStreams(new Map());

        if (socketRef.current && roomId) {
            socketRef.current.emit('leaveRoom', { roomId, userId: user._id });
        }

        setIsInRoom(false);
        setRoomId('');
        setInputRoomId('');
        setParticipants([]);
        setStream(null);
        setMessages([]);
        setHasMedia(false);
        setPeerStates(new Map());
        setError(null);
        setMediaError(null);
        setIsScreenSharing(false);
        pendingCandidatesRef.current.clear();
        makingOfferRef.current.clear();
        ignoreOfferRef.current.clear();
        initiatorsRef.current.clear();
    };

    const toggleMute = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (isScreenSharing) return; // Cannot toggle video while screen sharing

        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                logger.log("Starting screen share...");
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: "always" },
                    audio: false // Usually better to separate audio, or keep mic audio
                });

                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace video track in all peers
                peersRef.current.forEach(peer => {
                    const sender = peer.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                });

                // Update local preview
                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = screenStream;
                }
                setStream(screenStream); // Update state stream to reflect screen share

                setIsScreenSharing(true);
                setIsVideoOff(false); // Screen share is technically "video on"

                // Handle system "Stop sharing" button
                screenTrack.onended = () => {
                    stopScreenShare();
                };

            } catch (err) {
                logger.error("Error starting screen share:", err);
                // User probably cancelled
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = useCallback(() => {
        logger.log("Stopping screen share...");
        if (screenStreamRef.current) {
            stopStreamTracks(screenStreamRef.current);
            screenStreamRef.current = null;
        }

        // Revert to camera
        const cameraStream = streamRef.current;
        if (cameraStream) {
            const cameraTrack = cameraStream.getVideoTracks()[0];

            // If camera was off before, we should respect that, but usually coming back from screen share 
            // people expect to see camera. For now, we'll enable it if it exists.
            if (cameraTrack) {
                // Check if we want to respect isVideoOff state?
                // Let's assume we re-enable camera.
                cameraTrack.enabled = !isVideoOff;

                peersRef.current.forEach(peer => {
                    const sender = peer.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(cameraTrack);
                    }
                });

                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = cameraStream;
                }
                setStream(cameraStream);
            }
        }

        setIsScreenSharing(false);
    }, [isVideoOff]);


    const retryConnection = (userId, userName) => {
        logger.log(`Retrying connection to ${userName}...`);

        const existingPeer = peersRef.current.get(userId);
        if (existingPeer) {
            existingPeer.close();
            peersRef.current.delete(userId);
        }

        setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
        });

        setTimeout(() => {
            createPeerConnection(userId, userName, true);
        }, 1000);
    };

    const createPeerConnection = (userId, userName, isInitiator) => {
        if (peersRef.current.has(userId)) {
            logger.log('Peer connection already exists for:', userName);
            return peersRef.current.get(userId);
        }

        logger.log(`Creating ${isInitiator ? 'initiator' : 'receiver'} peer connection for:`, userName);

        const peer = new RTCPeerConnection(ICE_SERVERS);

        peersRef.current.set(userId, peer);
        initiatorsRef.current.set(userId, isInitiator);

        // Add local tracks
        // Important: we need to add the *current* active stream (screen or camera)
        const currentStream = isScreenSharing && screenStreamRef.current ? screenStreamRef.current : streamRef.current;

        if (currentStream) {
            currentStream.getTracks().forEach(track => {
                peer.addTrack(track, currentStream);
            });
        }

        peer.onconnectionstatechange = () => {
            logger.log(`Peer connection state for ${userName}:`, peer.connectionState);
            setPeerStates(prev => new Map(prev).set(userId, peer.connectionState));

            if (peer.connectionState === 'failed') {
                logger.log(`Connection failed for ${userName}, will retry...`);
                // Auto-retry is good, but aggressive retries can cause loops.
                // We'll leave the manual retry UI or this delayed retry.
            } else if (peer.connectionState === 'disconnected') {
                logger.log(`Connection disconnected for ${userName}`);
                // Don't immediately close, wait to see if it recovers or if user left
            } else if (peer.connectionState === 'connected') {
                logger.log(`Successfully connected to ${userName}`);
                setError(null);
            }
        };

        peer.oniceconnectionstatechange = () => {
            logger.log(`ICE connection state for ${userName}:`, peer.iceConnectionState);
            if (peer.iceConnectionState === 'failed') {
                logger.log(`ICE connection failed for ${userName}, attempting ICE restart`);
                peer.restartIce();
            }
        };

        peer.onnegotiationneeded = async () => {
            try {
                const makingOffer = makingOfferRef.current.get(userId);
                if (makingOffer) return;

                // Only negotiate if we have a stable connection or if we are the initiator
                // This logic is simplified; for robust perfect negotiation see MDN
                if (socketRef.current && peer.signalingState === 'stable') {
                    logger.log(`Negotiation needed for ${userName}, creating offer`);
                    makingOfferRef.current.set(userId, true);

                    const offer = await peer.createOffer();

                    if (peer.signalingState !== 'stable') {
                        makingOfferRef.current.set(userId, false);
                        return;
                    }

                    await peer.setLocalDescription(offer);
                    socketRef.current.emit('sendOffer', {
                        to: userId,
                        offer: peer.localDescription,
                        roomId: roomIdRef.current
                    });
                }
            } catch (err) {
                logger.error(`Error during renegotiation for ${userName}:`, err);
                makingOfferRef.current.set(userId, false);
            } finally {
                makingOfferRef.current.set(userId, false);
            }
        };

        peer.ontrack = (event) => {
            logger.log('Received remote track from:', userName, 'kind:', event.track.kind);
            setRemoteStreams(prev => new Map(prev).set(userId, {
                stream: event.streams[0],
                name: userName
            }));
        };

        peer.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('sendIceCandidate', {
                    to: userId,
                    candidate: event.candidate,
                    roomId: roomIdRef.current
                });
            }
        };

        return peer;
    };

    useEffect(() => {
        if (!socketRef.current) return;

        const socket = socketRef.current;

        const handleRoomJoined = ({ participants }) => {
            if (!isInRoomRef.current) return;
            logger.log('Successfully joined room with participants:', participants);
            setParticipants(participants);
            setError(null);

            participants.forEach(p => {
                if (p.id !== user._id) {
                    logger.log('Creating peer connection for existing user:', p.name);
                    createPeerConnection(p.id, p.name, true);
                }
            });
        };

        const handleUserJoinedRoom = ({ userId, userName, participants: roomParticipants }) => {
            if (!isInRoomRef.current) return;
            logger.log('User joined:', userName, 'Total participants:', roomParticipants.length);
            setParticipants(roomParticipants);
            // We don't initiate here; the JOINING user initiates connections to existing users typically?
            // Wait, in the 'handleRoomJoined' above, we initiate to *everyone already there*.
            // So if I am already in the room, and someone new joins:
            // The new person receives 'roomJoined' and initiates to me.
            // I receive 'userJoinedRoom'. I should WAIT for their offer.
            // So I do NOT createPeerConnection here.
        };

        const handleUserLeftRoom = ({ userId, participants: roomParticipants }) => {
            if (!isInRoomRef.current) return;
            logger.log('User left:', userId);
            setParticipants(roomParticipants);

            const peer = peersRef.current.get(userId);
            if (peer) {
                peer.close();
                peersRef.current.delete(userId);
            }

            setRemoteStreams(prev => {
                const newMap = new Map(prev);
                newMap.delete(userId);
                return newMap;
            });

            setPeerStates(prev => {
                const newMap = new Map(prev);
                newMap.delete(userId);
                return newMap;
            });

            initiatorsRef.current.delete(userId);
            makingOfferRef.current.delete(userId);
            ignoreOfferRef.current.delete(userId);
        };

        const handleReceiveOffer = async ({ from, fromName, offer }) => {
            if (!isInRoomRef.current) return;
            logger.log('Received offer from:', fromName);

            let peer = peersRef.current.get(from);

            try {
                if (peer) {
                    const isLocalInitiator = initiatorsRef.current.get(from) || false;
                    const makingOffer = makingOfferRef.current.get(from) || false;
                    const offerCollision = makingOffer || peer.signalingState !== 'stable';

                    if (offerCollision) {
                        // Glare handling
                        if (isLocalInitiator) {
                            logger.log('Ignoring offer collision (we are initiator) for:', fromName);
                            return;
                        }
                        logger.log('Rolling back local description to accept offer from:', fromName);
                        await peer.setLocalDescription({ type: 'rollback' });
                    }
                } else {
                    peer = createPeerConnection(from, fromName, false);
                }

                await peer.setRemoteDescription(new RTCSessionDescription(offer));

                const pending = pendingCandidatesRef.current.get(from) || [];
                if (pending.length > 0) {
                    logger.log(`Applying ${pending.length} buffered ICE candidates for ${fromName}`);
                    for (const candidate of pending) {
                        try {
                            await peer.addIceCandidate(new RTCIceCandidate(candidate));
                        } catch (e) {
                            logger.error('Error adding buffered ICE candidate:', e);
                        }
                    }
                    pendingCandidatesRef.current.delete(from);
                }

                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);

                socket.emit('sendAnswer', {
                    to: from,
                    answer: peer.localDescription,
                    roomId: roomIdRef.current
                });
            } catch (err) {
                logger.error('Error handling offer:', err);
                setError(`Failed to connect with ${fromName}`);
            }
        };

        const handleReceiveAnswer = async ({ from, answer }) => {
            if (!isInRoomRef.current) return;
            logger.log('Received answer from:', from);
            const peer = peersRef.current.get(from);

            if (peer) {
                try {
                    if (peer.signalingState === 'have-local-offer') {
                        await peer.setRemoteDescription(new RTCSessionDescription(answer));

                        const pending = pendingCandidatesRef.current.get(from) || [];
                        if (pending.length > 0) {
                            for (const candidate of pending) {
                                try {
                                    await peer.addIceCandidate(new RTCIceCandidate(candidate));
                                } catch (e) {
                                    logger.error('Error adding buffered ICE candidate:', e);
                                }
                            }
                            pendingCandidatesRef.current.delete(from);
                        }
                    }
                } catch (err) {
                    logger.error('Error setting remote description:', err);
                }
            }
        };

        const handleReceiveIceCandidate = async ({ from, candidate }) => {
            if (!isInRoomRef.current) return;
            const peer = peersRef.current.get(from);

            if (peer && peer.remoteDescription && peer.remoteDescription.type) {
                try {
                    await peer.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    logger.error('Error adding ICE candidate:', err);
                }
            } else {
                if (!pendingCandidatesRef.current.has(from)) {
                    pendingCandidatesRef.current.set(from, []);
                }
                pendingCandidatesRef.current.get(from).push(candidate);
            }
        };

        const handleRoomMessage = ({ message }) => {
            if (!isInRoomRef.current) return;
            setMessages(prev => [...prev, message]);
            if (!showChat) {
                setUnreadCount(prev => prev + 1);
            }
        };

        socket.on('roomJoined', handleRoomJoined);
        socket.on('userJoinedRoom', handleUserJoinedRoom);
        socket.on('userLeftRoom', handleUserLeftRoom);
        socket.on('receiveOffer', handleReceiveOffer);
        socket.on('receiveAnswer', handleReceiveAnswer);
        socket.on('receiveIceCandidate', handleReceiveIceCandidate);
        socket.on('roomMessage', handleRoomMessage);

        return () => {
            socket.off('roomJoined', handleRoomJoined);
            socket.off('userJoinedRoom', handleUserJoinedRoom);
            socket.off('userLeftRoom', handleUserLeftRoom);
            socket.off('receiveOffer', handleReceiveOffer);
            socket.off('receiveAnswer', handleReceiveAnswer);
            socket.off('receiveIceCandidate', handleReceiveIceCandidate);
            socket.off('roomMessage', handleRoomMessage);
        };
    }, [socketConnected, user._id, toggleScreenShare]); // Added toggleScreenShare if used inside, but it's not.

    useEffect(() => {
        if (showChat) {
            setUnreadCount(0);
        }
    }, [showChat]);

    useEffect(() => {
        return () => {
            logger.log('Component unmounting, cleaning up...');

            if (isInRoomRef.current && socketRef.current && roomIdRef.current) {
                socketRef.current.emit('leaveRoom', {
                    roomId: roomIdRef.current,
                    userId: user._id
                });
            }

            if (streamRef.current) {
                stopStreamTracks(streamRef.current);
            }
            if (screenStreamRef.current) {
                stopStreamTracks(screenStreamRef.current);
            }

            peersRef.current.forEach((peer) => {
                peer.close();
            });
            peersRef.current.clear();
        };
    }, []);

    return {
        user,
        socketConnected,
        roomId,
        setRoomId,
        inputRoomId,
        setInputRoomId,
        isInRoom,
        copied,
        copyRoomId,
        participants,
        stream,
        remoteStreams,
        isMuted,
        toggleMute,
        isVideoOff,
        toggleVideo,
        isScreenSharing,
        toggleScreenShare,
        hasMedia,
        enableMedia,
        messages,
        messageInput,
        setMessageInput,
        sendMessage,
        unreadCount,
        setUnreadCount,
        showChat,
        setShowChat,
        peerStates,
        retryConnection,
        isJoining,
        joinRoom,
        isCreating,
        createRoom,
        leaveRoom,
        error,
        setError,
        mediaError,
        setMediaError,
        socketError,
        setSocketError,
        myVideoRef,
        messagesEndRef
    };
};
