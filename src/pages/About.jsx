import React from 'react';
import { Users, Target, Heart, Globe, Award, Sparkles } from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Years of Experience', value: '10+' },
    { label: 'Team Members', value: '50+' },
    { label: 'Global Clients', value: '200+' },
    { label: 'Projects Completed', value: '500+' },
  ];

  const values = [
    {
      icon: Target,
      title: 'Mission Driven',
      description: 'We are dedicated to revolutionizing digital collaboration through innovative solutions.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Heart,
      title: 'User First',
      description: 'Your experience is our priority. We build tools that are intuitive and powerful.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting teams across the world with seamless communication technology.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for perfection in every line of code and every pixel of design.',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      name: 'Emily Davis',
      role: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      name: 'David Wilson',
      role: 'Lead Developer',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-aurora-50/30 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-aurora-300 dark:bg-aurora-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-aurora-100 to-purple-100 dark:from-aurora-900/30 dark:to-purple-900/30 border border-aurora-200 dark:border-aurora-800 text-aurora-700 dark:text-aurora-300 text-sm font-medium mb-8 backdrop-blur-sm shadow-lg">
            <Sparkles size={16} className="mr-2" />
            Our Story
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span className="block text-gray-900 dark:text-white mb-2">Building the Future of</span>
            <span className="block bg-gradient-to-r from-aurora-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Collaboration
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to transform how teams work together. By combining cutting-edge technology with intuitive design, we create workspaces that inspire creativity and productivity.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-aurora-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 shadow-md`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet the Team</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">The passionate people behind Aurora</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-aurora-300 font-medium">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
