/**
 * WebRTC Configuration
 * 
 * Note for Production: STUN servers only handle NAT discovery. To ensure 100% 
 * call connectivity across all networks (corporate firewalls, symmetric NAT), 
 * you should add TURN servers here.
 */

export const ICE_SERVERS = {
    iceServers: [
        // STUN servers — for NAT discovery
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // Free TURN servers (OpenRelay) — relay traffic through symmetric NAT / firewalls
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
        {
            urls: 'turns:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
    ],
    iceCandidatePoolSize: 10,
};

export const WEBRTC_TIMEOUT = 20000; // 20 seconds before we consider a connection failed

export default ICE_SERVERS;
