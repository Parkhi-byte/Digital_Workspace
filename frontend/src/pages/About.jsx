import React from 'react';
import { Users, Target, Heart, Globe, Award, Sparkles, ArrowRight } from 'lucide-react';

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
      color: 'bg-blue-500'
    },
    {
      icon: Heart,
      title: 'User First',
      description: 'Your experience is our priority. We build tools that are intuitive and powerful.',
      color: 'bg-pink-500'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting teams across the world with seamless communication technology.',
      color: 'bg-purple-500'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for perfection in every line of code and every pixel of design.',
      color: 'bg-orange-500'
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-aurora-50/50 to-transparent dark:from-aurora-900/10 dark:to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-aurora-100 dark:bg-aurora-900/30 text-aurora-700 dark:text-aurora-300 text-xs font-bold uppercase tracking-wider mb-6">
            Our Story
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-gray-900 dark:text-white">
            Building the future of <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-aurora-500 to-purple-600">collaboration</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to transform how teams work together. By combining cutting-edge technology with intuitive design, we create workspaces that inspire creativity.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="group p-8 rounded-3xl bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-100 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300">
                  <div className={`w-12 h-12 rounded-2xl ${value.color} flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
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
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Meet the Team</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl">The passionate people behind Aurora who make magic happen every day.</p>
            </div>
            <button className="flex items-center font-semibold text-aurora-600 hover:text-aurora-700 transition-colors">
              Join our team <ArrowRight size={20} className="ml-2" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group">
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[4/5]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-aurora-600 dark:text-aurora-400 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
