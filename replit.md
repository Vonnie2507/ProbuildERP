# Probuild PVC - ERP & CRM System

## Overview
A comprehensive ERP & CRM system for Probuild PVC, a Western Australian PVC fencing manufacturer. The system manages the complete workflow from lead intake through quoting, production, scheduling, installation, and payments for both public customers and trade clients.

## Tech Stack
- **Frontend**: React 18 + TypeScript, Vite, TanStack Query v5, Wouter (routing)
- **Backend**: Express.js, Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Payments**: Stripe integration
- **Notifications**: Twilio SMS integration
- **Design**: Carbon Design System principles with brand colors

## Brand Colors
- **Dark Teal (Primary)**: #213d42
- **Orange (Accent)**: #db5c26
- **Pale Beige (Background)**: #f5e5d6

## Project Structure
```
├── client/src/
│   ├── components/
│   │   ├── shared/          # StatusBadge, StatCard, DataTable, etc.
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── inventory/       # InventoryTable
│   │   ├── layout/          # AppSidebar, ThemeToggle
│   │   └── ui/             # shadcn components
│   ├── pages/
│   │   ├── Dashboard.tsx    # Main dashboard with stats
│   │   ├── Leads.tsx        # Lead management
│   │   ├── Jobs.tsx         # Job tracking
│   │   ├── Production.tsx   # Production queue management
│   │   ├── Schedule.tsx     # Calendar & scheduling
│   │   ├── Clients.tsx      # Client database
│   │   ├── Inventory.tsx    # Products & stock management
│   │   ├── Payments.tsx     # Finance tracking
│   │   ├── Installer.tsx    # Mobile installer app
│   │   └── Trade.tsx        # Trade portal
│   └── lib/
│       └── queryClient.ts   # TanStack Query setup
├── server/
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Database operations
│   ├── seed.ts              # Seed data
│   └── index.ts             # Express server
└── shared/
    └── schema.ts            # Drizzle ORM schemas
```

## Database Schema
13 main entities:
- users, clients, leads, fenceStyles, products
- quotes, jobs, bom, productionTasks, installTasks
- scheduleEvents, payments, notifications, smsLogs, activityLogs, documents

## API Endpoints
All endpoints use `/api/` prefix:
- GET/POST/PATCH/DELETE for CRUD operations
- Stripe payment integration via `/api/payments/:id/create-checkout`
- Dashboard stats: `/api/dashboard/stats`

## User Roles
7 distinct roles with role-based permissions:
- admin, sales, scheduler, production_manager, warehouse, installer, trade_client

## Key Features
1. **Lead Management**: Track leads from initial contact to conversion
2. **Quote Builder**: Generate quotes with trade pricing rules
3. **Job Workflow**: Full lifecycle from acceptance to completion
4. **Production Queue**: Track manufacturing stages
5. **Scheduling**: Calendar-based install/delivery scheduling
6. **Inventory**: Stock management with reorder alerts
7. **Payments**: Stripe integration, deposit/final payment tracking
8. **Installer App**: Mobile-friendly installer interface
9. **Trade Portal**: Self-service for trade clients

## Development Notes
- All pages connected to real backend APIs
- Mock data removed and replaced with database queries
- StatusBadge component supports all job status types
- TanStack Query v5 object syntax used throughout

## Running the Project
```bash
npm run dev    # Starts Express + Vite dev server
npm run db:push # Push schema to database
npm run db:seed # Seed test data
```
