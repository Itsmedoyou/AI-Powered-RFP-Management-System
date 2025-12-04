# RFP Automation Platform

## Overview

This is a single-user web application designed to automate the Request for Proposal (RFP) workflow end-to-end. The platform enables procurement managers to create RFPs from natural language descriptions, manage vendor relationships, send RFPs via email, receive and parse vendor responses automatically, and compare proposals with AI-assisted recommendations.

**Core Capabilities:**
- Natural language RFP generation using AI
- Vendor master data management
- Automated email-based RFP distribution
- AI-powered parsing of vendor responses from emails
- Intelligent proposal comparison with scoring and recommendations

**Technology Foundation:**
- Full-stack TypeScript application
- React frontend with modern UI components (shadcn/ui)
- Express.js backend
- PostgreSQL database with Drizzle ORM
- OpenAI GPT-5 integration for AI features
- Email integration via Nodemailer (SMTP)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18 with TypeScript via Vite build tool
- Client-side routing using Wouter (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod validation for form handling

**UI Component System:**
- shadcn/ui component library (Radix UI primitives + Tailwind CSS)
- Design system follows Linear/Notion-inspired principles emphasizing clarity and productivity
- Custom theming with light/dark mode support
- Responsive layouts with mobile-first approach

**State Management Strategy:**
- Server state managed via TanStack Query with automatic caching and invalidation
- Local UI state handled with React hooks (useState, useReducer)
- No global state management library needed due to server-centric data flow

**Key Pages:**
- Dashboard: Overview statistics and recent RFPs
- RFP Creation: Chat-like natural language input with AI conversion to structured data
- RFP List: Searchable, filterable list of all RFPs
- RFP Detail: Full RFP view with vendor selection and proposal management
- Comparison View: Side-by-side proposal analysis with AI recommendations
- Vendors: Master vendor directory with CRUD operations

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- RESTful API design pattern
- JSON request/response format
- Centralized error handling

**Database Layer:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database queries
- Schema-first approach with shared types between client and server
- In-memory storage implementation for development (MemStorage class)

**Data Models:**
- RFPs: Title, line items, budget, delivery terms, mandatory/optional criteria, status tracking
- Vendors: Contact information, capabilities, ratings, tags
- Proposals: Vendor responses with parsed line items, pricing, terms
- Dashboard Stats: Aggregated metrics for overview

**API Structure:**
- `/api/dashboard/stats` - Dashboard metrics
- `/api/rfps` - RFP CRUD operations
- `/api/rfps/from-nl` - Natural language to structured RFP conversion
- `/api/rfps/:id/send` - Send RFP to selected vendors
- `/api/rfps/:id/proposals` - Proposal management
- `/api/rfps/:id/comparison` - AI-powered proposal comparison
- `/api/vendors` - Vendor CRUD operations
- `/api/email/webhook` - Incoming email processing endpoint

**Business Logic Services:**
- **AI Service**: OpenAI integration for NL parsing, proposal extraction, and comparison
- **Email Service**: Nodemailer for SMTP-based email sending with HTML templating
- **Storage Service**: Abstraction layer supporting both in-memory and database implementations

### AI Integration Strategy

**Model Selection:**
- OpenAI GPT-5 (latest model as of August 2025)
- Structured output via prompt engineering with JSON schema enforcement

**AI Use Cases:**

1. **RFP Extraction from Natural Language:**
   - Input: Freeform text describing procurement needs
   - Output: Structured RFP object with title, items, budget, delivery terms, criteria
   - Prompt strategy: Strict JSON output with null handling for missing fields

2. **Vendor Response Parsing:**
   - Input: Email body with freeform text, tables, or attachments
   - Output: Structured proposal with line items, pricing, terms
   - Handles various formats and extracts vendor identification

3. **Proposal Comparison & Recommendation:**
   - Input: Multiple vendor proposals for same RFP
   - Output: Summary comparison, recommended vendor, reasoning
   - Scoring criteria: Price, delivery time, warranty, completeness, vendor rating
   - Produces actionable insights for procurement decisions

### Email Integration

**Sending Architecture:**
- Nodemailer transporter with SMTP configuration
- HTML email templating with inline styles
- RFP details formatted as readable tables
- Support for both SMTP and API-based providers (SendGrid configured but not primary)

**Receiving Strategy:**
- Webhook endpoint for incoming emails (`/api/email/webhook`)
- Email parsing with vendor identification
- Automatic AI extraction of proposal data
- Proposal storage and RFP status updates

**Configuration:**
- Environment variables for SMTP credentials
- Mailtrap.io as default development SMTP server
- Production-ready for real SMTP providers

### Data Persistence

**Database Setup:**
- Drizzle Kit for migrations and schema management
- Schema defined in `shared/schema.ts` for type safety across stack
- Environment-based database URL configuration
- Support for Neon serverless PostgreSQL

**Development Mode:**
- In-memory storage (`MemStorage` class) for rapid development
- Seeded with sample data for testing
- Falls back to database in production

**Type Safety:**
- Shared Zod schemas between frontend and backend
- Automatic TypeScript type inference from schemas
- Runtime validation on API boundaries

### Build & Deployment

**Development:**
- Vite dev server with HMR for frontend
- tsx for TypeScript execution without compilation
- Concurrent frontend/backend development

**Production Build:**
- Vite builds frontend to `dist/public`
- esbuild bundles backend with dependency bundling for cold start optimization
- Server-side rendering of index.html
- Static asset serving via Express

**Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API credentials (required for AI features)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration

## Configuration Guide

### Setting Up OpenAI API Key (Required for AI Features)

The AI-powered features require a valid OpenAI API key:
1. Get an API key from https://platform.openai.com/api-keys
2. Add the key as a secret named `OPENAI_API_KEY` in Replit Secrets
3. Restart the application

**AI Features that require the key:**
- Natural language to structured RFP conversion
- Automatic proposal parsing from vendor emails
- Intelligent proposal comparison with AI recommendations

Without a valid key, these features will use fallback/sample data.

### Setting Up Email (Optional)

For sending RFPs to vendors via email:
1. Configure SMTP settings in Secrets:
   - `SMTP_HOST` - e.g., smtp.mailtrap.io for testing
   - `SMTP_PORT` - e.g., 2525
   - `SMTP_USER` - Your SMTP username
   - `SMTP_PASS` - Your SMTP password

For development, you can use Mailtrap.io (free tier) to test email sending.

## External Dependencies

### Third-Party Services

**OpenAI API:**
- Purpose: Natural language processing and AI-powered features
- Integration: Official OpenAI Node.js SDK
- Model: GPT-5 (configured as latest model)
- Usage: RFP extraction, proposal parsing, comparison analysis

**Email Provider (SMTP):**
- Default: Mailtrap.io for development/testing
- Production: Configurable SMTP server (Gmail, SendGrid, etc.)
- Purpose: Sending RFPs to vendors and receiving responses
- Library: Nodemailer

**Neon Database:**
- Purpose: Serverless PostgreSQL hosting
- Driver: @neondatabase/serverless
- Benefits: Auto-scaling, branching, edge compatibility

### Key NPM Packages

**Frontend Core:**
- `react`, `react-dom` - UI framework
- `@tanstack/react-query` - Server state management
- `wouter` - Routing
- `react-hook-form` + `@hookform/resolvers` - Form handling
- `zod` - Schema validation
- `date-fns` - Date formatting

**UI Components:**
- `@radix-ui/*` - Headless UI primitives (20+ components)
- `tailwindcss` - Utility-first CSS
- `class-variance-authority`, `clsx`, `tailwind-merge` - Styling utilities
- `lucide-react` - Icon library

**Backend Core:**
- `express` - Web server framework
- `drizzle-orm`, `drizzle-zod` - Database ORM and schema validation
- `openai` - OpenAI SDK
- `nodemailer` - Email sending
- `zod` - Schema validation

**Development Tools:**
- `vite` - Frontend build tool
- `tsx` - TypeScript execution
- `esbuild` - Backend bundler
- `drizzle-kit` - Database migration tool

### Database Schema

**Tables (defined via Drizzle ORM):**
- RFPs table: Stores all RFP records with JSONB fields for items and criteria
- Vendors table: Master vendor database with contact and capability information
- Proposals table: Vendor responses linked to RFPs with parsed line items
- Sessions table: Optional session storage via connect-pg-simple

**Type Safety:**
- All schemas defined with Zod for runtime validation
- Drizzle automatically infers TypeScript types
- Shared schema definitions prevent client/server drift