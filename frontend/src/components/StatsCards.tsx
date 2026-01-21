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
      color: 'bg-blue-500',
      icon: '📊',
    },
    {
      title: 'Scheduled',
      value: stats.scheduled,
      color: 'bg-yellow-500',
      icon: '⏰',
    },
    {
      title: 'Sent',
      value: stats.sent,
      color: 'bg-green-500',
      icon: '✅',
    },
    {
      title: 'Failed',
      value: stats.failed,
      color: 'bg-red-500',
      icon: '❌',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-lg shadow p-6 border-l-4"
          style={{ borderLeftColor: card.color.replace('bg-', '') }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {card.value}
              </p>
            </div>
            <div className="text-4xl">{card.icon}</div>
          </div>
        </div>
      ))}

      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
        <div>
          <p className="text-sm font-medium text-gray-600">
            Remaining This Hour
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.remainingThisHour}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            of {stats.hourlyLimit} limit
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
