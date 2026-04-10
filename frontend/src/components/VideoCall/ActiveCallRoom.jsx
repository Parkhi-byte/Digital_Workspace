import React from 'react';
import { Video, Copy, Check, Users, Phone, AlertCircle, X, Mic, MicOff, VideoOff, MessageSquare, WifiOff, Monitor, MonitorOff } from 'lucide-react';
import RemoteVideo from './RemoteVideo';
import ChatPanel from './ChatPanel';

const ActiveCallRoom = ({
    roomId,
    copied,
    copyRoomId,
    socketConnected,
    participants,
    leaveRoom,
    error,
    socketError,
    mediaError,
    setError,
    setSocketError,
    setMediaError,
    showChat,
    setShowChat,
    remoteStreams,
    hasMedia,
    isVideoOff,
    user,
    enableMedia,
    myVideoRef,
    isMuted,
    toggleMute,
    toggleVideo,
    peerStates,
    retryConnection,
    messages,
    messageInput,
    setMessageInput,
    sendMessage,
    messagesEndRef,
    unreadCount,
    isScreenSharing,
    toggleScreenShare
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 text-gray-900 dark:text-white flex flex-col relative overflow-hidden transition-colors duration-300">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            </div>

            {/* Top Bar */}
            <div className="relative z-10 px-6 py-4">
                <div className="max-w-[1800px] mx-auto">
                    <div className="flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                        <Video size={24} className="text-white" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Room ID</p>
                                    <p className="font-mono font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">{roomId}</p>
                                </div>
                            </div>
                            <button
                                onClick={copyRoomId}
                                className="group px-5 py-2.5 bg-gray-100 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600"
                            >
                                {copied ? (
                                    <>
                                        <Check size={18} className="text-green-500" />
                                        <span className="font-semibold text-green-600 dark:text-green-400">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors" />
                                        <span className="font-semibold text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">Copy</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            {!socketConnected && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-700/50 backdrop-blur-sm">
                                    <WifiOff size={18} className="text-red-500 dark:text-red-400 animate-pulse" />
                                    <span className="text-sm font-medium text-red-600 dark:text-red-300">Reconnecting...</span>
                                </div>
                            )}

                            <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-100 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 backdrop-blur-sm">
                                <Users size={20} className="text-indigo-500 dark:text-indigo-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Participants</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{participants.length}</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {(error || socketError) && (
                        <div className="mt-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-600/50 rounded-xl p-4 backdrop-blur-xl flex items-center gap-3 shadow-lg animate-slide-down">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                            </div>
                            <p className="text-sm text-red-800 dark:text-red-100 flex-1 font-medium">{error || socketError}</p>
                            <button onClick={() => { setError(null); setSocketError(null); }} className="p-2 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-lg transition-all">
                                <X size={18} className="text-red-600 dark:text-red-300" />
                            </button>
                        </div>
                    )}

                    {mediaError && (
                        <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-600/50 rounded-xl p-4 backdrop-blur-xl flex items-center gap-3 shadow-lg animate-slide-down">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <p className="text-sm text-yellow-800 dark:text-yellow-100 flex-1 font-medium">{mediaError}</p>
                            <button onClick={() => setMediaError(null)} className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-800/50 rounded-lg transition-all">
                                <X size={18} className="text-yellow-600 dark:text-yellow-300" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Video Area */}
            <div className="relative z-10 flex-1 px-6 pb-6 overflow-hidden">
                <div className="max-w-[1800px] mx-auto h-full flex gap-4">
                    <div className={`transition-all duration-300 ${showChat ? 'w-full lg:w-2/3' : 'w-full'}`}>
                        <div className={`grid gap-4 h-full ${remoteStreams.size === 0 ? 'grid-cols-1' :
                            remoteStreams.size === 1 ? 'grid-cols-1 md:grid-cols-2' :
                                remoteStreams.size === 2 ? 'grid-cols-1 md:grid-cols-2' :
                                    remoteStreams.size === 3 ? 'grid-cols-2 md:grid-cols-2' :
                                        'grid-cols-2 md:grid-cols-3'
                            }`}>
                            {/* My Video */}
                            <div className="relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border-2 border-indigo-500/50 dark:border-indigo-500/50 shadow-2xl shadow-indigo-500/10 group hover:border-indigo-500 transition-all duration-300 aspect-video">
                                {!hasMedia || isVideoOff ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                        <div className="text-center">
                                            <div className="relative inline-block mb-4">
                                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-indigo-500/30">
                                                    {user?.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                                                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                            <p className="text-gray-900 dark:text-gray-300 font-medium text-lg mb-2">{user?.name}</p>
                                            <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">{!hasMedia ? 'No Camera Available' : 'Camera Off'}</p>
                                            {!hasMedia && (
                                                <button onClick={enableMedia} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl text-white text-sm font-semibold transition-all flex items-center gap-2 mx-auto shadow-lg shadow-indigo-500/30">
                                                    <Video size={18} />
                                                    Enable Camera
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <video ref={myVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!isScreenSharing ? 'mirror' : ''}`} />
                                )}
                                <div className="absolute bottom-4 left-4 px-4 py-2 bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-xl flex items-center gap-3 border border-gray-200/50 dark:border-white/10 shadow-lg">
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                                    <span className="font-bold text-gray-900 dark:text-white">You</span>
                                </div>
                                {hasMedia && (
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        {isMuted && (
                                            <div className="p-2 bg-red-500/90 backdrop-blur-sm rounded-lg shadow-lg">
                                                <MicOff size={16} className="text-white" />
                                            </div>
                                        )}
                                        {isVideoOff && (
                                            <div className="p-2 bg-red-500/90 backdrop-blur-sm rounded-lg shadow-lg">
                                                <VideoOff size={16} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {participants.filter(p => p.id !== user._id).map((participant) => {
                                const remoteStreamData = remoteStreams.get(participant.id);
                                return (
                                    <RemoteVideo
                                        key={participant.id}
                                        userId={participant.id}
                                        stream={remoteStreamData?.stream}
                                        name={participant.name}
                                        connectionState={peerStates.get(participant.id)}
                                        onRetry={() => retryConnection(participant.id, participant.name)}
                                    />
                                );
                            })}

                            {participants.length <= 1 && (
                                <div className="relative bg-white/50 dark:bg-gray-800/50 rounded-3xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center backdrop-blur-sm aspect-video">
                                    <div className="text-center px-8">
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-200 dark:border-gray-600">
                                            <Users size={40} className="text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-semibold text-lg mb-2">Waiting for participants...</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">Share the room ID to invite others</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <ChatPanel
                        showChat={showChat}
                        setShowChat={setShowChat}
                        messages={messages}
                        user={user}
                        messageInput={messageInput}
                        setMessageInput={setMessageInput}
                        sendMessage={sendMessage}
                        messagesEndRef={messagesEndRef}
                    />
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 p-6 pt-0">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl flex items-center justify-center gap-6">
                        <button
                            onClick={toggleMute}
                            className={`p-5 rounded-2xl transition-all duration-300 shadow-lg ${isMuted
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white'
                                }`}
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        <button
                            onClick={toggleVideo}
                            className={`p-5 rounded-2xl transition-all duration-300 shadow-lg ${isVideoOff
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white'
                                }`}
                            title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                        >
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </button>

                        <button
                            onClick={toggleScreenShare}
                            className={`p-5 rounded-2xl transition-all duration-300 shadow-lg ${isScreenSharing
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white'
                                }`}
                            title={isScreenSharing ? "Stop Sharing" : "Screen Share"}
                        >
                            {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
                        </button>

                        <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>

                        <button
                            onClick={() => setShowChat(!showChat)}
                            className={`group relative p-5 rounded-2xl transition-all duration-300 shadow-lg ${showChat
                                ? 'bg-indigo-600 text-white shadow-indigo-500/30'
                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white'
                                }`}
                            title="Chat"
                        >
                            <MessageSquare size={24} />
                            {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                    <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                                </div>
                            )}
                        </button>

                        <button
                            onClick={leaveRoom}
                            className="p-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-2xl text-white transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105"
                            title="Leave Call"
                        >
                            <Phone size={24} className="rotate-135" />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-slide-down { animation: slide-down 0.3s ease-out; }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
                .animate-fade-in { animation: fade-in 0.2s ease-out; }
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.5); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.7); }
                .mirror { transform: scaleX(-1); }
             `}</style>
        </div>
    );
};

export default ActiveCallRoom;
