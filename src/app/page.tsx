'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      setSubscriptionStatus('error');
      return;
    }

    setIsSubscribing(true);
    setSubscriptionStatus('idle');
    setMessage('');

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setMessage('Notification permission is required to receive bill updates');
        setSubscriptionStatus('error');
        return;
      }

      // Get FCM token (simplified for now - in production you'd use Firebase)
      const fcmToken = 'dummy-token-' + Date.now(); // Replace with actual FCM token

      // Subscribe to notifications
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, fcmToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Successfully subscribed! You\'ll receive notifications about new bills.');
        setSubscriptionStatus('success');
        setEmail('');
      } else {
        setMessage(data.error || 'Failed to subscribe');
        setSubscriptionStatus('error');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
      setSubscriptionStatus('error');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Understanda<span className="text-blue-600">bill</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Making U.S. legislation easy to understand
          </p>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              Stay informed about newly passed U.S. bills with AI-powered summaries 
              delivered straight to your browser. No more legal jargon – just clear, 
              concise explanations of what matters to you.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-blue-600 text-3xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
            <p className="text-gray-600">
              Automatically detects and processes newly enacted bills from Congress.gov
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-blue-600 text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Summaries</h3>
            <p className="text-gray-600">
              Get clear, neutral summaries of complex legislation in under 200 words
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-blue-600 text-3xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold mb-2">Instant Notifications</h3>
            <p className="text-gray-600">
              Receive push notifications with bill titles and summaries as they become law
            </p>
          </div>
        </div>

        {/* Subscription Form */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Get Started
          </h2>
          
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubscribing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe to Notifications'}
            </button>
          </form>

          {subscriptionStatus !== 'idle' && (
            <div className={`mt-4 p-3 rounded-md ${
              subscriptionStatus === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            By subscribing, you agree to receive push notifications about new bills. 
            You can unsubscribe at any time.
          </p>
        </div>

        {/* Dashboard Link */}
        <div className="text-center mt-8">
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View Recent Bills →
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500">
          <p>© 2024 Understandabill. Making legislation accessible to everyone.</p>
        </footer>
      </div>
    </div>
  );
}
