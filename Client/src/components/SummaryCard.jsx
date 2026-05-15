import React from 'react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryCard = ({ title, value, trend, icon, color }) => {
  const Icon = typeof icon === 'string' 
    ? (LucideIcons[icon.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')] || LucideIcons.Users)
    : null;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm p-6 border border-white/40 transition-all duration-300 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-current/20`}>
          {Icon ? <Icon size={24} /> : icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-semibold text-gray-900 mt-1">{value}</h3>
      </div>
    </motion.div>
  );
};

export default SummaryCard;
