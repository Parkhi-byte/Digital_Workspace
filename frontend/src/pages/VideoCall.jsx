import React, { useState } from 'react';
import { Video, Users, ScreenShare, Mic, MicOff, VideoOff, Phone, MoreVertical, MessageCircle, UserPlus, Settings, Layout } from 'lucide-react';

const VideoCall = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const participants = [
    { name: "You", role: "Host", isSpeaking: true, videoOn: true },
    { name: "Satyam Katiyar", role: "Co-host", isSpeaking: false, videoOn: true },
    { name: "Prachi Gangwar", role: "Participant", isSpeaking: true, videoOn: false },
    { name: "Sneha Gangwar", role: "Participant", isSpeaking: false, videoOn: true },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-6">
      <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Video size={24} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Weekly Sync</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>04:22</span>
                <span>•</span>
                <span>4 Participants</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 border border-gray-700">
              <UserPlus size={16} />
              <span className="hidden sm:inline">Invite</span>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors border border-gray-700">
              <Layout size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          {/* Main Video Grid */}
          <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
            <div className="flex-1 grid grid-cols-2 gap-4 auto-rows-fr">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className={`relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl ${participant.isSpeaking ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''
                    }`}
                >
                  {participant.videoOn ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold shadow-lg">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                        <VideoOff size={32} className="text-gray-500" />
                      </div>
                    </div>
                  )}

                  {/* Overlay Info */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white drop-shadow-md">{participant.name}</span>
                      {participant.role === 'Host' && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">Host</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!participant.videoOn && <VideoOff size={14} className="text-red-400" />}
                      {isMuted && <MicOff size={14} className="text-red-400" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Controls Bar */}
            <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-300">
                  854-729-163
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-xl transition-all duration-200 ${isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-gray-700/50 text-white hover:bg-gray-600'
                    }`}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-4 rounded-xl transition-all duration-200 ${isVideoOff ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-gray-700/50 text-white hover:bg-gray-600'
                    }`}
                >
                  {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>
                <button className="p-4 bg-gray-700/50 text-white rounded-xl hover:bg-gray-600 transition-all duration-200">
                  <ScreenShare size={20} />
                </button>
                <button className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-red-500/20">
                  <Phone size={20} />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors">
                  <Settings size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:flex flex-col gap-4">
            {/* Participants List */}
            <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center justify-between">
                <span>Participants</span>
                <span className="bg-gray-700 text-xs px-2 py-0.5 rounded-full">4</span>
              </h3>
              <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-700/50 rounded-lg group transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-200">{participant.name}</div>
                        <div className="text-xs text-gray-500">{participant.role}</div>
                      </div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-gray-600 rounded">
                        <MicOff size={12} className="text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-600 rounded">
                        <MoreVertical size={12} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Preview */}
            <div className="h-1/3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">In-call Messages</h3>
              <div className="flex-1 bg-gray-900/50 rounded-xl p-3 mb-3 overflow-y-auto text-sm space-y-3">
                <div className="text-gray-400 text-center text-xs italic">No messages yet</div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Send a message..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button className="absolute right-2 top-2 text-blue-500 hover:text-blue-400">
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;