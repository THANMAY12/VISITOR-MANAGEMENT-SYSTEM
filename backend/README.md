# Visitor Management System - Backend

This is the backend API for the Visitor Management System, built with Node.js, Express, and MongoDB.

## Features

- RESTful API architecture.
- JWT-based authentication and role-based middleware.
- In-memory PDF generation with PDFKit.
- QR code generation and data encoding.
- Cloudinary integration for file uploads and storage.
- Automated Email and SMS notifications.

## Folder Structure

- config: Database and Cloudinary configurations.
- controllers: Business logic for auth, visitors, appointments, and passes.
- middleware: Authentication and role authorization checks.
- models: Mongoose schemas for Users, Visitors, Appointments, and Passes.
- routes: API endpoint definitions.
- utils: Helper functions for Email and SMS.

## Environment Variables

The following variables are required in a `.env` file:

- PORT: Server port (e.g., 4000).
- MONGO_URI: MongoDB connection string.
- JWT_SECRET: Secret key for signing tokens.
- CLOUDINARY_CLOUD_NAME: Cloudinary account name.
- CLOUDINARY_API_KEY: Cloudinary API key.
- CLOUDINARY_API_SECRET: Cloudinary API secret.
- EMAIL_USER: SMTP email address for notifications.
- EMAIL_PASS: SMTP password or app-specific password.
- TWILIO_SID: Twilio account SID.
- TWILIO_AUTH_TOKEN: Twilio auth token.
- TWILIO_PHONE: Twilio phone number.

## Setup Instructions

1. Navigate to the folder: `cd backend`
2. Install dependencies: `npm install`
3. Configure Environment: Create a `.env` file with the variables listed above.
4. Run Server: `npm start`
