import React from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';
import { Users, Clock, Shield, Zap, Video, MessageCircle, FileText, Lock, Sparkles } from 'lucide-react';

const Home = () => {
  const features = [
    {
      title: "Video Conference",
      description: "HD video calls with screen sharing, recording, and virtual backgrounds. Support for up to 50 participants.",
      icon: Video,
      path: "/video-call",
      color: "from-blue-500 via-cyan-500 to-aurora-500",
      iconBg: "from-blue-500 to-cyan-500",
      stats: "4.8/5 rating"
    },
    {
      title: "Team Chat",
      description: "Real-time messaging with file sharing, threads, and smart notifications. Never miss important updates.",
      icon: MessageCircle,
      path: "/chat",
      color: "from-green-400 via-emerald-500 to-teal-600",
      iconBg: "from-green-400 to-emerald-500",
      stats: "99.9% uptime"
    },
    {
      title: "Document Collaboration",
      description: "Work together on documents with real-time editing, comments, and version history tracking.",
      icon: FileText,
      path: "/document-share",
      color: "from-purple-500 via-pink-500 to-rose-500",
      iconBg: "from-purple-500 to-pink-500",
      stats: "2K+ active users"
    },
    {
      title: "Password Manager",
      description: "Secure storage for passwords, meeting links, and login credentials. Keep your team's information safe.",
      icon: Lock,
      path: "/password-manager",
      color: "from-aurora-500 via-indigo-500 to-purple-600",
      iconBg: "from-aurora-500 to-indigo-500",
      stats: "Enterprise Security"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Teams", value: "1,200+" },
    { icon: Clock, label: "Avg. Response Time", value: "< 2ms" },
    { icon: Shield, label: "Security Score", value: "99.9%" },
    { icon: Zap, label: "Uptime", value: "99.99%" },
  ];

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-aurora-50/30 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-aurora-300 dark:bg-aurora-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-aurora-100 to-purple-100 dark:from-aurora-900/30 dark:to-purple-900/30 border border-aurora-200 dark:border-aurora-800 text-aurora-700 dark:text-aurora-300 text-sm font-medium mb-8 backdrop-blur-sm shadow-lg animate-fade-in">
            <span className="mr-2">✨</span>
            Trusted by 10,000+ teams worldwide
          </div>
          
          {/* Main Title with Animation */}
          <div className="mb-6 animate-fade-in-up">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-4 leading-tight">
              <span className="block text-gray-900 dark:text-white mb-2">Welcome to</span>
              <span className="block bg-gradient-to-r from-aurora-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient bg-size-300">
                Aurora
              </span>
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
              The Digital Workspace
            </p>
          </div>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Your professional digital workspace for seamless collaboration through video calls, real-time chat, 
            document sharing, and more — all in one secure platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animation-delay-400">
            <button onClick={() => navigate('/pricing')} className="group relative bg-gradient-to-r from-aurora-600 to-purple-600 hover:from-aurora-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-2 shadow-2xl hover:shadow-aurora-500/50 overflow-hidden">
              <span className="relative z-10 flex items-center justify-center">
                Get Started
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            <button onClick={() => navigate('/pricing')} className="group border-2 border-aurora-300 dark:border-aurora-600 hover:border-aurora-500 dark:hover:border-aurora-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-aurora-700 dark:text-aurora-300 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl">
              <span className="flex items-center justify-center">
                Learn More
                <svg className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </button>
          </div>

          {/* Stats with Enhanced Design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto animate-fade-in-up animation-delay-400">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const iconGradients = [
                "from-blue-500 to-cyan-500",
                "from-orange-500 to-amber-500",
                "from-emerald-500 to-teal-500",
                "from-purple-500 to-pink-500"
              ];
              const iconGradient = iconGradients[index % iconGradients.length];
              
              return (
                <div 
                  key={index} 
                  className="group relative text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-aurora-300 dark:hover:border-aurora-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${iconGradient} rounded-xl shadow-lg flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float`}>
                    <Icon size={32} className="text-white" strokeWidth={2} />
                  </div>
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-aurora-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-aurora-600 dark:text-aurora-400 uppercase tracking-wider">
                Features
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="block text-gray-900 dark:text-white mb-2">Everything Your</span>
              <span className="block bg-gradient-to-r from-aurora-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Team Needs
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Powerful features designed to enhance collaboration and boost productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                path={feature.path}
                color={feature.color}
                iconBg={feature.iconBg}
                stats={feature.stats}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-aurora-600 via-purple-600 to-pink-600 dark:from-aurora-700 dark:via-purple-700 dark:to-pink-700">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <div className="mb-8 animate-float">
            <svg className="w-24 h-24 mx-auto opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Ready to Transform Your Team Collaboration?
          </h2>
          
          <p className="text-xl md:text-2xl mb-10 opacity-90 leading-relaxed">
            Join thousands of teams that trust <span className="font-bold">Aurora</span> for their daily collaboration needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/pricing')} className="group relative bg-white text-aurora-600 hover:text-aurora-700 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-2 shadow-2xl hover:shadow-white/20 overflow-hidden">
              <span className="relative z-10 flex items-center justify-center">
                Get Started Free
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-aurora-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </button>
            
            <button className="group border-2 border-white/80 hover:border-white text-white hover:bg-white/10 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm">
              <span className="flex items-center justify-center">
                Contact Sales
                <svg className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;