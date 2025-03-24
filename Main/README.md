# Health Management Platform

A modern web-based platform designed to help users manage their health by securely storing and analyzing full-body health reports. The system provides personalized diet and exercise recommendations while tracking users' progress through data visualization tools.

## Features

- **Secure Authentication**
  - User registration with email verification
  - Secure login system
  - Password reset functionality
  - Profile management

- **Health Report Management**
  - Secure upload and storage of health reports
  - Report analysis and visualization
  - Progress tracking with interactive charts
  - Historical data comparison

- **Exercise Tracking**
  - Indoor exercise guides
    - Plank
    - Push-ups
    - Squats
    - Yoga
  - Outdoor exercise guides
    - Running
    - Cycling
  - Detailed instructions and benefits for each exercise

- **Progress Visualization**
  - Interactive charts for health metrics
  - BMI tracking
  - Weight monitoring
  - Blood pressure tracking

## Technology Stack

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Chart.js for data visualization

- Backend:
  - Supabase for authentication and database
  - Supabase Storage for file management

## Setup and Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Configure Supabase
   - Create a Supabase project
   - Update `scripts/config.js` with your Supabase credentials:
```javascript
export const supabaseUrl = 'YOUR_SUPABASE_URL';
export const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

3. Set up the database tables in Supabase:
   - profiles (for user information)
   - health_reports (for uploaded reports)
   - progress_data (for tracking metrics)

4. Enable email verification in Supabase Authentication settings

## Features in Detail

### Authentication Flow
- User registration with email verification
- Secure login with session management
- Password reset functionality
- Profile management

### Health Report Management
- Upload health reports
- View and analyze reports
- Track progress over time
- Get personalized recommendations

### Exercise Guides
- Detailed instructions for each exercise
- Benefits and proper form guidance
- Progress tracking
- Categorized by indoor and outdoor activities

## Security Features

- Row Level Security (RLS) in Supabase
- Secure authentication flow
- Protected API endpoints
- Secure file storage

## Team

- Stephin Mathew 
- Prapanch J
- Kevin Biju 
- Jeswin Sabu

## Institution

St Joseph College Of Engineering And Technology, Palai

## Acknowledgments

- Chart.js for data visualization
- Supabase for backend services
- Font Awesome for icons
- Google Fonts for typography
