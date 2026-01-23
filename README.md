# Patient Hub - Frontend Application

A modern healthcare management system built with React 19, TypeScript, and Supabase.

## ✨ Features

- 🔐 **Supabase Authentication** - Secure login, signup, and session management
- 👥 **Patient Management** - Create, view, and manage patient records
- 💊 **Prescription System** - Create and track prescriptions
- 📊 **Dashboard** - Overview of patients and recent activity
- 🎨 **Modern UI** - Built with Radix UI and Tailwind CSS
- 🔄 **Real-time Updates** - React Query for data synchronization
- 📱 **Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npm install @supabase/supabase-js
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update with your credentials:

```bash
# Backend API
VITE_API_BASE_URL=http://localhost:3000/api

# Supabase (get from https://app.supabase.com)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:8080`

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md) | **START HERE** - Complete overview |
| [QUICK_START.md](./QUICK_START.md) | Quick reference guide |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Supabase authentication setup |
| [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) | Backend API integration details |

## 🏗️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Supabase** - Authentication & database
- **React Query** - Data fetching & caching
- **Zustand** - State management
- **Radix UI** - Accessible components
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 🔐 Authentication

This app uses **Supabase Auth** for authentication:

1. User logs in with email/password
2. Supabase validates and returns JWT token
3. Token is sent to your backend for verification
4. Backend returns user info with role
5. Token is included in all API requests

**No Supabase?** The app falls back to mock authentication for development.

## 📡 API Integration

All API calls go through your backend at `http://localhost:3000/api`:

- `POST /api/auth/verify` - Verify JWT token
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient details
- `GET /api/patients/:id/history` - Get patient history
- `GET /api/prescriptions/patient/:id` - Get prescriptions
- `POST /api/prescriptions` - Create prescription

See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for details.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── services/        # API services
│   ├── api.ts              # Axios instance
│   ├── auth.service.ts     # Supabase Auth
│   ├── patient.service.ts  # Patient API
│   └── prescription.service.ts
├── lib/             # Utilities
│   └── supabase.ts         # Supabase client
├── store/           # Zustand stores
├── types/           # TypeScript types
└── hooks/           # Custom React hooks
```

## 🔧 Configuration

### Environment Variables

Required variables in `.env`:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api

# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Get credentials from Settings → API
3. Enable Email authentication
4. Configure redirect URLs

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

## 🧪 Testing

### With Mock Auth (No Supabase)
```bash
# Just start the app without configuring Supabase
npm run dev

# Login with any email/password (6+ chars)
```

### With Real Supabase
```bash
# Configure .env with Supabase credentials
# Create test user in Supabase dashboard
# Login with real credentials
```

## 🐛 Troubleshooting

### "Supabase not configured"
- Update `.env` with real Supabase credentials
- Restart dev server

### "Network Error"
- Ensure backend is running on `http://localhost:3000`
- Check CORS settings on backend

### "Token verification failed"
- Verify backend can validate Supabase JWT tokens
- Check backend has correct Supabase JWT secret

See [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md) for more troubleshooting.

## 📦 Recent Updates

### Latest Changes
- ✅ Updated all packages to latest versions (React 19, Zod 4, etc.)
- ✅ Integrated Supabase Authentication
- ✅ Connected to backend API
- ✅ Fixed prescriptions page routing
- ✅ Added automatic JWT token management
- ✅ Implemented role-based access control

## 🤝 Contributing

1. Make sure backend is running
2. Configure Supabase credentials
3. Create feature branch
4. Make changes
5. Test thoroughly
6. Submit PR

## 📄 License

[Your License Here]

## 🆘 Support

- Check documentation in `/docs` folder
- Review [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md)
- Check browser console for errors
- Verify backend is running

---

**Ready to go!** 🚀 Start with [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md) for a complete overview.
