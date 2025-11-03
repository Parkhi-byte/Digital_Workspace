import React from 'react';
import Header from './Header';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">{children}</main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-aurora-500 via-aurora-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white" size={16} />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-aurora-600 to-purple-600 bg-clip-text text-transparent">Aurora</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">The Digital Workspace: chat, calls, docs, and tasks unified.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link to="/chat" className="hover:text-aurora-600 dark:hover:text-aurora-400">Chat</Link></li>
                <li><Link to="/video-call" className="hover:text-aurora-600 dark:hover:text-aurora-400">Video Calls</Link></li>
                <li><Link to="/document-share" className="hover:text-aurora-600 dark:hover:text-aurora-400">Documents</Link></li>
                <li><Link to="/kanban" className="hover:text-aurora-600 dark:hover:text-aurora-400">Boards</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link to="/pricing" className="hover:text-aurora-600 dark:hover:text-aurora-400">Pricing</Link></li>
                <li><a href="mailto:sales@aurora.example.com" className="hover:text-aurora-600 dark:hover:text-aurora-400">Sales</a></li>
                <li><a href="mailto:support@aurora.example.com" className="hover:text-aurora-600 dark:hover:text-aurora-400">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Get Started</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Try Pro features with a 14-day free trial.</p>
              <Link to="/pricing" className="inline-block px-4 py-2 rounded-lg bg-aurora-600 hover:bg-aurora-700 text-white text-sm">View Pricing</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 flex flex-col md:flex-row items-center justify-between gap-3">
            <div>© 2024 Aurora. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-aurora-600 dark:hover:text-aurora-400">Terms</a>
              <a href="#" className="hover:text-aurora-600 dark:hover:text-aurora-400">Privacy</a>
              <a href="#" className="hover:text-aurora-600 dark:hover:text-aurora-400">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;