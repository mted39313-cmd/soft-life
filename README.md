# SoftLife

**"I TRUST YOU, YOU TRUST ME, BUT TRUST IS NOT SURE."**

SoftLife is a React web app for date and "send fare" bookings built around an escrow flow. Instead of sending fare blindly and hoping nobody ghosts or claims a dead battery, bookings lock in as **`Held in Escrow`**, users confirm arrival with a GPS pin (`Arrived - Ready to Release`), and an admin reviews and settles them (`Released` or `Refunded`).

## Live Links
- **Live Demo:** https://mted39313-cmd.github.io/soft-life/
- **Repository:** https://github.com/mted39313-cmd/soft-life

## What It Does
- **Escrow Booking Flow (`BookingModal.jsx`):** Connects to `http://localhost:5001` and saves bookings as `Held in Escrow` in Firestore.
- **Live Status & GPS Pin Check-In (`StatusTracker.jsx`):** Look up a booking by ID, follow live Firestore updates, and submit a GPS pin or Maps link to update status to `Arrived - Ready to Release`.
- **Admin Dashboard (`AdminDashboard.jsx`):** Review bookings, check arrival pins, and mark bookings as `Released` or `Refunded`.
- **Auth & Protected Routes (`AuthContext.jsx`, `Login.jsx`, `ProtectedRoute.jsx`):** Handles sign-in/access control and redirects signed-out users away from protected routes.

## Tech Stack
- **Frontend:** React, Vite, React Router, Tailwind CSS
- **Backend & Database:** Node.js, Express, Firebase (Authentication & Cloud Firestore)
- **Local Server Target:** `localhost:5001`
- **Testing & CI:** Vitest, React Testing Library, V8 Coverage, GitHub Actions

## Run It Locally

1. **Clone the repository and install dependencies**
   ```bash
   git clone [https://github.com/mted39313-cmd/soft-life.git](https://github.com/mted39313-cmd/soft-life.git)
   cd soft-life
   npm install

# Terminal 1 (if running your Express server on port 5001)
node server/index.js

# Terminal 2 (start the React app)
npm run dev

# Run unit & component tests
npm test

# Run tests with coverage report
npm run test:coverage

# Build for production
npm run build