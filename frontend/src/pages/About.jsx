import React from 'react';
import { Users, Target, Heart, Globe, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const stats = [
    { label: 'Years of Experience', value: '10+', color: 'from-blue-500 to-indigo-500' },
    { label: 'Team Members', value: '50+', color: 'from-indigo-500 to-purple-500' },
    { label: 'Global Clients', value: '200+', color: 'from-purple-500 to-pink-500' },
    { label: 'Projects Completed', value: '500+', color: 'from-pink-500 to-rose-500' },
  ];

  const values = [
    {
      icon: Target,
      title: 'Mission Driven',
      description: 'We are dedicated to revolutionizing digital collaboration through innovative solutions.',
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20'
    },
    {
      icon: Heart,
      title: 'User First',
      description: 'Your experience is our priority. We build tools that are intuitive and powerful.',
      color: 'from-pink-500 to-rose-500',
      shadow: 'shadow-pink-500/20'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting teams across the world with seamless communication technology.',
      color: 'from-purple-500 to-indigo-500',
      shadow: 'shadow-purple-500/20'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for perfection in every line of code and every pixel of design.',
      color: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/20'
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 18 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 relative overflow-hidden">

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-gradient-to-br from-pink-500/15 to-purple-500/15 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Hero Section */}
      <section className="relative py-24 px-4 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-8 shadow-lg"
          >
            <Sparkles size={16} />
            Our Story
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-gray-900 dark:text-white leading-tight"
          >
            Building the future of{' '}
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              collaboration
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            We're on a mission to transform how teams work together. By combining cutting-edge technology
            with intuitive design, we create workspaces that inspire creativity.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg text-center"
              >
                <div className={`text-4xl font-black bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-24 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              The principles that guide everything we do
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  className={`group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg ${value.shadow} hover:shadow-xl transition-all duration-300`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={26} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-sm">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Team CTA Banner */}
      <section className="relative py-16 px-4 z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <Users size={40} className="mx-auto mb-4 opacity-90" />
              <h3 className="text-3xl font-black mb-3">Join 10,000+ teams</h3>
              <p className="text-indigo-100 font-medium mb-8 max-w-xl mx-auto">
                Start collaborating smarter with Aurora today. Free forever, upgrade anytime.
              </p>
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-600 rounded-2xl font-black shadow-xl hover:bg-gray-50 transition-all"
              >
                Get Started Free
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
