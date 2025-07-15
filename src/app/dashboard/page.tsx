'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false
  });

  const fetchBills = async (offset = 0) => {
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
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchBills(pagination.offset + pagination.limit);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchBills()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Recent Bills
          </h1>
          <p className="text-gray-600">
            Recently enacted U.S. legislation with AI-generated summaries
          </p>
        </div>

        {/* Bills List */}
        <div className="space-y-6">
          {bills.map((bill) => (
            <div key={bill._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {getBillTypeLabel(bill.billType)} {bill.billNumber}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {bill.congress}th Congress
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {bill.title}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Enacted on {formatDate(bill.enactedDate)}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                  {bill.summary}
                </p>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Bill ID: {bill.billId}
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading bills...</p>
          </div>
        )}

        {/* Load More Button */}
        {pagination.hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Load More Bills
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && bills.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Bills Yet
            </h2>
            <p className="text-gray-600 mb-4">
              No bills have been processed yet. Check back soon for updates!
            </p>
            <button 
              onClick={() => fetch('/api/process-bills', { method: 'POST' })}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Process Bills Manually
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500">
          <p>Showing {bills.length} of {pagination.total} bills</p>
        </footer>
      </div>
    </div>
  );
} 