import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, Plus, Search, Trash2, Edit, Copy, Check, Globe, Calendar, Key } from 'lucide-react';

const PasswordManager = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState([]);

  // Load passwords when user is available
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`passwords_${user.id}`);
      if (stored) {
        setPasswords(JSON.parse(stored));
      } else {
        setPasswords([]);
      }
    }
  }, [user?.id]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    category: 'login',
    notes: ''
  });

  const categories = [
    { value: 'login', label: 'Login Credentials', icon: Key, color: 'from-blue-500 to-cyan-500' },
    { value: 'meeting', label: 'Meeting Links', icon: Calendar, color: 'from-green-500 to-emerald-500' },
    { value: 'website', label: 'Website', icon: Globe, color: 'from-purple-500 to-pink-500' },
    { value: 'other', label: 'Other', icon: Lock, color: 'from-orange-500 to-red-500' }
  ];

  // Save passwords to localStorage
  const savePasswords = (updatedPasswords) => {
    if (user?.id) {
      localStorage.setItem(`passwords_${user.id}`, JSON.stringify(updatedPasswords));
      setPasswords(updatedPasswords);
    }
  };

  // Filter passwords by search term
  const filteredPasswords = passwords.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group by category
  const groupedPasswords = filteredPasswords.reduce((acc, pwd) => {
    if (!acc[pwd.category]) acc[pwd.category] = [];
    acc[pwd.category].push(pwd);
    return acc;
  }, {});

  const handleOpenModal = (password = null) => {
    if (password) {
      setEditingId(password.id);
      setFormData({
        title: password.title,
        username: password.username,
        password: password.password,
        url: password.url,
        category: password.category,
        notes: password.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        username: '',
        password: '',
        url: '',
        category: 'login',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: '',
      username: '',
      password: '',
      url: '',
      category: 'login',
      notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedPasswords = [...passwords];
    
    if (editingId) {
      // Update existing
      const index = updatedPasswords.findIndex(p => p.id === editingId);
      updatedPasswords[index] = {
        ...updatedPasswords[index],
        ...formData,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new
      updatedPasswords.push({
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    savePasswords(updatedPasswords);
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this password entry?')) {
      const updatedPasswords = passwords.filter(p => p.id !== id);
      savePasswords(updatedPasswords);
    }
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderPasswordEntry = (pwd) => {
    const isVisible = showPassword[pwd.id];
    const isCopied = copiedId === pwd.id;
    const categoryInfo = categories.find(cat => cat.value === pwd.category);

    return (
      <div key={pwd.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{pwd.title}</h3>
            <div className="flex items-center space-x-2 mb-2">
              {categoryInfo && (
                <div className={`w-8 h-8 bg-gradient-to-br ${categoryInfo.color} rounded-lg flex items-center justify-center shadow-md`}>
                  {React.createElement(categoryInfo.icon, {
                    size: 16,
                    className: 'text-white',
                    strokeWidth: 2.5
                  })}
                </div>
              )}
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-medium">
                {categoryInfo?.label || pwd.category}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleOpenModal(pwd)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDelete(pwd.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {pwd.url && (
            <div className="flex items-center space-x-2">
              <Globe size={16} className="text-gray-400" />
              <a
                href={pwd.url.startsWith('http') ? pwd.url : `https://${pwd.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex-1 truncate"
              >
                {pwd.url}
              </a>
              <button
                onClick={() => handleCopy(pwd.url, `${pwd.id}_url`)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Copy URL"
              >
                {isCopied && copiedId === `${pwd.id}_url` ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 w-20">Username:</span>
            <span className="text-sm font-mono text-gray-800 flex-1">{pwd.username}</span>
            <button
              onClick={() => handleCopy(pwd.username, `${pwd.id}_username`)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Copy username"
            >
              {isCopied && copiedId === `${pwd.id}_username` ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 w-20">Password:</span>
            <span className="text-sm font-mono text-gray-800 flex-1">
              {isVisible ? pwd.password : '•'.repeat(12)}
            </span>
            <button
              onClick={() => togglePasswordVisibility(pwd.id)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title={isVisible ? 'Hide password' : 'Show password'}
            >
              {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={() => handleCopy(pwd.password, `${pwd.id}_password`)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Copy password"
            >
              {isCopied && copiedId === `${pwd.id}_password` ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>

          {pwd.notes && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600">{pwd.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl animate-float">
              <Lock className="text-white" size={32} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Password Manager</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">Secure storage for your passwords and links</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add New</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search passwords, usernames, URLs..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Password Entries */}
      {filteredPasswords.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Lock className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {passwords.length === 0 ? 'No passwords saved yet' : 'No results found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {passwords.length === 0
              ? 'Start by adding your first password or link'
              : 'Try adjusting your search terms'}
          </p>
          {passwords.length === 0 && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Your First Entry</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPasswords).map(([category, items]) => {
            const categoryInfo = categories.find(cat => cat.value === category);
            return (
              <div key={category}>
                <div className="flex items-center space-x-2 mb-4">
                  {categoryInfo?.icon && React.createElement(categoryInfo.icon, {
                    size: 20,
                    className: 'text-gray-600'
                  })}
                  <h2 className="text-2xl font-bold text-gray-800">
                    {categoryInfo?.label || category}
                  </h2>
                  <span className="text-sm text-gray-500">({items.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map(renderPasswordEntry)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Entry' : 'Add New Entry'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Gmail Account, Team Meeting, Company Portal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL/Link
                  </label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username/Email *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="username or email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes or information..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordManager;

