import React from 'react';
import { Upload, FileText, Download, Share2, Users, MoreVertical, Clock, Search, Folder } from 'lucide-react';

const DocumentShare = () => {
  const documents = [
    { name: "Project Proposal.pdf", size: "2.4 MB", date: "Jan 15, 2024", type: "pdf", owner: "Prachi Gangwar" },
    { name: "Design Mockups.fig", size: "5.7 MB", date: "Jan 14, 2024", type: "figma", owner: "Satyam Katiyar" },
    { name: "Meeting Notes.docx", size: "1.2 MB", date: "Jan 13, 2024", type: "doc", owner: "You" },
    { name: "Budget Spreadsheet.xlsx", size: "3.1 MB", date: "Jan 12, 2024", type: "xls", owner: "Sneha Gangwar" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and share files with your team securely.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search files..."
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-aurora-500/20 focus:border-aurora-500 w-64 transition-all"
              />
            </div>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-aurora-600 text-white rounded-xl font-medium hover:bg-aurora-700 transition-colors shadow-lg shadow-aurora-500/20">
              <Upload size={18} />
              <span>Upload</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Access Folders */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Projects', 'Design', 'Finance', 'Marketing'].map((folder, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-aurora-500 dark:hover:border-aurora-500 transition-colors cursor-pointer group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600', 'bg-orange-100 text-orange-600'][i]
                    }`}>
                    <Folder size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-aurora-600 dark:group-hover:text-aurora-400 transition-colors">{folder}</h3>
                  <p className="text-xs text-gray-500 mt-1">12 files</p>
                </div>
              ))}
            </div>

            {/* Recent Files Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">Recent Files</h3>
                <button className="text-sm text-aurora-600 hover:text-aurora-700 font-medium">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {documents.map((doc, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                              <FileText size={20} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</div>
                              <div className="text-xs text-gray-500">{doc.type.toUpperCase()} File</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-aurora-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                              {doc.owner[0]}
                            </div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{doc.owner}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {doc.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {doc.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <Download size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <Share2 size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Storage Usage */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Storage</h3>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">75 GB used</span>
                <span className="text-gray-900 dark:text-white font-medium">100 GB total</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-aurora-500 to-purple-500 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
              <button className="w-full py-2 text-sm font-medium text-aurora-600 dark:text-aurora-400 border border-aurora-200 dark:border-aurora-800 rounded-xl hover:bg-aurora-50 dark:hover:bg-aurora-900/20 transition-colors">
                Upgrade Storage
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="mt-0.5 p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">Prachi</span> uploaded a new file
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collaborators */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Team</span>
                <span className="text-xs font-normal text-aurora-600 cursor-pointer">View All</span>
              </h3>
              <div className="flex -space-x-2 overflow-hidden mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-xs text-white font-bold ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-gray-500'][i - 1]
                    }`}>
                    U{i}
                  </div>
                ))}
              </div>
              <button className="w-full flex items-center justify-center space-x-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Users size={16} />
                <span>Manage Access</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentShare;