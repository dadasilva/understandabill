import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Subscriber from '@/models/Subscriber';

export async function POST(request: NextRequest) {
  try {
    const { email, fcmToken } = await request.json();

    // Validate input
    if (!email || !fcmToken) {
      return NextResponse.json(
        { error: 'Email and FCM token are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if subscriber already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    
    if (existingSubscriber) {
      // Update FCM token if different
      if (existingSubscriber.fcmToken !== fcmToken) {
        existingSubscriber.fcmToken = fcmToken;
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
      }
      
      return NextResponse.json({
        message: 'Subscription updated successfully',
        subscriber: {
          id: existingSubscriber._id,
          email: existingSubscriber.email,
          isActive: existingSubscriber.isActive
        }
      });
    }

    // Create new subscriber
    const subscriber = new Subscriber({
      email: email.toLowerCase().trim(),
      fcmToken,
      isActive: true
    });

    await subscriber.save();

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscriber: {
        id: subscriber._id,
        email: subscriber.email,
        isActive: subscriber.isActive
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const subscriber = await Subscriber.findOne({ email });
    
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    subscriber.isActive = false;
    await subscriber.save();

    return NextResponse.json({
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 