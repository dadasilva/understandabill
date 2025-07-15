# Setup Guide for Understandabill

This guide will walk you through setting up Understandabill step by step.

## Step 1: Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Congress.gov API
CONGRESS_API_KEY=your_congress_api_key_here

# xAI API (or OpenAI as fallback)
XAI_API_KEY=your_xai_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/understandabill?retryWrites=true&w=majority

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 2: Congress.gov API Setup

1. Visit https://api.congress.gov/sign-up/
2. Fill out the registration form
3. Check your email for the API key
4. Add the key to `CONGRESS_API_KEY` in your `.env.local`

## Step 3: AI API Setup

### Option A: xAI (Recommended)
1. Get access to xAI's API
2. Add your API key to `XAI_API_KEY` in `.env.local`

### Option B: OpenAI (Fallback)
1. Visit https://platform.openai.com/
2. Create an account and get an API key
3. Add the key to `OPENAI_API_KEY` in `.env.local`

## Step 4: MongoDB Setup

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster (choose the free tier)
4. Create a database user with read/write permissions
5. Get your connection string
6. Replace the placeholder in `MONGODB_URI` with your actual connection string

## Step 5: Firebase Setup

1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable Cloud Messaging:
   - Go to Project Settings
   - Click on "Cloud Messaging" tab
   - Note your Server key (you'll need this later)

4. Create a service account:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Extract the values and add them to your `.env.local`:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `private_key` → `FIREBASE_PRIVATE_KEY`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`

5. Get your web app config:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click the web icon (</>) to add a web app
   - Register your app and copy the config
   - Add the values to your `.env.local`:
     - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

6. Update the service worker:
   - Open `public/firebase-messaging-sw.js`
   - Replace the `firebaseConfig` object with your actual config

## Step 6: JWT Secret

Generate a secure random string for your JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add the output to `JWT_SECRET` in your `.env.local`.

## Step 7: Testing the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Test the subscription flow:
   - Enter an email address
   - Grant notification permissions
   - Check that you're redirected to the dashboard

4. Test bill processing:
   ```bash
   npm run process-bills
   ```

## Step 8: Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in the Vercel dashboard
4. Deploy

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string format
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify your database user credentials

2. **Firebase Configuration Error**
   - Double-check all Firebase environment variables
   - Ensure the service account has the correct permissions
   - Verify the web app is properly registered

3. **Congress.gov API Error**
   - Verify your API key is correct
   - Check that you're not exceeding rate limits (5,000 requests/hour)
   - Ensure your API key is active

4. **AI API Error**
   - Check your API key and billing status
   - Verify the API endpoint is accessible
   - Check for any API-specific error messages

### Getting Help

- Check the browser console for error messages
- Review the server logs for backend errors
- Verify all environment variables are set correctly
- Test each service individually

## Next Steps

Once your setup is complete:

1. Set up automated bill processing with cron jobs
2. Configure monitoring and logging
3. Set up error tracking (e.g., Sentry)
4. Implement additional features from the roadmap 