import React from 'react';

const InfoBanner: React.FC = () => {
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            📧 Test Email Service Active
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              This application uses <strong>Ethereal Email</strong> - a fake SMTP service for testing.
              Emails won't arrive in real inboxes. Check the backend logs for preview URLs to view sent emails.
            </p>
            <p className="mt-2">
              <a
                href="https://ethereal.email/messages"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-blue-900"
              >
                View all test emails at ethereal.email →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;
