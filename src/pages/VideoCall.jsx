import React, { useState } from 'react';
import { Video, Users, ScreenShare, Mic, MicOff, VideoOff, Phone, MoreVertical, MessageCircle, UserPlus } from 'lucide-react';

const VideoCall = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState('meet');

  const participants = [
    { name: "You", role: "Host", isSpeaking: true, videoOn: true },
    { name: "Satyam Katiyar", role: "Co-host", isSpeaking: false, videoOn: true },
    { name: "Prachi Gangwar", role: "Participant", isSpeaking: true, videoOn: false },
    { name: "Sneha Gangwar", role: "Participant", isSpeaking: false, videoOn: true },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl animate-float">
              <Video size={28} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Video Conference</h1>
              <p className="text-gray-400">Team Meeting • 4 participants</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <UserPlus size={18} />
              <span>Invite</span>
            </button>
            <button className="text-gray-400 hover:text-white p-2">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Grid */}
            <div className="grid grid-cols-2 gap-4">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className={`bg-gray-800 rounded-xl aspect-video relative overflow-hidden ${
                    participant.isSpeaking ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {participant.videoOn ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold">
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="font-medium">{participant.name}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <VideoOff size={32} className="text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {participant.name}
                  </div>
                  {participant.role === 'Host' && (
                    <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      {participant.role}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Meeting Info */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Meeting Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Meeting ID</div>
                  <div className="text-white font-mono">854 729 163</div>
                </div>
                <div>
                  <div className="text-gray-400">Duration</div>
                  <div className="text-white">45:22</div>
                </div>
                <div>
                  <div className="text-gray-400">Participants</div>
                  <div className="text-white flex items-center">
                    <Users size={16} className="mr-1" />
                    4/50
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Recording</div>
                  <div className="text-green-400">● Live</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex justify-center space-x-3 mb-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full transition-colors ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>
                <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                  <ScreenShare size={20} />
                </button>
                <button className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                  <Phone size={20} />
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors">
                  More
                </button>
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1">
                  <MessageCircle size={16} />
                  <span>Chat</span>
                </button>
              </div>
            </div>

            {/* Participants List */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Users size={18} className="mr-2" />
                Participants (4)
              </h3>
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-white text-sm">{participant.name}</div>
                        <div className="text-gray-400 text-xs">{participant.role}</div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {participant.isSpeaking && (
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                      {!participant.videoOn && <VideoOff size={14} className="text-gray-400" />}
                      {isMuted && <MicOff size={14} className="text-gray-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm transition-colors">
                  Start Recording
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors">
                  Share Screen
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors">
                  Create Poll
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