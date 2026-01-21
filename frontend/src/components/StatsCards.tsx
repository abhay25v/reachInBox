import React from 'react';
import { EmailStats } from '../types';

interface StatsCardsProps {
  stats: EmailStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Emails',
      value: stats.total,
      gradient: 'from-blue-500 to-blue-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Scheduled',
      value: stats.scheduled,
      gradient: 'from-yellow-500 to-orange-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Sent',
      value: stats.sent,
      gradient: 'from-green-500 to-emerald-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Failed',
      value: stats.failed,
      gradient: 'from-red-500 to-pink-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="group relative bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{card.title}</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 bg-gradient-to-br ${card.gradient} rounded-xl text-white shadow-medium transform group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
