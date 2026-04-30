# Visitor Management System - Frontend

This is the frontend implementation of the Visitor Management System, built using React and Vite.

## Project Structure

- src/api: API configuration and Axios interceptors for JWT.
- src/components: Shared UI components (Layout, Sidebar).
- src/pages: Individual page components for different roles.

## Pages Overview

- Login: Entry point for all users.
- Public Visitor Register: Self-registration for visitors.
- Dashboard: Overview of stats (Admin) or check-in activity (Security).
- Visitor Dashboard: Personal portal for visitors to request appointments and download passes.
- Visitor Register: Internal form for employees to add visitors.
- Manage Visitors: Tool to approve pending visitor profiles.
- Appointments: Manage and approve visit requests.
- All Passes: Master list of issued passes (Admin).
- Lookup Pass: Search tool to find passes by email (Security).
- Scan: QR code scanner for checking visitors in and out.
- Logs: Audit trail of all check-in/out events.
- Create User: Admin tool to add system users (Employee, Security, Admin).

## Setup Instructions

1. Navigate to the folder: `cd frontend`
2. Install dependencies: `npm install`
3. Configure Environment: Create a `.env` file with `VITE_API_URL=http://localhost:4000/api`.
4. Run Development Server: `npm run dev`

The application will be available at `http://localhost:5173`.
