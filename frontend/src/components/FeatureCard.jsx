import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FeatureCard = ({ title, description, icon: Icon, path, color, iconBg, stats }) => {
  return (
    <Link to={path} className="block group">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 h-full overflow-hidden">
        {/* Gradient Background Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>

        <div className="relative z-10">
          {/* Icon */}
          <div className={`w-14 h-14 bg-gradient-to-br ${iconBg || color} rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
            <Icon size={28} className="text-white" strokeWidth={2} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-aurora-600 dark:group-hover:text-aurora-400 transition-colors">
            {title}
          </h3>

          <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed text-sm">
            {description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-full">
              {stats}
            </span>
            <div className="flex items-center text-aurora-600 dark:text-aurora-400 group-hover:translate-x-1 transition-transform duration-300">
              <span className="text-sm font-medium mr-1.5">View</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;