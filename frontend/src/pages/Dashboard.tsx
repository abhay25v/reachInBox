import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { emailApi } from '../api/email';
import { EmailStats, Email } from '../types';
import StatsCards from '../components/StatsCards';
import ComposeEmail from '../components/ComposeEmail';
import EmailsTable from '../components/EmailsTable';
import Header from '../components/Header';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [scheduledEmails, setScheduledEmails] = useState<Email[]>([]);
  const [sentEmails, setSentEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'compose' | 'scheduled' | 'sent'>(
    'compose'
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, scheduledData, sentData] = await Promise.all([
        emailApi.getStats(),
        emailApi.getEmails({ status: 'SCHEDULED', limit: 50 }),
        emailApi.getEmails({ status: 'SENT', limit: 50 }),
      ]);

      setStats(statsData);
      setScheduledEmails(scheduledData.emails);
      setSentEmails(sentData.emails);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty data on error to prevent infinite loops
      if (!stats) setStats({ total: 0, scheduled: 0, sent: 0, failed: 0, pending: 0 });
      if (scheduledEmails.length === 0) setScheduledEmails([]);
      if (sentEmails.length === 0) setSentEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds - disabled during development
    // const interval = setInterval(fetchData, 30000);
    // return () => clearInterval(interval);
  }, []);

  const handleEmailScheduled = () => {
    fetchData();
    setActiveTab('scheduled');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and schedule your email campaigns
          </p>
        </div>

        {stats && <StatsCards stats={stats} />}

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <TabButton
                active={activeTab === 'compose'}
                onClick={() => setActiveTab('compose')}
              >
                Compose Email
              </TabButton>
              <TabButton
                active={activeTab === 'scheduled'}
                onClick={() => setActiveTab('scheduled')}
              >
                Scheduled ({scheduledEmails.length})
              </TabButton>
              <TabButton
                active={activeTab === 'sent'}
                onClick={() => setActiveTab('sent')}
              >
                Sent ({sentEmails.length})
              </TabButton>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'compose' && (
              <ComposeEmail onSuccess={handleEmailScheduled} />
            )}
            {activeTab === 'scheduled' && (
              <EmailsTable
                emails={scheduledEmails}
                title="Scheduled Emails"
                onRefresh={fetchData}
              />
            )}
            {activeTab === 'sent' && (
              <EmailsTable
                emails={sentEmails}
                title="Sent Emails"
                onRefresh={fetchData}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-3 text-sm font-medium border-b-2 transition-colors
      ${
        active
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }
    `}
  >
    {children}
  </button>
);

export default Dashboard;
