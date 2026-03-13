
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Paperclip, Smile, Phone, Video, Info, X, CheckCheck, Plus } from 'lucide-react';
import Picker from 'emoji-picker-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';

const ChatWindow = ({ activeChat, messages, message, setMessage, handleTyping, handleSend, onlineCount, isTyping, onFileUpload, renameGroup, addToGroup, removeFromGroup, chatsData, searchUsers, currentUser, isLoadingHistory, isUploadingFile, handleStartCall }) => {
    const [showEmoji, setShowEmoji] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [infoSearchResults, setInfoSearchResults] = useState([]);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const onEmojiClick = (emojiObject) => {
        setMessage(prev => prev + emojiObject.emoji);
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileUpload(file);
        }
        // Reset input
        e.target.value = '';
    };

    const isGroupChat = chatsData[activeChat]?.type === 'group';

    const startCall = (isVideo = true) => {
        if (isGroupChat) {
            toast.info('Group calls are coming soon!');
            return;
        }
        // currentUser._id (MongoDB) or currentUser.id (some JWT payloads)
        const myId = currentUser?._id || currentUser?.id;
        const otherUser = chatsData[activeChat]?.users?.find(
            u => (u._id || u.id) !== myId
        );
        if (otherUser) {
            handleStartCall(otherUser._id || otherUser.id, otherUser.name, isVideo);
        } else {
            toast.error('Could not identify the other user in this chat.');
        }
    };

    // Helper to format date groups
    const groupMessagesByDate = (msgs) => {
        const groups = {};
        msgs.forEach(msg => {
            // Use 'fullTime' (raw date) from updated hook, fallback to current time if missing
            const msgDate = msg.fullTime ? new Date(msg.fullTime) : new Date();

            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateLabel = msgDate.toLocaleDateString();

            if (msgDate.toDateString() === today.toDateString()) {
                dateLabel = 'Today';
            } else if (msgDate.toDateString() === yesterday.toDateString()) {
                dateLabel = 'Yesterday';
            } else {
                dateLabel = msgDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            }

            if (!groups[dateLabel]) {
                groups[dateLabel] = [];
            }
            groups[dateLabel].push(msg);
        });
        return groups;
    };

    // Memoize grouped messages to prevent recalculation on every render
    const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

    if (!activeChat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
                <div className="w-24 h-24 bg-aurora-100 dark:bg-aurora-900/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Send size={40} className="text-aurora-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Welcome to Aurora Chat</h3>
                <p className="text-sm text-gray-400">Select a conversation to start messaging</p>
            </div>
        );
    }

    const activeChatName = chatsData[activeChat]?.name || 'Chat';

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 relative">
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-gray-800">
                        {activeChatName[0]}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{activeChatName}</h2>
                        {chatsData[activeChat]?.type === 'group' && chatsData[activeChat]?.users?.length > 0 ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[200px] sm:max-w-md">
                                {chatsData[activeChat].users.map(u => u.name).join(', ')}
                            </p>
                        ) : (
                            <p className="text-xs text-green-500 flex items-center font-medium">
                                <span className="relative flex h-2 w-2 mr-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                {onlineCount || 1} online
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                    <button
                        onClick={() => startCall(false)}
                        className={`p-2.5 rounded-full transition-colors ${isGroupChat ? 'opacity-40 cursor-not-allowed text-gray-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                        aria-label="Start voice call"
                        title={isGroupChat ? 'Group calls coming soon' : 'Start voice call'}
                    >
                        <Phone size={20} />
                    </button>
                    <button
                        onClick={() => startCall(true)}
                        className={`p-2.5 rounded-full transition-colors ${isGroupChat ? 'opacity-40 cursor-not-allowed text-gray-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                        aria-label="Start video call"
                        title={isGroupChat ? 'Group calls coming soon' : 'Start video call'}
                    >
                        <Video size={20} />
                    </button>
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className={`p-2.5 rounded-full transition-colors ${showInfo ? 'bg-aurora-100 dark:bg-aurora-900/30 text-aurora-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                        aria-label={showInfo ? 'Hide chat info' : 'Show chat info'}
                        aria-expanded={showInfo}
                    >
                        <Info size={18} />
                    </button>
                    {/* <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><MoreVertical size={18} /></button> */}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-4 space-y-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 scroll-smooth">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                            {isLoadingHistory ? (
                                <>
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurora-500 mb-2"></div>
                                    <p>Loading messages...</p>
                                </>
                            ) : (
                                <>
                                    <Smile size={48} className="mb-2" />
                                    <p>No messages yet. Say hello!</p>
                                </>
                            )}
                        </div>
                    )}

                    {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                        <div key={dateLabel} className="space-y-6">
                            <div className="flex justify-center sticky top-0 z-10">
                                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs py-1 px-3 rounded-full shadow-sm">
                                    {dateLabel}
                                </span>
                            </div>
                            {msgs.map((msg, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id || index}
                                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} group`}
                                >
                                    <div className={`flex max-w-[85%] sm:max-w-[70%] ${msg.isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3 items-end`}>
                                        {!msg.isMe && (
                                            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white font-bold bg-gradient-to-tr from-blue-400 to-blue-600 shadow-sm mb-1">
                                                {msg.senderAvatar || msg.sender[0]}
                                            </div>
                                        )}

                                        <div className={`relative px-4 py-2.5 shadow-sm transition-all ${msg.isMe
                                            ? 'bg-gradient-to-br from-aurora-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-2xl rounded-tl-sm shadow-sm'
                                            }`}>
                                            {msg.type === 'image' ? (
                                                <div className="mb-1">
                                                    <img
                                                        src={msg.text}
                                                        alt="attachment"
                                                        className="rounded-lg max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(msg.text, '_blank')}
                                                    />
                                                </div>
                                            ) : msg.type === 'file' ? (
                                                <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mb-1 max-w-[200px] cursor-pointer" onClick={() => window.open(msg.text, '_blank')}>
                                                    <div className="p-2 bg-white dark:bg-gray-600 rounded-full text-indigo-500">
                                                        <Paperclip size={16} />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-semibold truncate text-gray-700 dark:text-gray-200">
                                                            {DOMPurify.sanitize(msg.text.split('/').pop().slice(14), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">Click to open</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p
                                                    className="leading-relaxed px-3 py-1"
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(msg.text, {
                                                            ALLOWED_TAGS: [],
                                                            ALLOWED_ATTR: []
                                                        })
                                                    }}
                                                />
                                            )}
                                            <div className={`flex items-center justify-end space-x-1 mt-1 ${msg.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                <span className="text-[10px] opacity-80">{msg.time}</span>
                                                {msg.isMe && <CheckCheck size={14} className="opacity-90" />}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ))}
                    <div className="h-20" />
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Info Sidebar */}
                <AnimatePresence>
                    {showInfo && (
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            className="w-full md:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-xl z-50 absolute right-0 top-0 bottom-0"
                        >
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Chat Info</h3>
                                <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-md">
                                        {activeChatName[0]}
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeChatName}</h2>
                                    <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">
                                        {chatsData[activeChat]?.type === 'group' ? 'Group Chat' : 'Private Message'}
                                    </p>
                                </div>

                                {chatsData[activeChat]?.type === 'group' && (
                                    <>
                                        <div className="mb-6">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Settings</h4>
                                            {/* Rename Group - simplified for UI */}
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    className="flex-1 text-sm p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    placeholder="Rename Group..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            renameGroup(chatsData[activeChat].id, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex justify-between items-center">
                                                Members ({chatsData[activeChat]?.users?.length || onlineCount})
                                            </h4>

                                            {/* Add Member Search */}
                                            <div className="mb-3 relative">
                                                <input
                                                    placeholder="Add person..."
                                                    className="w-full text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-aurora-500/50 outline-none dark:text-white"
                                                    onChange={async (e) => {
                                                        const query = e.target.value;
                                                        if (query.length > 0) {
                                                            const res = await searchUsers(query);
                                                            setInfoSearchResults(res);
                                                        } else {
                                                            setInfoSearchResults([]);
                                                        }
                                                    }}
                                                />
                                                {infoSearchResults.length > 0 && (
                                                    <div className="absolute top-10 left-0 w-full bg-white dark:bg-gray-700 shadow-lg rounded-lg max-h-40 overflow-auto z-50 border border-gray-200 dark:border-gray-600">
                                                        {infoSearchResults.map(u => (
                                                            <div
                                                                key={u._id}
                                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm dark:text-white flex items-center justify-between"
                                                                onClick={() => {
                                                                    addToGroup(chatsData[activeChat].id, u._id);
                                                                    setInfoSearchResults([]);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-aurora-100 text-aurora-600 flex items-center justify-center text-xs font-bold">
                                                                        {u.name[0]}
                                                                    </div>
                                                                    <span>{u.name}</span>
                                                                </div>
                                                                <Plus size={14} className="text-gray-400" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Member List */}
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                {chatsData[activeChat]?.users?.map(member => (
                                                    <div key={member._id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                                                {member.name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                                    {member.name}
                                                                    {chatsData[activeChat].groupAdmin?._id === member._id && (
                                                                        <span className="text-[10px] bg-aurora-100 text-aurora-700 px-1.5 py-0.5 rounded border border-aurora-200 font-bold">Admin</span>
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate max-w-[120px]">{member.email}</p>
                                                            </div>
                                                        </div>

                                                        {/* Admin Actions: Remove User (only if I am admin, and not removing myself here - use Leave for myself) */}
                                                        {chatsData[activeChat].groupAdmin?._id === currentUser._id && member._id !== currentUser._id && (
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm(`Remove ${member.name} from group?`)) {
                                                                        removeFromGroup(chatsData[activeChat].id, member._id);
                                                                    }
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                                                                title="Remove user"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                                            onClick={() => setShowLeaveModal(true)}
                                        >
                                            Leave Group
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Leave Group Modal */}
                <AnimatePresence>
                    {showLeaveModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                onClick={() => setShowLeaveModal(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl w-full max-w-sm relative z-10"
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Leave Group?</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                                    Are you sure you want to leave this group? You won't receive new messages.
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowLeaveModal(false)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            removeFromGroup(chatsData[activeChat].id, currentUser._id);
                                            setShowLeaveModal(false);
                                            setShowInfo(false);
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Leave
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>


            {/* Input Area */}
            <div className={`absolute bottom-6 left-0 px-4 z-30 transition-all duration-300 ease-in-out ${showInfo ? 'right-0 md:right-80' : 'right-0'}`}>
                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute -top-10 left-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center gap-2"
                        >
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-aurora-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-aurora-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-aurora-500 rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Someone is typing...</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showEmoji && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="absolute bottom-20 right-4 z-40 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                            <Picker
                                onEmojiClick={onEmojiClick}
                                theme="auto"
                                width={320}
                                height={400}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-4xl mx-auto flex items-end space-x-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-2 rounded-[2rem] border border-white/20 dark:border-gray-700/30 shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={handleFileClick}
                        disabled={isUploadingFile}
                        className={`p-3 rounded-full transition-all duration-200 ${isUploadingFile
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-aurora-600 dark:hover:text-aurora-400'
                            }`}
                        title={isUploadingFile ? 'Uploading...' : 'Attach file'}
                    >
                        {isUploadingFile ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                        ) : (
                            <Paperclip size={20} />
                        )}
                    </button>

                    <textarea
                        value={message}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 min-h-[44px] max-h-32 scrollbar-hide"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />

                    <button
                        onClick={() => setShowEmoji(!showEmoji)}
                        className={`p-3 rounded-full transition-all duration-200 ${showEmoji ? 'text-aurora-600 bg-aurora-50 dark:bg-aurora-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 hover:text-aurora-600'}`}
                    >
                        <Smile size={20} />
                    </button>

                    <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className={`p-3 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${message.trim()
                            ? 'bg-gradient-to-r from-aurora-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-aurora-500/30 transform hover:scale-110 active:scale-95'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Send size={20} className={message.trim() ? "ml-0.5" : ""} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
