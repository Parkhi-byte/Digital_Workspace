import React, { useState } from 'react';
import { Send, Paperclip, Smile, MessageCircle, Search, MoreVertical, Phone, Video, Info } from 'lucide-react';

const Chat = () => {
  const [message, setMessage] = useState('');

  const messages = [
    { id: 1, text: "Hey team! How's the project going?", sender: "Satyam Katiyar", time: "10:30 AM", isMe: false },
    { id: 2, text: "Going great! Just finished the UI components.", sender: "Prachi Gangwar", time: "10:32 AM", isMe: false },
    { id: 3, text: "Awesome! I'll start integrating the backend then.", sender: "You", time: "10:33 AM", isMe: true },
    { id: 4, text: "Perfect. Let's sync up later today.", sender: "Satyam Katiyar", time: "10:35 AM", isMe: false },
  ];

  const handleSend = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-aurora-500/20 text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {['Team Workspace', 'Design Team', 'Engineering', 'General'].map((chat, i) => (
            <div key={i} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${i === 0 ? 'bg-aurora-50 dark:bg-aurora-900/20 border-l-4 border-aurora-500' : ''}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'][i]
                  }`}>
                  {chat[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{chat}</h3>
                    <span className="text-xs text-gray-500">10:30 AM</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Latest message preview goes here...</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
              T
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Team Workspace</h2>
              <p className="text-xs text-green-500 flex items-center font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                3 online
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Phone size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Video size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Info size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[70%] ${msg.isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white font-medium ${msg.isMe ? 'bg-aurora-600' : 'bg-gray-400'
                  }`}>
                  {msg.sender[0]}
                </div>
                <div>
                  <div className={`flex items-baseline space-x-2 mb-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{msg.sender}</span>
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.isMe
                      ? 'bg-aurora-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto flex items-end space-x-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-aurora-500/20 focus-within:border-aurora-500 transition-all">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Paperclip size={20} />
            </button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Smile size={20} />
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`p-2 rounded-xl transition-all duration-200 ${message.trim()
                  ? 'bg-aurora-600 text-white shadow-md hover:bg-aurora-700 transform hover:scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">Press Enter to send, Shift + Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;