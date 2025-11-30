import React from 'react';
import { Upload, FileText, Download, Share2, Users } from 'lucide-react';

const DocumentShare = () => {
  const documents = [
    { name: "Project Proposal.pdf", size: "2.4 MB", date: "2024-01-15" },
    { name: "Design Mockups.fig", size: "5.7 MB", date: "2024-01-14" },
    { name: "Meeting Notes.docx", size: "1.2 MB", date: "2024-01-13" },
    { name: "Budget Spreadsheet.xlsx", size: "3.1 MB", date: "2024-01-12" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl animate-float">
            <FileText size={32} className="text-white" strokeWidth={2} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Document Sharing</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Share and collaborate on documents with your team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upload Area */}
          <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-dashed border-gray-300 text-center">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
            <p className="text-gray-600 mb-4">Drag and drop files here or click to browse</p>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Browse Files
            </button>
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Shared Documents</h3>
            </div>
            <div className="divide-y">
              {documents.map((doc, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <FileText size={24} className="text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-800">{doc.name}</div>
                      <div className="text-sm text-gray-500">
                        {doc.size} • {doc.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <Download size={18} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="text-gray-600">Prachi Gangwar uploaded Project Proposal.pdf</div>
              <div className="text-gray-600">Sneha Gangwar edited Budget Spreadsheet.xlsx</div>
              <div className="text-gray-600">Satyam Katiyar shared Meeting Notes.docx</div>
            </div>
          </div>

          {/* Collaborators */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users size={18} className="mr-2" />
              Collaborators
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                <span className="text-gray-800">Parkhi</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                <span className="text-gray-800">Satyam Katiyar</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                <span className="text-gray-800">Prachi Gangwar</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                <span className="text-gray-800">Sneha Gangwar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentShare;