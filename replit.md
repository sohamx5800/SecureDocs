# SecureDocs - Secure Document Access System

## Overview

SecureDocs is a secure document access system inspired by DigiLocker, built for logistics, transport, and import-export use cases. The system enables administrators to upload and manage documents (PDFs and images), generate access keys with QR codes, and provide controlled public access to documents via authentication keys.

The application features an admin panel for document management and key generation, plus a public-facing view where authorized users can access documents using secure access keys shared via QR codes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Build Tool**: Vite with hot module replacement

The frontend follows a pages-based structure with shared components. Protected routes use a wrapper component that checks authentication status before rendering admin pages.

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **Authentication**: Passport.js with local strategy, session-based auth
- **Session Storage**: PostgreSQL via connect-pg-simple
- **File Uploads**: Multer for multipart form handling, files stored in `./uploads` directory
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**:
  - `users`: Admin authentication
  - `documents`: Uploaded files metadata (title, filename, type, URL)
  - `accessKeys`: Generated access keys with optional labels and active status
- **Migrations**: Drizzle Kit for schema push (`npm run db:push`)

### Authentication Flow
- Admin users authenticate via username/password
- Sessions stored in PostgreSQL with 24-hour expiry
- Password hashing uses scrypt with random salt
- Public document access controlled via access keys (no user login required)

### File Handling
- Uploads stored locally in `./uploads` directory
- Files served statically via Express
- 10MB file size limit
- Unique filenames generated with timestamp and random suffix

### Build Process
- Development: `tsx` for TypeScript execution with Vite dev server
- Production: esbuild bundles server code, Vite builds client to `dist/public`
- Shared code between client and server in `shared/` directory

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication & Sessions
- **Passport.js**: Authentication middleware with local strategy
- **connect-pg-simple**: PostgreSQL session store

### UI Framework
- **Radix UI**: Headless UI primitives for accessibility
- **shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### QR Code Generation
- **react-qr-code**: Client-side QR code generation for access keys

### File Processing
- **Multer**: Multipart form data handling for file uploads

### Utilities
- **Zod**: Schema validation for API requests and responses
- **date-fns**: Date formatting utilities
- **nanoid**: Unique ID generation

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Optional, defaults to a hardcoded value (should be set in production)