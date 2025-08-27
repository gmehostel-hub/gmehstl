# Hostel Management System

A full-stack web application for managing hostel operations with role-based access for Admin, Warden, and Students.

## Features

### Authentication
- Login system for Admin, Warden, and Students
- Role-based access control (RBAC)

### Admin Dashboard
- Manage student profiles
- Manage library books
- View room allocations
- Track placement status
- Respond to student queries
- View library records

### Warden Dashboard
- Manage room occupancy
- View student complaints/queries
- Access room-wise student data

### Student Dashboard
- View profile and room details
- Request hostel facilities
- Track library books
- Submit queries

### Hostel Room Management
- 31 rooms with 6-student capacity each
- Special purpose rooms

### Library Management
- Book tracking system
- Overdue notifications

## Technology Stack

- Frontend: React.js with Tailwind CSS
- Backend: Node.js with Express
- Database: MongoDB
- Email Service: Nodemailer

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for both frontend and backend
   ```
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
3. Set up environment variables
4. Start the development servers

## Project Structure

```
/
├── frontend/           # React.js application
├── backend/            # Node.js + Express API
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   └── server.js       # Entry point
└── README.md           # Project documentation
```