# Salon & Spa Management System - System Documentation & Knowledge Transfer

## 1. Executive Summary & Problem Statement

### High-Level Overview
The **Salon & Spa Management System** (KatSpa / Spa6) is a multi-tenant, enterprise-grade Point-of-Sale (POS), Resource Scheduling, Customer Relationship Management (CRM), Financial Accounting, and Business Intelligence (BI) platform. Built with a Node.js/Express backend and an optimized Vanilla JavaScript Single-Page Application (SPA) frontend, the system orchestrates day-to-day salon operations, automated client checkouts, staff scheduling, room management, prepaid membership wallet debits, and real-time executive analytics.

### Core Business & Technical Problems Solved
1. **Resource Overbooking & Schedule Collisions**: Dynamically resolves conflicts across double-booked service staff, treatment rooms, and time windows using a real-time availability validation algorithm.
2. **Membership & Prepaid Wallet Accounting**: Automates complex discount percentages and debiting from customer prepaid wallets during POS checkout with full transactional rollback protection.
3. **Multi-Tenant Data Isolation**: Guarantees logical separation of multi-branch salon data by enforcing `salon_id` tenant scoping across all model queries and JWT authorizations.
4. **Business Intelligence & Financial Forecasting**: Provides real-time visibility into salon metrics (Revenue, Cancellation Rates, Customer Lifetime Value [LTV], Staff Productivity, Service Profitability) and generates a 30-day AI Revenue Forecast using Ordinary Least Squares (OLS) linear regression.
5. **Multi-Format Data Export**: Allows one-click, client-side exports of operational and BI data into CSV, multi-sheet formatted Excel workbooks, and print-ready PDF dashboards.

### Key Capabilities & Features
- **Operational Dashboard**: Real-time tracking of daily revenue, completed/pending appointments, customer counts, and recent financial transactions.
- **Appointment & Resource Scheduling**: Full matrix timeline view supporting staff allocation, room assignment, service duration calculation, walk-ins, and booking state transitions (`pending`, `confirmed`, `completed`, `cancelled`).
- **Customer Relationship Management (CRM)**: Customer profiles, booking history, lifetime spend tracking, 60-day retention analysis, and instant contact search.
- **Service Catalog Management**: Multi-tier catalog organization (Category $\rightarrow$ Subcategory $\rightarrow$ Service) with base prices, customizable durations, and room requirement flags.
- **Membership & Loyalty Program**: Tiered membership subscriptions, automatic category-level percentage discounts, wallet balance tracking, and expiry alerts (expiring within 7 days).
- **Point of Sale (POS) & Invoicing**: Itemized invoicing, tax (GST) calculation, manual & membership discount application, split payment handling (Cash, Card, UPI, Wallet), invoice state management, and printable receipts.
- **Expense Tracking**: Business expense categorization, outflow tracking, net profit margin calculation, and category summaries.
- **8-Module Business Intelligence (BI) Data Warehouse**: Dedicated analytical dashboards for Revenue, Bookings, Customers, Staff, Memberships, Profitability, Services, and Revenue Forecasting.
- **Role-Based Access Control (RBAC)**: Fine-grained user authorization matrix enforcing access limits for `owner`, `center_manager`, and `staff` roles.

### Target Users & Consumers
- **Salon Owners / Executives**: Require strategic analytics, overall profitability reports, staff productivity rankings, user credential administration, and salon settings.
- **Center Managers**: Oversee daily appointments, catalog configuration, staff shift allocations, billing overrides, and expense tracking.
- **Front-Desk Staff / Receptionists**: Handle walk-ins, schedule appointments, process POS checkout invoices, and perform customer lookups.
- **API Consumers**: Web SPA client interface and external integrations communicating over RESTful HTTP APIs.

---

## 2. Directory Structure & File Inventory

