import React, { useState, useRef } from 'react';
import { emailApi } from '../api/email';
import { ScheduleEmailRequest } from '../types';

interface ComposeEmailProps {
  onSuccess: () => void;
}

const ComposeEmail: React.FC<ComposeEmailProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    recipients: '',
    startTime: '',
    delayBetweenEmails: '2000',
    hourlyLimit: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await emailApi.uploadCsv(file);
      setFormData({
        ...formData,
        recipients: result.emails.join('\n'),
      });
      setSuccess(`Loaded ${result.count} email addresses from CSV`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const recipients = formData.recipients
      .split('\n')
      .map((email) => email.trim())
      .filter((email) => email);

    if (recipients.length === 0) {
      setError('Please add at least one recipient');
      return;
    }

    const request: ScheduleEmailRequest = {
      subject: formData.subject,
      body: formData.body,
      recipients,
      startTime: new Date(formData.startTime).toISOString(),
      delayBetweenEmails: parseInt(formData.delayBetweenEmails),
      hourlyLimit: formData.hourlyLimit
        ? parseInt(formData.hourlyLimit)
        : undefined,
    };

    try {
      setLoading(true);
      const result = await emailApi.scheduleEmails(request);
      setSuccess(result.message);
      setFormData({
        subject: '',
        body: '',
        recipients: '',
        startTime: '',
        delayBetweenEmails: '2000',
        hourlyLimit: '',
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to schedule emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Subject
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Body</label>
        <textarea
          name="body"
          value={formData.body}
          onChange={handleChange}
          required
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Recipients (one per line)
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Upload CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
          />
        </div>
        <textarea
          name="recipients"
          value={formData.recipients}
          onChange={handleChange}
          required
          rows={6}
          placeholder="email1@example.com&#10;email2@example.com"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Delay Between Emails (ms)
          </label>
          <input
            type="number"
            name="delayBetweenEmails"
            value={formData.delayBetweenEmails}
            onChange={handleChange}
            required
            min="1000"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hourly Limit (optional)
          </label>
          <input
            type="number"
            name="hourlyLimit"
            value={formData.hourlyLimit}
            onChange={handleChange}
            min="1"
            placeholder="Default from config"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Scheduling...' : 'Schedule Emails'}
      </button>
    </form>
  );
};

export default ComposeEmail;
