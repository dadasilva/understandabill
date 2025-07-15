'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import BillModal from '@/components/BillModal';
import AuthModal from '@/components/AuthModal';
import { generateClickbaitTitle } from '@/lib/clickbait-generator';
import { useAuth } from '@/contexts/AuthContext';

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
  upvotes?: number;
  downvotes?: number;
  userVote?: 'upvote' | 'downvote' | null;
}

interface BillsResponse {
  bills: Bill[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [voteLoading, setVoteLoading] = useState<{ [billId: string]: boolean }>({});
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false
  });

  const fetchBills = useCallback(async (offset = 0) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bills?limit=${pagination.limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
      
      const data: BillsResponse = await response.json();
      
      if (offset === 0) {
        setBills(data.bills);
      } else {
        setBills(prev => [...prev, ...data.bills]);
      }
      
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchBills(pagination.offset + pagination.limit);
    }
  };

  const processBill = async (endpoint: string) => {
    try {
      setProcessing(true);
      const response = await fetch(endpoint, { method: 'POST' });
      
      if (response.ok) {
        // Wait a moment for the database to update, then refresh
        setTimeout(() => {
          fetchBills();
          setProcessing(false);
        }, 1000);
      } else {
        console.error('Failed to process bill');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error processing bill:', error);
      setProcessing(false);
    }
  };

  const handleBillClick = (bill: Bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBill(null);
  };

  // Handle upvote/downvote
  const handleVote = async (billId: string, action: 'upvote' | 'downvote') => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setVoteLoading((prev) => ({ ...prev, [billId]: true }));
    
    try {
      const res = await fetch(`/api/bills/${billId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (res.ok) {
        const data = await res.json();
        setBills((prevBills) => prevBills.map(bill => {
          if (bill.billId === billId) {
            return { 
              ...bill, 
              upvotes: data.upvotes, 
              downvotes: data.downvotes,
              userVote: data.userVote
            };
          }
          return bill;
        }));
      } else if (res.status === 401) {
        setIsAuthModalOpen(true);
      } else {
        throw new Error('Failed to vote');
      }
    } catch (e) {
      alert('Failed to vote. Please try again.');
    } finally {
      setVoteLoading((prev) => ({ ...prev, [billId]: false }));
    }
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => fetchBills()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              ← Back to Home
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Login
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Recent Bills
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Recently enacted U.S. legislation with AI-generated summaries
          </p>
          
          {/* Processing Buttons - Always Visible */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Process Bills</h2>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => processBill('/api/process-bills')}
                disabled={processing}
                className={`px-4 py-2 rounded-md transition-colors ${
                  processing 
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                } text-white`}
              >
                {processing ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Processing...
                  </>
                ) : (
                  'Process Most Recent Bill'
                )}
              </button>
              <button 
                onClick={() => processBill('/api/process-random-bill')}
                disabled={processing}
                className={`px-4 py-2 rounded-md transition-colors ${
                  processing 
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
                } text-white`}
              >
                {processing ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Processing...
                  </>
                ) : (
                  'Process Random Bill'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bills Cards - Side Scrolling */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Bills ({bills.length})
          </h2>
          
          {bills.length > 0 && (
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {bills.map((bill) => {
                  const clickbaitTitle = generateClickbaitTitle(bill.title, bill.summary, bill.topic);
                  
                  return (
                    <div 
                      key={bill._id} 
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 min-w-[350px] max-w-[400px] flex-shrink-0 transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer group"
                      onClick={() => handleBillClick(bill)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
                              {getBillTypeLabel(bill.billType)} {bill.billNumber}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {bill.congress}th Congress
                            </span>
                            {bill.topic && (
                              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2.5 py-0.5 rounded">
                                {bill.emoji || '📋'} {bill.topic}
                              </span>
                            )}
                          </div>
                          
                          {/* Clickbait Title */}
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {clickbaitTitle}
                          </h3>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Enacted on {formatDate(bill.enactedDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h4>
                        <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm line-clamp-4">
                          {bill.summary}
                        </p>
                      </div>
                      
                      {/* Voting UI */}
                      <div className="flex items-end justify-between mt-2">
                        {/* Vote count bottom left */}
                        <span className="font-bold text-gray-900 dark:text-white text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                          {(bill.upvotes || 0) - (bill.downvotes || 0)}
                        </span>
                        {/* Voting buttons bottom right */}
                        <div className="flex gap-1">
                          <button
                            className={`p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors ${
                              voteLoading[bill.billId] ? 'opacity-50 cursor-not-allowed' : ''
                            } ${bill.userVote === 'upvote' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                            disabled={voteLoading[bill.billId]}
                            onClick={e => { e.stopPropagation(); handleVote(bill.billId, 'upvote'); }}
                            aria-label="Upvote"
                          >
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                          </button>
                          <button
                            className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors ${
                              voteLoading[bill.billId] ? 'opacity-50 cursor-not-allowed' : ''
                            } ${bill.userVote === 'downvote' ? 'bg-red-100 dark:bg-red-900' : ''}`}
                            disabled={voteLoading[bill.billId]}
                            onClick={e => { e.stopPropagation(); handleVote(bill.billId, 'downvote'); }}
                            aria-label="Downvote"
                          >
                            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Bill ID: {bill.billId}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                          Click to read more →
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading bills...</p>
          </div>
        )}

        {/* Load More Button */}
        {pagination.hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Load More Bills
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && bills.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Bills Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              No bills have been processed yet. Use the buttons above to process your first bill!
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p>Showing {bills.length} of {pagination.total} bills</p>
        </footer>
      </div>

      {/* Bill Modal */}
      <BillModal 
        bill={selectedBill}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
} 