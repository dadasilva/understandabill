'use client';

import { useEffect } from 'react';

interface Bill {
  _id: string;
  billId: string;
  congress: number;
  billType: string;
  billNumber: string;
  title: string;
  summary: string;
  enactedDate: string;
  processedAt: string;
  topic?: string;
  emoji?: string;
}

interface BillModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BillModal({ bill, isOpen, onClose }: BillModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !bill) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBillTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'hr': 'House Resolution',
      's': 'Senate Bill',
      'hjres': 'House Joint Resolution',
      'sjres': 'Senate Joint Resolution',
      'hconres': 'House Concurrent Resolution',
      'sconres': 'Senate Concurrent Resolution'
    };
    return types[type.toLowerCase()] || type.toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-all">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full">
                  {getBillTypeLabel(bill.billType)} {bill.billNumber}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {bill.congress}th Congress
                </span>
                {bill.topic && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium px-3 py-1 rounded-full">
                    {bill.emoji || '📋'} {bill.topic}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {bill.emoji && <span className="mr-3">{bill.emoji}</span>}
                {bill.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Enacted on {formatDate(bill.enactedDate)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📋 AI-Generated Summary
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg">
                {bill.summary}
              </p>
            </div>
          </div>

          {/* Original Title Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📜 Original Bill Title
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                {bill.title}
              </p>
            </div>
          </div>

          {/* Bill Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📊 Bill Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Bill ID:</span>
                  <p className="text-gray-900 dark:text-white">{bill.billId}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Congress:</span>
                  <p className="text-gray-900 dark:text-white">{bill.congress}th Congress</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
                  <p className="text-gray-900 dark:text-white">{getBillTypeLabel(bill.billType)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Number:</span>
                  <p className="text-gray-900 dark:text-white">{bill.billNumber}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📅 Timeline
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Enacted Date:</span>
                  <p className="text-gray-900 dark:text-white">{formatDate(bill.enactedDate)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Processed:</span>
                  <p className="text-gray-900 dark:text-white">{formatDate(bill.processedAt)}</p>
                </div>
                {bill.topic && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category:</span>
                    <p className="text-gray-900 dark:text-white">{bill.emoji || '📋'} {bill.topic}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Copy bill ID to clipboard
                navigator.clipboard.writeText(bill.billId);
                // You could add a toast notification here
              }}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Copy Bill ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 