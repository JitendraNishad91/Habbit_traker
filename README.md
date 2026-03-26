# Smart Habit Tracker

A beautiful MERN stack habit tracking application with focus timer, progress tracking, and animated UI.

![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb)
![Express](https://img.shields.io/badge/Express-5.2.1-000000?logo=express)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.38.0-FF0055?logo=framer)

---

## Features

### Authentication
- User registration with gender selection (Male/Female)
- Login with email and password
- JWT-based authentication
- Gender-specific avatars (Avataaars for male, Lorelei for female)

### Dashboard Pages
| Page | Route | Description |
|------|-------|-------------|
| Habits | `/dashboard/habits` | Create and manage habits |
| Focus Timer | `/dashboard/focus` | Countdown timer for focused work |
| Progress Table | `/dashboard/table` | Monthly calendar view of completions |

### Habit Management
- Create new habits with title and optional description
- Toggle habit completion for current day
- Delete habits
- Track completion streaks
- Visual progress indicators

### Focus Timer
- Set custom countdown duration
- Link timer to specific habits
- **Timer persists across all pages** (using React Context)
- Mini timer display in navbar when on other pages
- Pause/Resume/Stop controls
- Log focus time to habits
- Auto-reset when complete (no celebration screen)

### UI/UX Features
- Dark blue gradient theme (`#0a1628`, `#0d2137`, `#0f2847`)
- Glassmorphism design with backdrop blur
- Smooth page transitions (Framer Motion)
- Responsive design with mobile support
- Safe area insets for mobile browsers
- Animated logo and buttons
- Profile dropdown with user info
- Custom avatars via DiceBear API

---

## Tech Stack

### Frontend
- **React 19.2.4** - UI framework
- **React Router 7** - Client-side routing
- **Framer Motion 12** - Animations
- **Axios** - HTTP client
- **Recharts 3** - Data visualization (future use)

### Backend
- **Express 5.2.1** - Web framework
- **Supabase** - PostgreSQL Database (https://hknrrdgcqxyl</minimax:tool_call>ggakcpsk.supabase.co)
- **@supabase/supabase-js** - Supabase client
- **JSON Web Token** - Authentication
- **BcryptJS** - Password hashing
- **CORS** - Cross-origin support

---

## Project Structure

```
habbit_tracker/
├── client/                    # React frontend
│   ├── public/
│   │   ├── index.html         # HTML template
│   │   └── logo.png           # App logo
│   └── src/
│       ├── App.js             # Main app with routing
│       ├── index.css          # Global styles
│       ├── components/
│       │   └── Navbar.js      # Navigation with mini timer
│       ├── context/
│       │   └── TimerContext.js # Timer state management
│       └── pages/
│           ├── Login.js        # Login page
│           ├── Register.js     # Registration with gender
│           ├── HabitsPage.js    # Habits list
│           ├── FocusPage.js    # Focus timer
│           ├── TablePage.js    # Progress calendar
│           └── DashboardLayout.js # Layout wrapper
├── server/                    # Express backend
│   ├── server.js              # Entry point
│   ├── supabase.js            # Supabase client
│   ├── supabase_schema.sql    # Database setup SQL
│   └── routes/
│       ├── auth.js            # Auth endpoints
│       └── habits.js          # Habit endpoints
├── package.json               # Root package.json
└── README.md                  # This file
```

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Supabase account (already configured!)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd habbit_tracker
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client && npm install && cd ..
   ```

4. **Configure environment** (optional - already has Supabase URL)
   
   Create `.env` in `server/` folder:
   ```
   PORT=5000
   SUPABASE_URL=https://hknrrdgcqxyl别克cpsk.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   JWT_SECRET=your_secret_key
   ```

5. **Setup Supabase Database Tables**
   
   Go to Supabase Dashboard > SQL Editor and run the SQL from:
   ```
   server/supabase_schema.sql
   ```

### Running the Application

**Development mode (runs both server and client)**
```bash
npm run dev
```

**Run server only**
```bash
npm run server
```

**Run client only**
```bash
npm run client
```

**Build for production**
```bash
cd client && npm run build
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | `{ name, email, password }` |
| POST | `/api/auth/login` | Login user | `{ email, password }` |

**Register Response:**
```json
{
  "_id": "user_id",
  "name": "John",
  "email": "john@example.com"
}
```

**Login Response:**
```json
{
  "token": "jwt_token",
  "userId": "user_id",
  "name": "John"
}
```

### Habits

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/habits/create` | Create habit | `{ userId, title, description? }` |
| GET | `/api/habits/all/:userId` | Get user habits | - |
| DELETE | `/api/habits/:id` | Delete habit | - |
| POST | `/api/habits/toggle/:id` | Toggle today's completion | `{ date }` |
| POST | `/api/habits/focus-log` | Log focus time | `{ habitId, timeSpent, date }` |
| GET | `/api/habits/focus-logs/:userId` | Get focus logs | - |

---

## Data Models (Supabase PostgreSQL)

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | User's name |
| email | TEXT | Unique email |
| password | TEXT | Hashed password |
| created_at | TIMESTAMP | Creation time |

### Habits Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| title | TEXT | Habit name |
| description | TEXT | Category/description |
| completed_dates | TEXT[] | Array of date strings |
| created_at | TIMESTAMP | Creation time |

### Habit_Logs Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| habit_id | UUID | Foreign key to habits |
| date | TEXT | Date string (YYYY-MM-DD) |
| time_spent | INTEGER | Seconds focused |
| completed | BOOLEAN | Completion status |
| created_at | TIMESTAMP | Creation time |

---

## Context & State Management

### TimerContext
Persists timer state across all pages using React Context.

**Provided Values:**
- `seconds` - Current countdown seconds
- `isRunning` - Timer is actively counting
- `isPaused` - Timer is paused
- `selectedHabit` - Habit linked to timer
- `setTimer(seconds)` - Initialize timer
- `pauseTimer()` - Pause countdown
- `resumeTimer()` - Resume countdown
- `stopTimer()` - Reset timer

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both server and client concurrently |
| `npm run server` | Run Express server only |
| `npm run client` | Run React dev server only |
| `cd client && npm run build` | Build for production |
| `cd client && npm start` | Run production build |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `SUPABASE_URL` | https://hknrrdgcqxyl别克cpsk.supabase.co | Supabase project URL |
| `SUPABASE_KEY` | your-supabase-anon-key | Supabase anon/public key |
| `JWT_SECRET` | secret | JWT signing secret |

---

## Features In Detail

### Gender-Based Avatars
Users select gender during registration:
- **Male** → Avataaars style (colorful cartoon avatars)
- **Female** → Lorelei style (illustrated female avatars)

Avatar URLs are generated using DiceBear API with user ID as seed.

### Timer Persistence
The Focus Timer uses React Context to maintain state across page navigations:
- Start timer on Focus page
- Navigate to Habits or Table
- Mini timer appears in navbar
- Controls: Pause, Resume, Stop
- Timer continues counting down

### Progress Table
Monthly calendar view showing:
- Each day of the current month
- Green highlight for completed habits
- Click to toggle today's completion
- Visual streak indicators

---

## Troubleshooting

### MongoDB Connection Issues
```
MongooseServerSelectionError: connect ECONNREFUSED
```
**Solution:** Ensure MongoDB is running (`mongod`)

### CORS Errors
```
Access-Control-Allow-Origin blocked
```
**Solution:** Verify `cors()` middleware is enabled in `server.js`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change port in `server/server.js` or kill the process using that port

### Client Not Loading
```
Module not found: Error: Can't resolve '...'
```
**Solution:** Run `cd client && npm install`

---

## Future Enhancements

- [ ] Add statistics/dashboard with Recharts
- [ ] Implement weekly/monthly streak analysis
- [ ] Add habit categories/tags
- [ ] Notifications and reminders
- [ ] Export data to CSV/PDF
- [ ] Dark/Light theme toggle
- [ ] Social features (share habits)
- [ ] Mobile app (React Native)

---

## License

ISC

---

Built with ❤️ using MERN Stack
