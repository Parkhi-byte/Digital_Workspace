import React, { useState } from 'react';
import { Send, Paperclip, Smile, MessageCircle } from 'lucide-react';

const Chat = () => {
  const [message, setMessage] = useState('');

  const messages = [
    { id: 1, text: "Hey team! How's the project going?", sender: "Satyam Katiyar", time: "10:30 AM" },
    { id: 2, text: "Going great! Just finished the UI components.", sender: "Prachi Gangwar", time: "10:32 AM" },
    { id: 3, text: "Awesome! I'll start integrating the backend then.", sender: "Sneha Gangwar", time: "10:33 AM" },
  ];

  const handleSend = () => {
    if (message.trim()) {
      // Handle send message
      setMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl animate-float">
            <MessageCircle size={32} className="text-white" strokeWidth={2} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Team Chat</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Real-time messaging with your team</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Workspace</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">3 participants online</p>
            </div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-white dark:bg-gray-800">
          {messages.map((msg) => (
            <div key={msg.id} className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{msg.sender}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{msg.time}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700">
          <div className="flex space-x-2">
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <Paperclip size={20} />
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <Smile size={20} />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;