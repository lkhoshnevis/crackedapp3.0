# DVHS Alumni Ranking Website

A gamified alumni ranking website for Dougherty Valley High School (DVHS) where users vote between randomly selected alumni profiles to determine who's "more cracked." Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Gamified Voting System**: Vote between alumni profiles with ELO ranking system
- **Semantic Search**: Smart search using vector embeddings and cosine similarity
- **Real-time Updates**: Live ELO changes and leaderboard updates across all users
- **Google Authentication**: Sign in with Google for premium features
- **Contact Access**: Authenticated users can access contact information
- **CSV Data Management**: Admin panel for uploading and managing alumni data
- **Analytics Tracking**: Comprehensive analytics for user behavior and interactions
- **Mobile Responsive**: Optimized for all screen sizes

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Deployment**: Vercel
- **Real-time**: Supabase Real-time subscriptions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Console project (for OAuth)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dvhs-alumni-ranking
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
3. Enable Google OAuth in Supabase Auth settings
4. Configure Google OAuth credentials

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.vercel.app/auth/callback` (production)
6. Add the client ID and secret to your environment variables

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## CSV Data Format

The admin panel accepts CSV files with the following columns:

- `Profile_Name`
- `addressWithoutCountry`
- `Profile_Picture_URL`
- `high_school`
- `high_school_logo`
- `DVHS class of`
- `College_1_Name`, `College_1_Degree`, `College_1_Logo`
- `College_2_Name`, `College_2_Degree`, `College_2_Logo`
- `College_3_Name`, `College_3_Degree`, `College_3_Logo`
- `Experience_1_Company`, `Experience_1_Role`, `Experience_1_Logo`
- `Experience_2_Company`, `Experience_2_Role`, `Experience_2_Logo`
- `Experience_3_Company`, `Experience_3_Role`, `Experience_3_Logo`
- `Experience_4_Company`, `Experience_4_Role`, `Experience_4_Logo`
- `linkedinUrl`
- `Email`
- `Phone number`

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Set these in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Database Schema

The application uses the following main tables:

- `alumni_profiles`: Main alumni data with ELO ratings
- `vote_sessions`: Tracks all voting activity
- `elo_history`: Historical ELO changes
- `search_analytics`: Search query analytics
- `user_profiles`: Authenticated user data
- `session_analytics`: Session-based behavior tracking
- `vote_analytics`: Individual vote tracking
- `contact_click_analytics`: Contact information access tracking

## Key Features

### Voting System
- Random profile pairing with ELO-based matching
- Winner gains +15 ELO, loser loses -15 ELO
- Equal votes result in no ELO change
- Preloading system for zero dead time between votes

### Semantic Search
- Vector embeddings for natural language queries
- Cosine similarity for relevance scoring
- Context-aware search results
- Enhanced query processing for common abbreviations

### Real-time Updates
- Live ELO changes across all users
- Real-time leaderboard updates
- Live voting indicators
- Session synchronization

### Analytics
- Comprehensive user behavior tracking
- Search query analytics
- Vote pattern analysis
- Contact engagement metrics

## API Routes

The application uses Supabase for all backend operations:

- **Authentication**: Supabase Auth with Google OAuth
- **Database**: PostgreSQL with real-time subscriptions
- **File Storage**: Supabase Storage for profile pictures
- **Analytics**: Custom analytics tracking system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [your-email] or create an issue in the repository.

## Acknowledgments

- Built for the Dougherty Valley High School community
- Inspired by gamified ranking systems
- Uses modern web technologies for optimal performance
