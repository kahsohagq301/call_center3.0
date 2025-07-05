# Call Center CRM System

A comprehensive Call Center Customer Relationship Management system built with modern web technologies.

## Features

- **Multi-Role Authentication**: Super Admin, CC Agent, and CRO Agent roles
- **Call Management**: Upload, assign, and track customer calls
- **Lead Management**: Create, transfer, and manage leads
- **Reporting System**: Daily performance tracking and analytics
- **Number Upload**: Excel file processing for bulk phone number uploads
- **Automatic Cleanup**: Categorized call numbers auto-delete after 24 hours

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- TanStack Query for state management
- Wouter for routing

### Backend
- Node.js with Express.js
- TypeScript
- Drizzle ORM with PostgreSQL
- Neon serverless database
- Session-based authentication
- bcrypt for password hashing

## Deployment to Render

### Prerequisites
1. A Render account
2. A Neon database (already configured)
3. Git repository with your code

### Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Node Version**: 20

3. **Environment Variables**:
   Add these environment variables in Render:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_5XGq1Ovcmefi@ep-solitary-bar-a82cz7fs-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
   SESSION_SECRET=call-center-crm-secret-key-2025
   NODE_ENV=production
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically deploy your application

### Default Login Credentials

**Super Admin**:
- Email: `sohaghasunbd@gmail.com`
- Password: `sohagq301`

**CC Agent** (for testing):
- Email: `rajiya096@gmail.com`
- Password: `123456`

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env` and update with your database credentials.

3. **Run database migrations**:
   ```bash
   npx drizzle-kit push
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open [http://localhost:5000](http://localhost:5000)

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   ├── db.ts             # Database configuration
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── package.json
```

## License

This project is proprietary software for call center operations.