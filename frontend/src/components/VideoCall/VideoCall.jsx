import React, { useState, useEffect } from 'react';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff, Phone,
    Monitor, MonitorOff, Maximize2, Minimize2, X
} from 'lucide-react';
import { useDirectCall } from '../../hooks/useVideoCall/useDirectCall';
import { useChatContext } from '../../context/ChatContext';

// ── Call Timer ──────────────────────────────────────────────────────────────
const CallTimer = ({ startTime }) => {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        if (!startTime) return;
        const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [startTime]);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    return <span className="tabular-nums">{m}:{s}</span>;
};

// ── Incoming Call Screen ────────────────────────────────────────────────────
const IncomingCall = ({ callerName, isVideoCall, onAnswer, onDecline }) => (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <div className="w-full max-w-sm bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            {/* Animated ring */}
            <div className="relative flex justify-center pt-12 pb-2">
                <div className="absolute w-40 h-40 rounded-full bg-green-500/10 animate-ping" />
                <div className="absolute w-32 h-32 rounded-full bg-green-500/15 animate-ping [animation-delay:0.3s]" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                    {callerName?.[0]?.toUpperCase() || '?'}
                </div>
            </div>

            <div className="text-center px-6 pb-2 pt-4">
                <h2 className="text-2xl font-bold text-white mb-1 truncate">{callerName}</h2>
                <p className="text-gray-400 text-sm flex items-center justify-center gap-1.5">
                    {isVideoCall ? <Video size={14} /> : <Phone size={14} />}
                    {isVideoCall ? 'Incoming video call…' : 'Incoming audio call…'}
                </p>
            </div>

            <div className="flex items-center justify-around px-10 py-8">
                {/* Decline */}
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={onDecline}
                        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-xl shadow-red-600/40 active:scale-95 transition-all"
                        aria-label="Decline call"
                    >
                        <PhoneOff size={26} />
                    </button>
                    <span className="text-xs text-gray-400">Decline</span>
                </div>

                {/* Accept */}
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={onAnswer}
                        className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-xl shadow-green-500/40 active:scale-95 transition-all"
                        aria-label="Accept call"
                    >
                        {isVideoCall ? <Video size={26} /> : <Phone size={26} />}
                    </button>
                    <span className="text-xs text-gray-400">Accept</span>
                </div>
            </div>
        </div>
    </div>
);

