import React from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';
import { Users, Clock, Shield, Zap, Video, MessageCircle, FileText, Lock } from 'lucide-react';

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
    <div className="min-h-screen bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Subtle Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-aurora-100/40 dark:bg-aurora-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-100/40 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-aurora-50 dark:bg-aurora-900/30 border border-aurora-100 dark:border-aurora-800 text-aurora-600 dark:text-aurora-400 text-sm font-medium mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-aurora-500 mr-2"></span>
            Trusted by 10,000+ teams
          </div>

          {/* Main Title */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-gray-900 dark:text-white">
              The Digital Workspace for <br />
              <span className="bg-gradient-to-r from-aurora-600 to-purple-600 bg-clip-text text-transparent">
                Modern Teams
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Seamlessly collaborate with video calls, real-time chat, document sharing, and more — all in one secure platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in-up animation-delay-200">
            <button onClick={() => navigate('/pricing')} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Get Started Free
            </button>
            <button onClick={() => navigate('/about')} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
              View Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto border-t border-gray-100 dark:border-gray-800 pt-12 animate-fade-in-up animation-delay-400">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3 text-aurora-600 dark:text-aurora-400">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to work together
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to enhance collaboration and boost productivity for teams of all sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  );
};

export default Home;