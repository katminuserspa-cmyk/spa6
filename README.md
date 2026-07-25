# Spa Management System - System Documentation & Knowledge Transfer

## 1. Executive Summary & Problem Statement

**High-Level Overview**
The Spa Management System is a comprehensive, all-in-one Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) platform specifically tailored for spas, salons, and wellness centers. The primary problem this application solves is the fragmentation of day-to-day salon operations—unifying appointment scheduling, staff management, point-of-sale (billing), inventory, customer retention, and business intelligence into a single, cohesive interface.

**Key Features**
- **Advanced Business Intelligence (BI) & Dashboard:** Real-time analytics, revenue tracking, and staff performance metrics.
- **Calendar & Booking Management:** Interactive scheduling, drag-and-drop appointments, and conflict resolution.
- **Customer Relationship Management (CRM):** Client profiles, visit history, preferences, and membership management.
- **Point of Sale & Billing:** Invoice generation, expense tracking, and financial reporting.
- **Staff & Service Management:** Employee rosters, role-based access control, commission tracking, and service cataloging.
- **Real-Time Updates:** WebSocket integration (Socket.io) for live calendar updates and notifications.

**Target Users / Consumers**
- **End-users:** Spa Owners (admin access, BI), Managers (operations), Receptionists (bookings, billing), and Staff/Therapists (viewing schedules).
- **External Interfaces:** The system exposes a RESTful API consumed entirely by the integrated front-end Single Page Application (SPA).

---

## 2. Directory Structure & File Inventory

The repository utilizes a modular structure, housing both the Node.js backend and the Vanilla JavaScript frontend within the same repository to simplify deployment (monolith architecture).

```text
├── backend/
│   ├── api/                 # Entry Point
│   │   └── index.js         # Main Express server initialization, routing, and middleware injection
│   ├── config/              # Configuration & Initialization
│   │   ├── auth.js          # JWT generation and validation logic
│   │   └── database.js      # MySQL connection pool (mysql2) and SSL configurations
│   ├── controllers/         # Request handling logic & business rules
│   │   ├── auth.controller.js       # Login, logout, profile management
│   │   ├── bookings.controller.js   # Appointment creation and scheduling logic
│   │   ├── advanced-bi.controller.js# Complex aggregations for dashboard analytics
│   │   └── [module].controller.js   # Module-specific logic (staff, services, customers, etc.)
│   ├── frontend/            # Integrated Single Page Application (SPA)
│   │   ├── app.html         # Main SPA shell and routing container
│   │   ├── login.html       # Authentication entry point
│   │   └── assets/          
│   │       ├── css/         # Modular CSS files and theme variables
│   │       ├── js/          # Frontend logic (api.js, app.js, module-specific JS)
│   │       └── lib/         # 3rd-party frontend libraries (PapaParse, SheetJS)
│   ├── middleware/          # Express Middlewares
│   │   └── error.middleware.js # Global error catching and response formatting
│   ├── models/              # Data Access Layer (Raw SQL queries)
│   │   ├── user.model.js    # User data interactions
│   │   └── [module].model.js# Entity-specific database operations
│   ├── routes/              # Express Route Definitions
│   │   └── [module].routes.js # Maps HTTP verbs/endpoints to corresponding controllers
│   ├── scripts/             # Utility and Setup Scripts
│   │   ├── init-db.js       # Database schema initialization
│   │   └── seedUsers.js     # Data seeding for development
│   ├── uploads/             # Directory for user-uploaded assets (images, receipts)
│   ├── utils/               # Helpers
│   │   └── logger.js        # Winston/Custom logging utility
│   ├── package.json         # Node.js dependencies and run scripts
│   └── .env                 # Environment variables (Ignored in VCS)
```

---

## 3. Tech Stack & Architectural Justification

**Core Stack:**
- **Backend Runtime:** Node.js
- **Web Framework:** Express.js (Chosen for its lightweight footprint, robust middleware ecosystem, and ease of building REST APIs).
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Chosen for zero-build-step simplicity, fast initial load, and avoiding heavy framework overhead for a standard dashboard UI).
- **Database:** MySQL (Relational data model perfectly suits the structured nature of bookings, users, and financial ledgers).

**Key Dependencies & Justifications:**
- `mysql2`: High-performance MySQL driver with built-in Promise support, essential for `async/await` database queries.
- `bcryptjs`: Industry-standard password hashing to secure user credentials.
- `jsonwebtoken (JWT)`: Enables stateless, scalable authentication across the API.
- `cors` & `compression`: Essential middlewares for cross-origin resource sharing and gzip payload reduction (60-80% bandwidth savings).
- `multer`: Handles `multipart/form-data` for robust file/image uploads.
- `socket.io`: Facilitates real-time, bi-directional communication (crucial for live calendar updates when multiple receptionists are booking simultaneously).
- `papaparse` & `xlsx` (Frontend): Client-side CSV/Excel parsing and export, offloading heavy report generation from the server to the client.

**Infrastructure:**
- Capable of running on standard VPS, Docker containers, or Serverless platforms (e.g., Vercel, given the `vercel.json` presence).

---

## 4. End-to-End System Architecture & Data Workflow

**System Design Overview (MVC / 3-Tier Architecture):**
The system follows a classic monolithic Model-View-Controller (MVC) pattern adapted for a RESTful API.
1. **Presentation Layer (Frontend SPA):** Captures user inputs and renders DOM updates via Vanilla JS modules. Communicates via HTTP/REST and WebSockets.
2. **Application Layer (Express API):** Routes requests, validates payloads, enforces JWT auth, and orchestrates business logic (Controllers).
3. **Data Access Layer (Models):** Executes raw SQL queries against the MySQL database and returns standard JS objects.