// ── Connection Badge ────────────────────────────────────────────────────────
const ConnectionBadge = ({ state }) => {
    const config = {
        calling: { color: 'bg-yellow-500', label: 'Calling…' },
        incoming: { color: 'bg-blue-500', label: 'Incoming' },
        initializing: { color: 'bg-gray-500', label: 'Initializing…' },
        connecting: { color: 'bg-yellow-500', label: 'Connecting…' },
        connected: { color: 'bg-green-500', label: 'Connected' },
        failed: { color: 'bg-red-500', label: 'Connection Lost' },
        disconnected: { color: 'bg-red-500', label: 'Disconnected' },
    };
    const { color, label } = config[state] || { color: 'bg-gray-500', label: state };
    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-black/40 backdrop-blur`}>
            <span className={`w-2 h-2 rounded-full ${color} ${state === 'connected' ? '' : 'animate-pulse'}`} />
            {label}
        </span>
    );
};

// ── Active Call UI ──────────────────────────────────────────────────────────
const ActiveCall = ({
    callerName, isVideoCall, callAccepted, connectionState, startTime,
    stream, remoteStream, isMuted, isVideoOff, isScreenSharing, mediaError,
    myVideoRef, userVideoRef,
    toggleMute, toggleVideo, toggleScreenShare, leaveCall, getMedia,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { user } = useChatContext();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm">
            <div className={`relative flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 shadow-2xl transition-all duration-300
                ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full h-full sm:w-[95vw] sm:h-[92vh] sm:max-w-6xl sm:rounded-2xl sm:overflow-hidden'}`}>

                {/* Header bar */}
                <div className="absolute top-0 inset-x-0 z-20 flex items-start justify-between p-4 sm:p-6 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
                    <div className="pointer-events-auto">
                        <p className="text-white font-bold text-lg sm:text-xl leading-tight">
                            {callerName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <ConnectionBadge state={connectionState} />
                            {isVideoCall
                                ? <span className="flex items-center gap-1 text-xs text-gray-300 bg-black/40 backdrop-blur px-2.5 py-1 rounded-full"><Video size={12} />Video</span>
                                : <span className="flex items-center gap-1 text-xs text-gray-300 bg-black/40 backdrop-blur px-2.5 py-1 rounded-full"><Phone size={12} />Audio</span>
                            }
                            {callAccepted && connectionState === 'connected' && startTime && (
                                <span className="text-xs text-white bg-black/40 backdrop-blur px-2.5 py-1 rounded-full">
                                    <CallTimer startTime={startTime} />
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button
                            onClick={() => setIsFullscreen(f => !f)}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <button
                            onClick={leaveCall}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-all"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">

                    {/* Remote Media Element (handles both video and audio) */}
                    {callAccepted && remoteStream && (
                        <video
                            ref={(node) => {
                                userVideoRef.current = node;
                                if (node && node.srcObject !== remoteStream) {
                                    node.srcObject = remoteStream;
                                    node.play().catch(e => console.error("Autoplay failed:", e));
                                }
                            }}
                            autoPlay
                            playsInline
                            className={isVideoCall ? "absolute inset-0 w-full h-full object-cover" : "opacity-0 absolute w-px h-px pointer-events-none"}
                        />
                    )}

                    {/* Center avatar / status (shown before connection or audio-only) */}
                    {(!callAccepted || !isVideoCall || !remoteStream) && !mediaError && (
                        <div className="relative z-10 flex flex-col items-center text-white select-none px-6 text-center">
                            {/* Animated rings while waiting for answer */}
                            {!callAccepted && (
                                <>
                                    <div className="absolute w-52 h-52 rounded-full bg-indigo-500/10 animate-ping" style={{ animationDuration: '1.5s' }} />
                                    <div className="absolute w-40 h-40 rounded-full bg-indigo-500/15 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.35s' }} />
                                </>
                            )}
                            <div className="relative w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-5xl sm:text-6xl font-bold shadow-2xl mb-6">
                                {callerName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <p className="text-xl sm:text-2xl font-semibold mb-1">{callerName}</p>
                            <p className="text-gray-400 text-sm mb-8">
                                {!callAccepted
                                    ? (connectionState === 'calling' ? 'Ringing…' : 'Initializing call…')
                                    : isVideoCall
                                        ? 'Waiting for remote video…'
                                        : 'Call in progress'}
                            </p>
                            {/* Cancel button — visible to caller while waiting for answer */}
                            {!callAccepted && connectionState === 'calling' && (
                                <button
                                    onClick={leaveCall}
                                    className="flex flex-col items-center gap-2 group"
                                    aria-label="Cancel call"
                                >
                                    <span className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-xl shadow-red-600/40 active:scale-95 transition-all">
                                        <PhoneOff size={24} className="text-white" />
                                    </span>
                                    <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">Cancel</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Media error */}
                    {mediaError && (
                        <div className="relative z-10 flex flex-col items-center text-center text-white max-w-sm px-6">
                            <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-5">
                                <VideoOff size={36} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Media Error</h3>
                            <p className="text-gray-300 text-sm mb-6 leading-relaxed">{mediaError}</p>
                            <div className="flex gap-3">
                                <button onClick={leaveCall} className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-sm font-medium transition-all">Cancel</button>
                                <button onClick={getMedia} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-medium transition-all">Retry</button>
                            </div>
                        </div>
                    )}

                    {/* My video (PiP) */}
                    {isVideoCall && stream && !mediaError && (
                        <div className="absolute bottom-24 right-4 z-30 w-36 sm:w-52 aspect-video rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-900 hover:scale-105 transition-transform group">
                            {isVideoOff ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold mb-1">
                                        {user?.name?.[0]?.toUpperCase() || 'Y'}
                                    </div>
                                    <p className="text-xs text-gray-400">Camera Off</p>
                                </div>
                            ) : (
                                <video
                                    ref={(node) => {
                                        myVideoRef.current = node;
                                        if (node && stream && node.srcObject !== stream) {
                                            node.srcObject = stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover [transform:scaleX(-1)]"
                                />
                            )}
                            <div className="absolute top-1.5 left-2 text-[10px] text-white bg-black/50 rounded px-1.5 py-0.5 font-medium">
                                You
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls bar */}
                <div className="relative z-20 h-20 sm:h-24 bg-gradient-to-t from-black via-gray-900/90 to-transparent flex items-center justify-center gap-3 sm:gap-5 px-6 border-t border-white/5">

                    {/* Mute */}
                    <ControlButton
                        active={isMuted}
                        activeClass="bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40"
                        inactiveClass="bg-white/10 hover:bg-white/20 border border-white/10"
                        onClick={toggleMute}
                        title={isMuted ? 'Unmute' : 'Mute'}
                        disabled={!stream}
                    >
                        {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                    </ControlButton>

                    {/* Video toggle (video calls only) */}
                    {isVideoCall && (
                        <ControlButton
                            active={isVideoOff}
                            activeClass="bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40"
                            inactiveClass="bg-white/10 hover:bg-white/20 border border-white/10"
                            onClick={toggleVideo}
                            title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                            disabled={!stream}
                        >
                            {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                        </ControlButton>
                    )}

                    {/* Screen share (video calls only) */}
                    {isVideoCall && (
                        <ControlButton
                            active={isScreenSharing}
                            activeClass="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/40"
                            inactiveClass="bg-white/10 hover:bg-white/20 border border-white/10"
                            onClick={toggleScreenShare}
                            title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                            disabled={!stream}
                        >
                            {isScreenSharing ? <MonitorOff size={22} /> : <Monitor size={22} />}
                        </ControlButton>
                    )}

                    {/* End call */}
                    <button
                        onClick={leaveCall}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 active:scale-95 transition-all ml-2"
                        aria-label="End call"
                        title="End Call"
                    >
                        <PhoneOff size={26} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Small reusable control button ───────────────────────────────────────────
const ControlButton = ({ active, activeClass, inactiveClass, onClick, title, disabled, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${active ? activeClass : inactiveClass}`}
        title={title}
    >
        {children}
    </button>
);

// ── Root VideoCall component (used as global overlay in Layout.jsx) ──────────
const VideoCall = ({
    isIncoming,
    callerSignal,
    callerName,
    callerId,
    userToCall,
    iceCandidates,
    onEndCall,
    onAnswer,
    isVideoCall = true,
}) => {
    const [isAnswering, setIsAnswering] = useState(false);
    const call = useDirectCall({
        isIncoming,
        callerSignal,
        callerId,
        userToCall,
        iceCandidates,
        onEndCall,
        isVideoCall,
    });

    // Show incoming ring screen before user answers
    if (isIncoming && !call.callAccepted && !call.callEnded && !isAnswering) {
        return (
            <IncomingCall
                callerName={callerName}
                isVideoCall={isVideoCall}
                onAnswer={() => {
                    setIsAnswering(true);
                    onAnswer?.();     // update ChatContext callAccepted state
                    call.answerCall();
                }}
                onDecline={call.leaveCall}
            />
        );
    }

    return (
        <ActiveCall
            callerName={callerName}
            isVideoCall={isVideoCall}
            {...call}
        />
    );
};

export default VideoCall;
