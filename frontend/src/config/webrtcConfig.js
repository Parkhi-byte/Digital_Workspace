/**
 * WebRTC Configuration
 * 
 * Note for Production: STUN servers only handle NAT discovery. To ensure 100% 
 * call connectivity across all networks (corporate firewalls, symmetric NAT), 
 * you should add TURN servers here.
 */

export const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        // --- ADD TURN SERVERS BELOW ---
        // {
        //     urls: 'turn:YOUR_TURN_SERVER_DOMAIN:3478',
        //     username: 'YOUR_USERNAME',
        //     credential: 'YOUR_PASSWORD'
        // }
    ],
    iceCandidatePoolSize: 10,
};

export const WEBRTC_TIMEOUT = 20000; // 20 seconds before we consider a connection failed

export default ICE_SERVERS;