**Data Workflow Example (Creating a Booking):**
1. **Client (Browser):** User clicks "Save" on the calendar modal. `api.js` fires a `POST /api/bookings` request with JSON payload.
2. **Express Router (`bookings.routes.js`):** Intercepts request, passes it through Auth Middleware (verifies JWT token).
3. **Controller (`bookings.controller.js`):** Validates input data (checks if time slot is available, therapist is free).
4. **Model (`appointment.model.js`):** Executes `INSERT INTO bookings...` query via `mysql2` pool.
5. **Controller Response:** Sends `201 Created` back to client.
6. **Socket.io (Optional):** Emits a `booking_created` event to update all other connected clients in real-time.
7. **Client:** Updates the UI Calendar optimistically.

---

## 5. Core Business Logic & Algorithms (Deep Dive)

**Authentication & State Management:**
- Stateless JWT architecture. Upon login, the server signs a JWT and returns it. The frontend stores it in `localStorage` or `sessionStorage` and attaches it as a `Bearer` token in the `Authorization` header of all subsequent API calls via a central `api.js` wrapper.

**Advanced Business Intelligence (BI):**
- The `advanced-bi.controller.js` and `advanced-bi.model.js` form the analytical engine of the system.
- Instead of processing data in Node.js (which blocks the event loop), the application relies on **heavy SQL aggregations** (e.g., `GROUP BY`, `SUM()`, `COUNT()`, `JOIN`) to compute metrics like Month-over-Month growth, therapist utilization rates, and service popularity directly at the database level.

**Design Patterns Used:**
- **Module Pattern:** Frontend JS files are heavily modularized, encapsulating scope per feature (e.g., `dashboard.js`, `calendar.js`).
- **Repository Pattern (Loose):** The `models/` directory acts as a data repository, abstracting raw SQL queries away from the controllers.
- **Middleware Pattern:** Used extensively in Express for Error Handling, Authentication, and Request Parsing.

**Edge Case & Error Handling:**
- **Global Error Handler:** `middleware/error.middleware.js` captures unhandled exceptions in routes and normalizes the JSON error response, ensuring the server doesn't crash on bad requests and the client receives a predictable error schema.
- **Process Protection:** `process.on('uncaughtException')` and `unhandledRejection` hooks are implemented in `index.js` to log critical failures.

---

## 6. Setup, Configuration & Installation

**Prerequisites:**
- Node.js (v18.x or higher recommended)
- MySQL Server (v8.0+)
- Git

**Environment Variables (`.env`):**
Create a `.env` file in the `backend/` directory based on the following template:

```env
# Server Configuration
PORT=3000
NODE_ENV=development # development | production

# Database Configuration (MySQL)
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=spa_database
DB_PORT=19986 # Or standard 3306
DB_SSL=false  # Set to true if using Aiven/Cloud DB requiring ca.pem

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
```

**Step-by-Step Setup Guide:**
1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd spa6/backend
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Database Initialization:**
   Ensure MySQL is running. Create the database specified in `DB_NAME`. Run the initialization scripts to build schemas and seed admin accounts:
   ```bash
   npm run db:init
   npm run db:seed
   ```
4. **Start the Application:**
   ```bash
   # Development (with hot-reloading)
   npm run dev
   
   # Production
   npm start
   ```
   The application will be accessible at `http://localhost:3000`.

---

## 7. Execution, Usage & API Interfaces

**CLI Commands (NPM Scripts):**
- `npm start`: Runs the production server via `node api/index.js`.
- `npm run dev`: Runs the development server via `nodemon`.
- `npm run db:init`: Creates database tables if they do not exist.
- `npm run db:seed`: Populates the database with initial dummy/admin data.

**API Interface Examples:**
*Authentication (Login)*
- **Endpoint:** `POST /api/auth/login`
- **Payload:** `{ "email": "admin@spa.com", "password": "password123" }`
- **Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1...",
    "user": { "id": 1, "role": "admin", "name": "System Admin" }
  }
  ```

*Create Booking*
- **Endpoint:** `POST /api/bookings`
- **Headers:** `Authorization: Bearer <token>`
- **Payload:** `{ "customer_id": 4, "service_id": 2, "staff_id": 1, "start_time": "2026-07-26T10:00:00Z" }`

---

## 8. Maintainer's Notes & Technical Debt (KT Insights)

**Current Limitations & Bottlenecks:**
- **Raw SQL Queries:** The data layer relies entirely on raw `mysql2` strings. While performant, this creates a maintenance overhead when schemas change.
- **Monolithic Frontend:** The Vanilla JS frontend is fast but can become difficult to manage as state complexity grows. The UI lacks a virtual DOM, meaning manual DOM manipulation is rampant.

**Security Considerations:**
- **Authentication:** JWT is implemented, but token revocation (blacklist) or refresh token rotation is currently absent.
- **Sanitization:** Input validation relies on `express-validator` (where implemented) and parameterized SQL queries to prevent SQL Injection. Ensure *all* new models strictly use `?` parameterized bindings.

**Roadmap & Future Improvements (For the Next Dev):**
1. **Migration to an ORM:** Strongly consider migrating the `models/` directory to an ORM like Prisma or Sequelize to ensure type safety and easier migrations.
2. **Frontend Framework Refactor:** If the application scales further, rewriting the frontend into React.js or Vue.js will drastically improve state management and component reusability.
3. **Caching Layer:** Implement Redis to cache the results of heavy BI queries (e.g., `GET /api/bi/revenue`) to reduce database load on the dashboard.
4. **Automated Testing:** Implement Jest/Supertest for API integration testing, as the current `tests/` directory may require expansion.