```
e:\Office\Spa\katspa\spa6
├── .github/                      # CI/CD and GitHub repository workflows
├── backend/                      # Core Express Node.js application server
│   ├── api/
│   │   └── index.js              # Express app entry point, middleware & route definitions
│   ├── config/
│   │   ├── auth.js               # JWT sign & verify utility functions
│   │   ├── database.js           # mysql2 promise pool setup & SSL configuration
│   │   └── execute.js            # SQL execution helper
│   ├── controllers/              # Request handlers & HTTP response logic
│   │   ├── advanced-bi.controller.js       # 8-module BI warehouse analytics controller
│   │   ├── advanced-reports.controller.js  # Granular PDF/Excel export endpoints
│   │   ├── auth.controller.js              # Authentication (login/logout/profile)
│   │   ├── billing.controller.js           # POS Invoicing & payment settlement
│   │   ├── bookings.controller.js          # Appointment scheduling & availability
│   │   ├── calendar.controller.js          # Timeline & room/staff schedule view
│   │   ├── customers.controller.js         # Customer CRM management
│   │   ├── dashboard.controller.js         # Operational KPI aggregation
│   │   ├── expenses.controller.js          # Outflow expense tracking
│   │   ├── memberships.controller.js       # Membership subscriptions & wallet handling
│   │   ├── reports.controller.js           # Operational reports controller
│   │   ├── services.controller.js          # Catalog & pricing management
│   │   ├── settings.controller.js          # Salon settings & user admin
│   │   └── staff.controller.js             # Staff profiles & commission rates
│   ├── frontend/                 # Client Single Page Application (SPA)
│   │   ├── app.html              # Main application shell
│   │   ├── bi-dashboard.html     # Standalone BI dashboard template
│   │   ├── login.html            # Authentication login page
│   │   ├── favicon.ico           # Application favicon
│   │   └── assets/
│   │       ├── css/
│   │       │   ├── main.css      # Primary UI stylesheet & layout rules
│   │       │   └── theme.css     # CSS variable color palette & dark theme design system
│   │       └── js/
│   │           ├── api.js        # Centralized HTTP REST client with JWT header injection
│   │           ├── app.js        # Main UI router & view loader
│   │           ├── auth.js       # Auth token storage & session manager
│   │           ├── bi-dashboard.js           # BI Dashboard charting logic
│   │           ├── bi-dashboard-integrated.js# Complete BI engine, charts & exports
│   │           ├── login.js      # Login form logic
│   │           ├── permissions.js# Client-side RBAC DOM element toggles
│   │           ├── theme-toggle.js# UI theme switcher
│   │           ├── utils.js      # Formatting & DOM helper utilities
│   │           ├── lib/          # External vendor libraries
│   │           │   ├── papaparse.min.js      # CSV export engine
│   │           │   └── xlsx.min.js           # SheetJS Excel export engine
│   │           └── modules/      # Page-specific frontend JS modules
│   │               ├── billing/      # Checkout POS modal & invoice table logic
│   │               ├── bookings/     # Booking modal & calendar interop
│   │               ├── calendar/     # Visual grid matrix calendar renderer
│   │               ├── customers/    # Customer directory & history modal
│   │               ├── dashboard/    # Operational cards & quick stats
│   │               ├── expenses/     # Expense log table & entry modal
│   │               ├── memberships/  # Active subscriptions view
│   │               ├── memberships-add/# Membership purchase flow
│   │               ├── reports/      # Operational reporting view
│   │               ├── services/     # Catalog tree & price editing
│   │               ├── settings/     # Salon profile & user management UI
│   │               └── staff/        # Staff listing & commission setup
│   ├── middleware/               # Express request processing middleware
│   │   ├── auth.middleware.js    # JWT token extraction & verification
│   │   ├── error.middleware.js   # Global error handling middleware
│   │   └── role.middleware.js   # Role-based endpoint protection middleware
│   ├── models/                   # Database data access layer (DAO / SQL models)
│   │   ├── advanced-bi.model.js  # BI warehouse queries & linear regression algorithms
│   │   ├── appointment.model.js # Booking creation, slot collision & status SQL
│   │   ├── backup.model.js       # Schema dump & backup execution helpers
│   │   ├── calendar.model.js     # Timeline matrix database queries
│   │   ├── customer.model.js     # Customer CRUD & spend aggregation queries
│   │   ├── expense.model.js      # Expense recording & summary queries
│   │   ├── invoice.model.js      # Invoicing & payment transaction queries
│   │   ├── membership.model.js   # Membership & wallet debit SQL queries
│   │   ├── reports.model.js      # Standard operational report queries
│   │   ├── service.model.js     # Service catalog & category queries
│   │   ├── staff.model.js        # Staff records & shift allocation SQL
│   │   └── user.model.js         # User credential queries
│   ├── routes/                   # API endpoint route declarations
│   │   ├── advanced-bi.routes.js # BI analytics endpoints (`/api/bi/*`)
│   │   ├── auth.routes.js        # Auth endpoints (`/api/auth/*`)
│   │   ├── billing.routes.js     # Billing endpoints (`/api/billing/*`)
│   │   ├── bookings.routes.js    # Booking endpoints (`/api/bookings/*`)
│   │   ├── calendar.routes.js    # Calendar endpoints (`/api/calendar/*`)
│   │   ├── customers.routes.js   # Customer endpoints (`/api/customers/*`)
│   │   ├── dashboard.routes.js   # Dashboard endpoints (`/api/dashboard/*`)
│   │   ├── expenses.routes.js    # Expense endpoints (`/api/expenses/*`)
│   │   ├── memberships.routes.js# Membership endpoints (`/api/memberships/*`)
│   │   ├── reports.routes.js     # Report endpoints (`/api/reports/*`)
│   │   ├── services.routes.js    # Catalog endpoints (`/api/services/*`)
│   │   ├── settings.routes.js    # Settings endpoints (`/api/settings/*`)
│   │   └── staff.routes.js       # Staff endpoints (`/api/staff/*`)
│   ├── scripts/                  # DB seeders, migrations, & test tools
│   │   ├── check-users.js        # Utility to list existing database users
│   │   ├── checkBookings.js      # Booking verification script
│   │   ├── generate_hashes.js    # bcrypt hash generator tool
│   │   ├── init-db.js            # Table initialization runner
│   │   ├── migrate-fk-updates.js # Foreign key constraint migration script
│   │   ├── migrate-soft-delete.js# Soft-delete (`deleted_at`) column migration
│   │   ├── pass.js               # Password hash utility script
│   │   ├── seedBookingsToday.js  # Today's sample booking seeder
│   │   ├── seedUsers.js          # Default administrative user seeder
│   │   └── test-password.js      # Password comparison test script
│   ├── tests/                    # System verification scripts
│   │   └── full-audit.js         # Automated E2E API response verification test suite
│   ├── uploads/                  # Uploaded assets (receipts, avatars, logos)
│   ├── utils/                    # Shared backend helper functions
│   │   ├── calendar.helpers.js   # Time slot calculation & grid matrix helpers
│   │   ├── helpers.js            # Date formatters & random string generators
│   │   ├── logger.js             # Application logger
│   │   └── settingsStore.js      # In-memory configuration cache layer
│   ├── .env                      # Active environment configuration file
│   ├── ca.pem                    # Aiven Cloud MySQL SSL Certificate Authority PEM file
│   ├── package.json              # Backend dependencies & run scripts
│   ├── vercel.json               # Serverless deployment configuration for Vercel
│   └── websocket.js              # Socket.io real-time server wrapper
├── database/                     # Database schemas and seed data
│   ├── all.sql                   # Consolidated full database dump
│   ├── main/                     # Sequenced execution SQL scripts
│   │   ├── 01_dashboard.sql      # Dashboard stats views
│   │   ├── 02_staff.sql          # Staff table definitions
│   │   ├── 03_customers.sql      # Customer table schema
│   │   ├── 04_services.sql       # Catalog & pricing schema
│   │   ├── 05_bookings.sql       # Appointment & item tables
│   │   ├── 06_billing.sql        # Invoice & item tables
│   │   ├── 07_memberships.sql    # Membership & wallet tables
│   │   ├── 08_calendar.sql       # Calendar grid structures
│   │   ├── 09_expenses.sql       # Expense schema
│   │   ├── 10_bi_warehouse.sql   # Data warehouse aggregated views
│   │   └── 11_settings.sql       # System settings schema
│   ├── schema/                   # Individual module DDL schema scripts
│   └── seed/                     # Module seed data files
├── add_booking_columns.sql       # Database patch script for booking time fields
├── BI_IMPLEMENTATION_COMPLETE.md # Detailed architecture document for BI Reporting System
├── jsconfig.json                 # JavaScript tooling configuration
├── README.md                     # Comprehensive System Documentation & KT (This File)
└── REPORTS_SETUP.sh              # Unix setup script for database schema initialization
```

---

## 3. Tech Stack & Architectural Justification

### Core Tech Stack
| Component | Technology | Version | Justification |
| :--- | :--- | :--- | :--- |
| **Runtime Environment** | Node.js | v18+ | Non-blocking, event-driven architecture optimal for concurrent REST API handling and serverless deployment. |
| **Web Framework** | Express.js | ^4.22.2 | Minimalist, unopinionated framework providing robust routing and middleware capabilities. |
| **Database** | MySQL | 8.0+ | Relational database ensuring strict ACID compliance for multi-table transactions (bookings, invoices, wallet debits). |
| **Database Driver** | `mysql2/promise` | ^3.23.1 | High-performance MySQL client supporting prepared statements, SSL connections, and native Promises. |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | ^9.0.2 | Stateless authentication allowing secure API access and carrying tenant claims (`salon_id`, `role`). |
| **Password Hashing** | `bcryptjs` | ^3.0.2 | Pure JavaScript bcrypt implementation for cross-platform password hashing without native compilation dependencies. |
| **Frontend Architecture** | Vanilla HTML5 / CSS3 / ES6+ JS | Native | Eliminates heavy framework build steps and client bundles, maximizing page load speed and longevity. |

### Key 3rd-Party Dependencies
- **`compression` (^1.8.1)**: Express middleware enforcing Gzip compression on outgoing HTTP payloads. Reduces JSON data size by 60%–80%, significantly accelerating BI dashboard payload delivery.
- **`express-validator` (^7.3.2)**: Provides server-side request sanitization and validation, blocking malformed inputs before reaching controller logic.
- **`multer` (^2.2.0)**: Handles multipart form data for file uploads (salon logos, staff avatars).
- **`socket.io` (^4.8.3)**: Real-time WebSocket server allowing broadcast of appointment updates across reception desks.
- **`papaparse` (^5.5.4)**: In-browser CSV compilation library enabling high-speed client-side report exports without server load.
- **`xlsx` (^0.18.5)**: SheetJS library for building complex, multi-sheet Excel workbooks (`Summary`, `Raw Data`, `Pivot`) client-side.
- **`html2pdf.js` (v0.10.1)**: Bundles `html2canvas` and `jspdf` to convert HTML DOM dashboard snapshots into downloadable PDF documents.

### Infrastructure & Deployment Tools
- **Cloud Database (Aiven MySQL with SSL)**: Configured with `ca.pem` certificate validation (`DB_SSL=true`) for secure SSL transport encryption.
- **Serverless Hosting (Vercel)**: `vercel.json` maps all web requests to `backend/api/index.js`, allowing the app to run as a serverless function while maintaining fallback capabilities for traditional Node.js servers (`app.listen`).

---

## 4. End-to-End System Architecture & Data Workflow

### System Architecture Overview

```
                                +----------------------------------+
                                |    Client Browser (SPA)          |
                                |  (HTML5 / Vanilla JS / CSS3)     |
                                +----------------+-----------------+
                                                 |
                                     REST API / HTTP Requests
                                     (Bearer JWT Header)
                                                 |
                                                 v
                                +----------------+-----------------+
                                |  Express Web Server (Node.js)    |
                                |  [backend/api/index.js]          |
                                +----------------+-----------------+
                                                 |
                +--------------------------------+--------------------------------+
                |                                |                                |
                v                                v                                v
   +------------+------------+     +-------------+------------+     +-------------+------------+
   |  Auth Middleware        |     |  Role Middleware         |     |  Compression Middleware    |
   |  (Verify JWT Signature) |     |  (Check Role Claims)     |     |  (Gzip HTTP Payload)       |
   +------------+------------+     +-------------+------------+     +-------------+------------+
                |                                |                                |
                +--------------------------------+--------------------------------+
                                                 |
                                                 v
                                +----------------+-----------------+
                                |    Controller Layer              |
                                | (Bookings, BI, Invoicing, etc.)  |
                                +----------------+-----------------+
                                                 |
                                                 v
                                +----------------+-----------------+
                                |  Model / SQL Layer (DAO)         |
                                | (Transactions, SQL Queries)      |
                                +----------------+-----------------+
                                                 |
                                     mysql2 Prepared Statements
                                     (SSL Encrypted via ca.pem)
                                                 |
                                                 v
                                +----------------+-----------------+
                                |   MySQL Database Engine          |
                                | (Aiven / Local DB Pool)          |
                                +----------------------------------+
```

### Request & Data Workflow (End-to-End Example: Appointment Booking & Checkout)

1. **Authentication & Session Initialization**:
   - The user submits credentials at `POST /api/auth/login`.
   - `auth.controller.js` queries `user.model.js`, verifies password hash via `bcrypt.compare`, and returns a signed JWT token containing `id`, `email`, `role`, and `salon_id`.
   - `frontend/assets/js/auth.js` saves the token in `localStorage` and `api.js` automatically attaches `Authorization: Bearer <token>` to all subsequent requests.

2. **Appointment Availability & Collision Check**:
   - Frontend posts appointment details to `POST /api/bookings`.
   - `auth.middleware.js` verifies the JWT token and attaches `req.user` to the request object.
   - `bookings.controller.js` validates date, time, and service items, then calls `Booking.checkAvailability()` in `appointment.model.js`.
   - The model executes a SQL overlap query checking if assigned staff or rooms are already reserved in the specified time window:
     $$\text{Overlap} \iff (\text{start\_time} < \text{existing\_end\_time}) \land (\text{end\_time} > \text{existing\_start\_time})$$

3. **Transactional Booking Creation**:
   - If clear, `appointment.model.js` starts a MySQL transaction (`connection.beginTransaction()`).
   - Inserts record into `bookings` and iterates over service items to insert into `booking_items`.
   - On success, commits transaction (`connection.commit()`); on error, performs rollback (`connection.rollback()`).

4. **POS Billing Settlement & Wallet Deduction**:
   - During client checkout (`POST /api/billing`), the backend checks if the customer holds an active membership.
   - Calculates category-specific percentage discounts, applies manual discounts, and adds GST tax.
   - If the customer uses their membership wallet balance:
     - The system opens a database transaction.
     - Deducts the bill amount from `memberships.wallet_balance`.
     - Logs the transaction entry in `membership_payments`.
     - Updates invoice status to `paid` and booking status to `completed`.
     - Commits the transaction atomically.

5. **Real-time BI Data Aggregation**:
   - When viewing the BI Dashboard (`GET /api/bi/revenue` or `/api/bi/bookings`), `advanced-bi.controller.js` queries `advanced-bi.model.js`.
   - Aggregates KPIs directly in the database using optimized SQL queries (using `COALESCE`, `SUM`, `CASE` statements, and window functions).
   - Returns aggregated JSON to `bi-dashboard-integrated.js`, which renders interactive Chart.js visualizations and prepares export data buffers.

---

## 5. Core Business Logic & Algorithms (Deep Dive)

### 1. Appointment Time Collision & Overlap Prevention Algorithm
**File**: `backend/models/appointment.model.js` (`checkAvailability` method)
- **Problem**: Prevent booking staff or rooms that are already assigned to active appointments.
- **Logic**: A time collision occurs whenever a proposed interval $[T_{\text{start}}, T_{\text{end}}]$ intersects an existing interval $[E_{\text{start}}, E_{\text{end}}]$ for the same `salon_id` where the booking status is not `cancelled`.
- **SQL Implementation**:
```sql
SELECT COUNT(*) as count 
FROM bookings b
JOIN booking_items bi ON b.id = bi.booking_id
WHERE b.salon_id = ? 
  AND b.booking_date = ? 
  AND b.status != 'cancelled'
  AND (bi.staff_id = ? OR bi.room_id = ?)
  AND (
    (b.start_time < ? AND b.end_time > ?)
  );
```

### 2. Membership Discount & Wallet Auto-Deduction Engine
**Files**: `backend/controllers/bookings.controller.js` & `backend/models/membership.model.js`
- **Problem**: Correctly calculate applicable discounts and atomically debit prepaid membership wallet balances.
- **Workflow**:
  1. Retrieve customer's active membership plan via `Membership.getUserMembership(customer_id)`.
  2. For each service item, verify if `service.category_id` qualifies for membership discount percentage ($D_{\%}$).
  3. Calculate net item subtotal: $S_{\text{net}} = \sum (\text{item\_price} \times (1 - D_{\%}))$.
  4. Apply manual discount ($D_{\text{manual}}$) and add tax ($T$): 
     $$\text{Total} = \max(0, S_{\text{net}} - D_{\text{manual}}) + T$$
  5. Check available wallet balance ($W_{\text{bal}}$). If $W_{\text{bal}} > 0$:
     - Determine wallet amount to apply: $W_{\text{applied}} = \min(\text{Total}, W_{\text{bal}})$.
     - Deduct balance: $W_{\text{new}} = W_{\text{bal}} - W_{\text{applied}}$.
     - Update customer membership wallet balance within an ACID transaction block:
       ```sql
       UPDATE memberships 
       SET wallet_balance = wallet_balance - ? 
       WHERE customer_id = ? AND status = 'active';
       ```

### 3. 30-Day AI Revenue Forecasting Algorithm (Ordinary Least Squares Linear Regression)
**File**: `backend/models/advanced-bi.model.js` (`getRevenueForecast` method)
- **Problem**: Predict future 30-day salon revenue based on historical performance without external ML dependencies.
- **Algorithm**: Implements Ordinary Least Squares (OLS) Linear Regression:
  $$\hat{y} = mx + b$$
  Where:
  $$m = \frac{N \sum (x y) - \sum x \sum y}{N \sum (x^2) - (\sum x)^2}$$
  $$b = \frac{\sum y - m \sum x}{N}$$
  - $x$: Time index (day number $1, 2, \dots, N$).
  - $y$: Daily revenue total for day $x$.
- **Execution Flow**:
  1. Fetch historical daily revenue sums over selected lookback window ($N$ days).
  2. Compute mathematical sums $\sum x$, $\sum y$, $\sum xy$, and $\sum x^2$.
  3. Calculate slope $m$ and y-intercept $b$.
  4. Project daily revenue for the next 30 days ($x = N+1 \dots N+30$).
  5. Aggregate projected 30-day total revenue and calculate projected growth percentage relative to the prior period.

### 4. Multi-Tenant Logical Isolation
**Files**: Across all models (`appointment.model.js`, `invoice.model.js`, `customer.model.js`, etc.)
- **Enforcement**: Tenant boundary safety is guaranteed by extracting `salon_id` directly from the verified JWT payload (`req.user.salon_id`) inside authentication middleware.
- **Query Scoping**: Every database select, insert, update, or delete query MUST explicitly include `WHERE salon_id = ?`. User input cannot overwrite or bypass `salon_id`.

### 5. Architectural Design Patterns Present
- **Model-View-Controller (MVC)**: Clean separation of concerns between models (data/SQL layer), controllers (business logic), and views (frontend SPA modules).
- **Data Access Object (DAO) / Repository Pattern**: Database queries encapsulated inside static model classes (`Booking`, `Invoice`, `Customer`, `User`).
- **Middleware Chain Pattern**: Express middleware stack executing sequential validation (`compression` $\rightarrow$ `cors` $\rightarrow$ `auth` $\rightarrow$ `role` $\rightarrow$ `controller` $\rightarrow$ `error`).
- **Transaction Script Pattern**: Wrap multi-step database changes (such as creating bookings with items or processing invoice payments with wallet debits) inside MySQL `connection.beginTransaction()` and `connection.commit()` / `connection.rollback()` blocks.
- **Singleton Database Pool**: Shared MySQL connection pool instantiated once in `backend/config/database.js` and reused across all incoming requests.

---

## 6. Setup, Configuration & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MySQL Database Server**: v8.0 or higher (Local MySQL instance or Cloud MySQL such as Aiven)
- **Git**: Installed for repository cloning

### Environment Variables Documentation
The application relies on environment variables defined in `backend/.env`.

| Variable | Type | Default / Example Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Integer | `3000` | HTTP port on which the Express server listens. |
| `NODE_ENV` | String | `development` / `production` | Environment mode. Controls error verbosity and logging. |
| `DB_HOST` | String | `localhost` / `mysql-salon.aivencloud.com` | Database hostname or IP address. |
| `DB_PORT` | Integer | `3306` / `19986` | Database connection port. |
| `DB_USER` | String | `root` / `avnadmin` | Database connection username. |
| `DB_PASSWORD` | String | `SecretPass123!` | Database connection password. |
| `DB_NAME` | String | `salon_system_ks` | Target MySQL database name. |
| `DB_SSL` | Boolean | `true` / `false` | Enables SSL encryption for cloud database connections. |
| `JWT_SECRET` | String | `your_super_secret_jwt_key_2026` | Secret key used to sign and verify JWT authentication tokens. |
| `JWT_EXPIRE` | String | `7d` | Lifetime duration of generated JWT tokens (e.g., `24h`, `7d`). |
| `FRONTEND_URL` | String | `http://localhost:3000` | Allowed origin for CORS policy configuration. |

---

### Step-by-Step Installation Guide

#### Step 1: Clone Repository
```bash
git clone <repository-url>
cd spa6
```

#### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

#### Step 3: Configure Database & Schema Setup
Create the target MySQL database and run the initial schema migrations.

**Option A (Automated Setup Script on Unix/Linux/macOS)**:
```bash
chmod +x REPORTS_SETUP.sh
./REPORTS_SETUP.sh
```

**Option B (Manual MySQL CLI Execution)**:
```bash
# Connect to MySQL and create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS salon_system_ks;"

# Execute master schema file
mysql -u root -p salon_system_ks < ../database/all.sql

# Alternatively, execute ordered main scripts:
mysql -u root -p salon_system_ks < ../database/main/01_dashboard.sql
mysql -u root -p salon_system_ks < ../database/main/02_staff.sql
mysql -u root -p salon_system_ks < ../database/main/03_customers.sql
mysql -u root -p salon_system_ks < ../database/main/04_services.sql
mysql -u root -p salon_system_ks < ../database/main/05_bookings.sql
mysql -u root -p salon_system_ks < ../database/main/06_billing.sql
mysql -u root -p salon_system_ks < ../database/main/07_memberships.sql
mysql -u root -p salon_system_ks < ../database/main/08_calendar.sql
mysql -u root -p salon_system_ks < ../database/main/09_expenses.sql
mysql -u root -p salon_system_ks < ../database/main/10_bi_warehouse.sql
mysql -u root -p salon_system_ks < ../database/main/11_settings.sql
```

#### Step 4: Seed Default User Accounts
```bash
# Seed initial administrative users
node scripts/seedUsers.js
```

#### Step 5: Configure Environment File
Create or update `backend/.env`:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=salon_system_ks
DB_SSL=false

JWT_SECRET=salon_jwt_secure_secret_key_2026
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:3000
```

#### Step 6: Start Server

**Development Mode (with Hot Reloading via Nodemon)**:
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

Access the application in your browser at: **`http://localhost:3000`**

---

## 7. Execution, Usage & API Interfaces

### Default Test Credentials
Upon completing seed operations, log into the web application using:

| Role | Email Address | Password | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@gmail.com` | `owner@123` | Unrestricted full system access, user administration, salon settings. |
| **Center Manager** | `center@gmail.com` | `center@123` | Full access to daily operations, catalog, billing, expenses, and BI reports. Excludes user administration. |
| **Staff** | `staff@gmail.com` | `staff@123` | Restricted operational access. Bookings management, customer lookups. Excludes financial settings and user administration. |

---

### Core API Specification Reference

#### 1. Authentication Endpoints (`/api/auth`)
- `POST /api/auth/login`: Authenticate user credentials and receive JWT bearer token.
  - **Payload**: `{"email": "owner@gmail.com", "password": "owner@123"}`
  - **Response**: `{"token": "<jwt-token>", "user": {"id": 1, "email": "...", "role": "owner", "salon_id": 1}}`
- `GET /api/auth/profile`: Fetch authenticated user profile details.
  - **Headers**: `Authorization: Bearer <jwt-token>`

#### 2. Bookings Endpoints (`/api/bookings`)
- `GET /api/bookings`: Fetch list of bookings with optional query filters (`status`, `dateFrom`, `dateTo`, `customer_name`).
- `POST /api/bookings`: Create a new appointment booking.
  - **Payload**:
    ```json
    {
      "customer_id": 5,
      "booking_type": "walk_in",
      "booking_date": "2026-07-25",
      "start_time": "14:00:00",
      "notes": "Client requested quiet room",
      "discount_amount": 100,
      "tax_amount": 50,
      "items": [
        {
          "category_id": 1,
          "subcategory_id": 2,
          "service_id": 12,
          "staff_id": 3,
          "room_id": 1,
          "duration_minutes": 60,
          "price": 800
        }
      ]
    }
    ```
- `GET /api/bookings/:id`: Retrieve full details and items for a specific booking.
- `PATCH /api/bookings/:id/status`: Update booking status (`pending`, `confirmed`, `completed`, `cancelled`).

#### 3. Billing & Invoicing Endpoints (`/api/billing`)
- `GET /api/billing`: List invoices with status and date filtering.
- `POST /api/billing`: Generate invoice and settle payment.
  - **Payload**:
    ```json
    {
      "booking_id": 18,
      "customer_id": 5,
      "payment_method": "wallet",
      "subtotal_amount": 800,
      "discount_amount": 100,
      "tax_amount": 50,
      "wallet_applied": 750,
      "total_amount": 750,
      "status": "paid"
    }
    ```

#### 4. Business Intelligence Endpoints (`/api/bi`)
- `GET /api/bi/revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`: Aggregate revenue statistics (Total, Customer Rev, Membership Rev, Tax, Discounts).
- `GET /api/bi/bookings`: Returns peak booking hours, cancellation rates, repeat customer ratio, and daily trends.
- `GET /api/bi/customers`: Customer intelligence metrics (Average LTV, 60-day retention rate, top 10 spenders).
- `GET /api/bi/staff`: Staff productivity metrics (Hours worked, revenue generated, revenue per hour).
- `GET /api/bi/memberships`: Active memberships, expiring soon count ($< 7$ days), tier breakdown, and individual member wallet balances.
- `GET /api/bi/forecast`: Returns 30-day AI revenue forecast calculated via linear regression.

---

### Package Scripts & Utility Commands

| Script Command | Command Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | `nodemon api/index.js` | Runs Express backend server in hot-reloading development mode. |
| `npm start` | `node api/index.js` | Runs Express backend server in production mode. |
| `node scripts/seedUsers.js` | `node scripts/seedUsers.js` | Seeds initial owner, manager, and staff user records into database. |
| `node scripts/seedBookingsToday.js` | `node scripts/seedBookingsToday.js` | Seeds sample bookings for testing today's operational dashboard. |
| `node tests/full-audit.js` | `node tests/full-audit.js` | Runs full automated test audit verifying database tables and API route structure. |

---

## 8. Maintainer's Notes & Technical Debt (KT Insights)

### Performance Considerations & Bottlenecks
1. **Unindexed SQL Date Filters**: High-volume booking tables (`bookings`, `booking_items`) require database composite indexes on `(salon_id, booking_date)` and `(salon_id, status)` to maintain sub-10ms query execution as transaction history grows beyond $100,000+$ rows.
2. **Serverless Connection Pool Behavior**: When deployed to Vercel, serverless function instances spin up independently. Ensure MySQL max connection limits on cloud hosting (e.g., Aiven) accommodate multiple short-lived serverless connection pools. Keep `connectionLimit` conservative (currently set to `5` in `backend/config/database.js`).
3. **Client-Side Export Memory Overhead**: PDF and Excel exports run client-side in browser memory. PDF generation of massive HTML tables ($>500$ rows) via `html2pdf.js` can consume significant CPU/RAM. Server-side streaming exports can be considered for large enterprise datasets.

### Security Architecture & Implementation
- **Password Security**: Passwords hashed using `bcryptjs` with a cost factor (salt rounds) of 10. Raw text passwords are never stored or logged.
- **SQL Injection Prevention**: All data models strictly utilize parameterized prepared statements (`pool.query('SELECT ... WHERE id = ?', [id])`) provided by `mysql2`. Concatenated raw SQL strings are forbidden.
- **Payload Limits**: Express body parsers enforce a strict 50MB payload limit to protect against buffer overflow or payload denial-of-service (DoS) attacks.
- **Stateless Authorization**: JWT token verification validates cryptographic signature and token expiration on every protected API route invocation.

### Recommended Future Roadmap
1. **Migration Framework**: Replace manual SQL script execution with an automated migration tool (such as Knex.js or Umzug) to version-control database schema changes cleanly.
2. **Payment Gateway Integration**: Integrate Razorpay, Stripe, or Paytm webhooks to automatically mark invoices as `paid` upon digital checkout completion.
3. **Redis Caching Layer**: Implement an in-memory Redis cache for high-frequency BI aggregation endpoints (`/api/bi/*`) to bypass repetitive SQL aggregation queries for static historical ranges.
4. **WebSocket Live Calendar Updates**: Expand `backend/websocket.js` integration to push real-time Socket.io socket events (`booking_created`, `booking_cancelled`) directly to open receptionist calendar views.
