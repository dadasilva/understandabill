# Understandabill

Making U.S. legislation easy to understand with AI-powered summaries and push notifications.

## Overview

Understandabill is a web application that monitors newly passed U.S. bills using the Congress.gov API, generates AI-powered summaries, and sends push notifications to subscribed users. The app provides clear, concise explanations of complex legislation in under 200 words.

## Features

- **Real-time Monitoring**: Automatically detects and processes newly enacted bills from Congress.gov
- **AI Summarization**: Uses xAI (with OpenAI fallback) to create neutral, clear summaries
- **Push Notifications**: Browser-based push alerts with bill titles and summaries
- **User Dashboard**: View recent bills with summaries and search functionality
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express.js (Next.js API routes)
- **Database**: MongoDB with Mongoose ODM
- **AI**: xAI API with OpenAI fallback
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Hosting**: Vercel (recommended)

## Prerequisites

Before setting up Understandabill, you'll need:

1. **Congress.gov API Key**: Register at https://api.congress.gov/sign-up/
2. **xAI API Key**: Get access to xAI's API (or use OpenAI as fallback)
3. **MongoDB Database**: Set up a MongoDB Atlas cluster (free tier available)
4. **Firebase Project**: Create a Firebase project for push notifications
5. **Node.js**: Version 18 or higher

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd understandabill
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   # Congress.gov API
   CONGRESS_API_KEY=your_congress_api_key_here

   # xAI API (or OpenAI as fallback)
   XAI_API_KEY=your_xai_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here

   # MongoDB
   MONGODB_URI=your_mongodb_atlas_uri_here

   # Firebase
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email

   # JWT Secret
   JWT_SECRET=your_jwt_secret_here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## Configuration

### 1. Congress.gov API Setup

1. Visit https://api.congress.gov/sign-up/
2. Register for a free API key
3. Add the key to your `.env.local` file

### 2. AI API Setup

**Option A: xAI (Recommended)**
1. Get access to xAI's API
2. Add your xAI API key to `.env.local`

**Option B: OpenAI (Fallback)**
1. Get an OpenAI API key from https://platform.openai.com/
2. Add your OpenAI API key to `.env.local`

### 3. MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster (free tier available)
3. Get your connection string
4. Add it to `MONGODB_URI` in `.env.local`

### 4. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Cloud Messaging
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
4. Add the credentials to your `.env.local` file
5. Update the Firebase config in `public/firebase-messaging-sw.js`

## Development

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   Navigate to http://localhost:3000

3. **Test the application**:
   - Subscribe with an email address
   - Grant notification permissions
   - Visit the dashboard to see processed bills

## Production Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

## Bill Processing

### Automatic Processing

The application includes a script for automatic bill processing:

```bash
# Run manually
node scripts/process-bills.js

# Or schedule with cron (every hour)
0 * * * * cd /path/to/understandabill && node scripts/process-bills.js
```

### Manual Processing

You can also trigger bill processing via the API:

```bash
curl -X POST http://localhost:3000/api/process-bills
```

## API Endpoints

- `POST /api/subscribe` - Subscribe to notifications
- `DELETE /api/subscribe?email=...` - Unsubscribe from notifications
- `GET /api/bills` - Get recent processed bills
- `POST /api/process-bills` - Manually trigger bill processing

## Project Structure

```
understandabill/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard page
│   │   └── page.tsx        # Homepage
│   ├── lib/                # Utility libraries
│   │   ├── ai.ts           # AI summarization
│   │   ├── congress-api.ts # Congress.gov API
│   │   ├── database.ts     # MongoDB connection
│   │   ├── firebase.ts     # Firebase admin
│   │   └── notifications.ts # Push notifications
│   └── models/             # Database models
├── public/                 # Static files
├── scripts/                # Utility scripts
└── package.json
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CONGRESS_API_KEY` | Congress.gov API key | Yes |
| `XAI_API_KEY` | xAI API key | Yes* |
| `OPENAI_API_KEY` | OpenAI API key | Yes* |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Yes |
| `JWT_SECRET` | JWT secret for authentication | Yes |

*Either xAI or OpenAI API key is required

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API documentation for Congress.gov and Firebase

## Roadmap

- [ ] User preferences for bill topics
- [ ] Email notifications as alternative to push
- [ ] Mobile PWA support
- [ ] Advanced search and filtering
- [ ] Bill comparison features
- [ ] Historical bill analysis
