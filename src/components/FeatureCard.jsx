import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FeatureCard = ({ title, description, icon: Icon, path, color, iconBg, stats }) => {
  return (
    <Link to={path} className="block group">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-gray-100 dark:border-gray-700 h-full overflow-hidden">
        {/* Gradient Background Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
        
        {/* Animated Border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-aurora-200 dark:group-hover:border-aurora-800 transition-colors duration-300"></div>
        
        {/* Glow Effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10`}></div>
        
        <div className="relative z-10">
          {/* Icon with Animation and Gradient */}
          <div className={`w-20 h-20 bg-gradient-to-br ${iconBg || color} rounded-2xl flex items-center justify-center mb-5 shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float relative overflow-hidden`}>
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <Icon size={36} className="text-white relative z-10" strokeWidth={2} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-aurora-600 dark:group-hover:text-aurora-400 transition-colors">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed text-sm">
            {description}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-aurora-600 dark:text-aurora-400 font-semibold bg-aurora-50 dark:bg-aurora-900/20 px-3 py-1 rounded-full">
              {stats}
            </span>
            <div className="flex items-center text-aurora-600 dark:text-aurora-400 group-hover:translate-x-2 transition-transform duration-300">
              <span className="text-sm font-medium mr-2">Explore</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;