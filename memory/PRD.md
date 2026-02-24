# OrderFlow Albania - PRD

## Problem Statement
Full-stack order management system in Albanian. Features: client management (Name, Surname, IG, Address, Phone), order management (client selection, photo upload, price, shipping type paid/free), JWT auth (max 2 users).

## Architecture
- **Frontend**: React + Tailwind + Shadcn/UI
- **Backend**: FastAPI + MongoDB (Motor)
- **Auth**: JWT with bcrypt password hashing
- **File Upload**: aiofiles to /app/backend/uploads/

## User Personas
- Small business owner managing client orders and shipments

## Core Requirements
- Albanian language interface
- Max 2 user accounts
- Client CRUD (name, surname, ig_name, address, phone)
- Order CRUD (client selection, photo upload, price, shipping type)
- Dashboard with stats

## What's Been Implemented (Jan 2026)
- Full authentication (register/login/logout) with 2-user limit
- Client management (add, edit, delete, search)
- Order management (create with client selection, photo upload, price, shipping)
- Dashboard with stats (total clients, orders, revenue, pending/completed)
- Albanian UI throughout
- Responsive design with Outfit/Inter fonts, orange accent theme

## Prioritized Backlog
### P0 (Done)
- Auth, Client CRUD, Order CRUD, Dashboard, File Upload

### P1
- Export data to CSV/Excel
- Order status history/timeline
- Client order history view

### P2
- Print invoice/receipt
- SMS/WhatsApp notification
- Analytics charts (monthly revenue, orders trend)
- Multiple product photos per order
