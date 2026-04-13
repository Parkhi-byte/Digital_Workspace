import React from 'react';
import Header from './Header';
import { Sparkles, Users, Info, CreditCard, MessageCircle, Video, FileText, Kanban, Mail, LifeBuoy, ArrowRight, Shield, Lock, FileQuestion } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChatContext } from '../context/ChatContext';
import ImpersonationBanner from './masterAdmin/ImpersonationBanner';
const VideoCall = React.lazy(() => import('./VideoCall/VideoCall'));

const Layout = ({ children }) => {
  const { user, adminUser } = useAuth();
  const { call, isCalling, callEnded, endCall, answerCall } = useChatContext();
  const location = useLocation();

  // Routes where we want a full-screen app experience without a footer
  const hiddenFooterRoutes = [
    '/chat',
    '/video-call',
    '/kanban',
    '/board',
    '/document-share',
    '/team-management',
    '/password-manager',
    '/notifications',
    '/profile',
    '/calendar'
  ];
  const shouldHideFooter = hiddenFooterRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col ${adminUser ? 'pt-32 sm:pt-28' : 'pt-20'}`}>
      <ImpersonationBanner />
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Global VideoCall Overlay - Lazy Loaded */}
      {(call?.isReceivingCall || isCalling) && !callEnded && (
        <React.Suspense fallback={null}>
          <VideoCall
            isIncoming={call?.isReceivingCall}
            callerSignal={call?.signal}
            callerName={call?.name}
            callerId={call?.from}
            userToCall={call?.userToCall}
            iceCandidates={call?.iceCandidates}
            onEndCall={endCall}
            onAnswer={answerCall}
            isVideoCall={call?.isVideo !== false} // Default to true if undefined
          />
        </React.Suspense>
      )}

      {/* Footer - Hidden on app-like pages */}
      {!shouldHideFooter && (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="w-full px-4 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-1 mb-3">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <img src="/aurora-logo.svg" alt="Aurora Logo" className="w-7 h-7 object-contain animate-color-glow" />
                  </div>
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white tracking-tight leading-none">Aurora</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The Digital Workspace: chat, calls, docs, and tasks unified.</p>

                {/* Responsive Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Link to="/about" className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-medium border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors">
                    <Info size={14} />
                    <span>About</span>
                  </Link>
                  <Link to="/pricing" className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                    <CreditCard size={14} />
                    <span>Pricing</span>
                  </Link>
                  {user?.role === 'team_head' && (
                    <Link to="/team-management" className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-medium border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors">
                      <Users size={14} />
                      <span>Team</span>
                    </Link>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Product</h4>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <Link to="/chat" className="flex items-center space-x-2 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
                      <MessageCircle size={16} className="shrink-0" />
                      <span>Chat</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/video-call" className="flex items-center space-x-2 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
                      <Video size={16} className="shrink-0" />
                      <span>Video Calls</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/document-share" className="flex items-center space-x-2 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
                      <FileText size={16} className="shrink-0" />
                      <span>Documents</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/kanban" className="flex items-center space-x-2 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
                      <Kanban size={16} className="shrink-0" />
                      <span>Boards</span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Company</h4>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <Link to="/pricing" className="flex items-center space-x-2 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
                      <CreditCard size={16} className="shrink-0" />
                      <span>Pricing</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="flex items-center space-x-2 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
                      <Info size={16} className="shrink-0" />
                      <span>About Us</span>
                    </Link>
                  </li>
                  <li>
                    <a href="mailto:sales@aurora.example.com" className="flex items-center space-x-2 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
                      <Mail size={16} className="shrink-0" />
                      <span>Sales</span>
                    </a>
                  </li>
                  <li>
                    <a href="mailto:support@aurora.example.com" className="flex items-center space-x-2 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
                      <LifeBuoy size={16} className="shrink-0" />
                      <span>Support</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Get Started</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Try Pro features with a 14-day free trial.</p>
                <Link to="/pricing" className="inline-flex items-center px-4 py-2 rounded-lg bg-aurora-600 hover:bg-aurora-700 text-white text-sm transition-colors shadow-sm hover:shadow-md">
                  <span>View Pricing</span>
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 flex flex-col md:flex-row items-center justify-between gap-3">
              <div>© {new Date().getFullYear()} Aurora. All rights reserved.</div>
              <div className="flex items-center gap-6">
                <a href="#" className="flex items-center space-x-1.5 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
                  <FileQuestion size={14} />
                  <span>Terms</span>
                </a>
                <a href="#" className="flex items-center space-x-1.5 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
                  <Lock size={14} />
                  <span>Privacy</span>
                </a>
                <a href="#" className="flex items-center space-x-1.5 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
                  <Shield size={14} />
                  <span>Security</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;