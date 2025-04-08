# Project KALAM

This is a web application for Undivided Capital, designed to identify and evaluate promising founders globally.

## Getting Started

### Local Development

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd frontend2
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   ```bash
   cp .env.example .env.local
   ```
   - Update the variables with your Supabase project details

4. Start the development server
   ```bash
   npm start
   ```

### Production Deployment

1. Set up Supabase Authentication
   - In your Supabase dashboard, go to Authentication → URL Configuration
   - Add your production site URL to the "Site URL" field
   - Add additional redirect URLs if needed

2. Set environment variables in your hosting platform
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_SITE_URL` (your production domain)

3. Build the project
   ```bash
   npm run build
   ```

4. Deploy the `/build` directory to your hosting provider

## Authentication Troubleshooting

If authentication isn't working in production:

1. Check that your Supabase Site URL is set correctly
2. Verify your environment variables are properly set
3. Ensure CORS is properly configured in Supabase
4. Check browser console for any errors
5. Confirm that your deployment has the latest code with authentication fixes
