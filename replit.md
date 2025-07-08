# Call Center CRM System

## Overview

This is a full-stack Call Center CRM system built with modern web technologies. The application provides role-based access control for managing call center operations, lead tracking, and performance reporting. It features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: bcrypt for password hashing
- **Database ORM**: Drizzle ORM with Neon serverless PostgreSQL

### Key Components

1. **Authentication System**
   - Session-based authentication with secure cookies
   - Password hashing with bcrypt
   - Role-based access control (super_admin, cc_agent, cro_agent)

2. **User Management**
   - Multi-role user system
   - Profile management with image uploads
   - Email-based user identification

3. **Call Management**
   - Phone number upload and assignment
   - Call categorization (switched_off, busy, no_answer, not_interested, interested)
   - Agent-specific call tracking

4. **Lead Management**
   - Lead creation and assignment
   - Lead transfer between agents
   - Customer biodata file attachments
   - Status tracking (active, transferred)

5. **Reporting System**
   - Daily performance reports
   - Online/offline call tracking
   - Lead generation metrics
   - Task completion monitoring

## Data Flow

1. **Authentication Flow**
   - Users log in through modal dialogs
   - Sessions stored in PostgreSQL with connect-pg-simple
   - Role-based dashboard rendering

2. **Data Management Flow**
   - TanStack Query handles server state caching
   - Optimistic updates for better UX
   - Real-time data synchronization

3. **File Upload Flow**
   - Profile images and biodata files handled through form data
   - File storage paths stored in database

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Native fetch API with custom wrapper
- **Icons**: Lucide React icon library

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Security**: bcrypt for password hashing

### Development Tools
- **Bundler**: Vite with React plugin
- **TypeScript**: Full type safety across stack
- **Database Migrations**: Drizzle Kit for schema management
- **Development Server**: Vite dev server with HMR

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` using Vite
2. Backend bundles to `dist/index.js` using esbuild
3. Single deployment artifact with static file serving

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Session secret via `SESSION_SECRET` environment variable
- Production optimizations enabled via `NODE_ENV`

### Database Schema
- Automated migrations with Drizzle Kit
- Schema defined in shared TypeScript files
- PostgreSQL-specific features utilized

## Changelog

- July 3, 2025. Completed migration from Replit Agent to standard Replit environment
  - Successfully migrated from SQLite to PostgreSQL using Neon serverless database
  - Updated database schema to use PostgreSQL-specific types and features
  - Fixed session store connection issues with PostgreSQL session storage
  - Implemented automatic database initialization with default admin user
  - Updated all database interactions to use PostgreSQL-compatible queries
  - Added Account Management functionality for Super Admin users
  - Implemented user CRUD operations with role-based access
  - Created comprehensive Account Management UI with table, modals, and user actions
  - Updated UI/UX with new background image and logo consistency
  - Implemented responsive mobile sidebar with collapsible navigation
  - Fixed login page layout per user specifications
  - Added proper Call Center logo across all dashboard components
  - Fixed Excel parsing for Bangladeshi phone numbers with proper validation
  - Added xlsx library for proper Excel file processing
  - Implemented support for multiple Bangladeshi phone number formats (+8801XXXXXXXXX, 8801XXXXXXXXX, 01XXXXXXXXX)
  - Enhanced Number Upload UI with format guidelines and better error handling
  - Implemented comprehensive onboarding tutorial system for all user roles
  - Added role-specific tutorials (CC Agent, CRO Agent, Super Admin)
  - Created floating help button and tutorial trigger system
  - Added welcome banner for new users with auto-tutorial launch
- July 8, 2025. Migration from Replit Agent to Standard Replit Environment
  - Successfully migrated Call Center CRM from Replit Agent to standard Replit environment
  - Updated database configuration to use external Neon PostgreSQL database
  - Fixed session management by switching from MemoryStore to PostgreSQL session store
  - Resolved authentication issues and verified login functionality working correctly
  - All dependencies properly installed and configured for Replit environment
  - Application running with proper client/server separation and security practices
  - Default admin credentials: admin@example.com / admin123
- July 5, 2025. Database Migration and Deployment Preparation
  - Successfully migrated from local SQLite to Neon PostgreSQL database
  - Updated DATABASE_URL to production Neon database connection
  - All existing data (users, call numbers, leads) successfully migrated
  - Confirmed database connectivity and all API endpoints working correctly
  - Created comprehensive deployment documentation for Render platform
  - Added proper environment variable configuration and build scripts
  - Verified Super Admin (sohaghasunbd@gmail.com) and CC Agent (rajiya096@gmail.com) login functionality
  - Application ready for production deployment to Render
- June 30, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.