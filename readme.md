# Banking System API

A RESTful banking backend built with **Node.js, Express, MongoDB, and Mongoose**, implementing JWT authentication, account management, fund transfers, transaction processing, immutable ledger records, idempotency, and email notifications using Gmail OAuth2.

## TL;DR

A backend-focused project demonstrating:

- 🔐 JWT authentication with bcrypt password hashing
- 💳 Account management and account status validation
- 💸 Fund transfers with MongoDB transactional processing
- 🔁 Idempotent transactions using unique idempotency keys
- 📒 Immutable ledger-based accounting
- 📊 Balance calculation from ledger entries instead of a mutable balance field
- 📧 Nodemailer + Gmail OAuth2 email notifications
- 🌱 Reproducible demo data through a database seed script
- 🧩 Modular architecture with controllers, models, routes, middleware, and services

## Tech Stack

- **Node.js** — Runtime
- **Express.js** — REST API framework
- **MongoDB** — Database
- **Mongoose** — ODM
- **JWT** — Authentication
- **bcryptjs** — Password hashing
- **Nodemailer** — Email delivery
- **Gmail OAuth2** — Email authentication
- **dotenv** — Environment configuration
- **Nodemon** — Development

## Core Features

### Authentication & Security

- User registration and login
- JWT-based authentication
- HTTP cookie-based token handling
- Three-day JWT expiration
- Password hashing with bcrypt
- Token blacklist support
- Protected routes
- Unique email validation
- Environment-based secret management

### Account Management

- Account creation
- User-account relationship
- Account status management:
  - `ACTIVE`
  - `FROZEN`
  - `CLOSED`
- INR as the default account currency
- Account balance derived from ledger entries

### Transaction Processing

Fund transfers follow a controlled transaction workflow:

```text
Request
  ↓
Validation
  ↓
Account & balance checks
  ↓
Create transaction → PENDING
  ↓
Create DEBIT ledger entry
  ↓
Create CREDIT ledger entry
  ↓
Mark transaction → COMPLETED
  ↓
Commit MongoDB transaction
  ↓
Send email notification

Transactions support:

PENDING
COMPLETED
FAILED
REVERSED
Idempotency

Every transaction requires a unique idempotencyKey to help prevent duplicate financial operations when clients retry requests.

Ledger-Based Accounting

Account balances are calculated from ledger records:

Balance = Total Credits - Total Debits

A transfer produces:

Sender Account   → DEBIT
Receiver Account → CREDIT

Ledger records are intentionally immutable and cannot be modified or deleted.

Email Notifications

Nodemailer with Gmail OAuth2 is used for application emails, including:

User registration
Successful transactions

OAuth2 credentials are stored in environment variables and are never committed to the repository.

Architecture
Client
  ↓
Routes
  ↓
Controllers
  ↓
┌───────────────┬──────────────┐
│               │              │
Models      Middleware      Services
│                              │
↓                              ↓
MongoDB                    Nodemailer
Project Structure
Banking-system/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── account.controller.js
│   │   ├── auth.controller.js
│   │   └── transaction.controller.js
│   │
│   ├── middleware/
│   │   └── auth.middleware.js
│   │
│   ├── models/
│   │   ├── account.model.js
│   │   ├── blackList.model.js
│   │   ├── ledger.model.js
│   │   ├── transaction.model.js
│   │   └── user.model.js
│   │
│   ├── routes/
│   │   ├── account.routes.js
│   │   ├── auth.routes.js
│   │   └── transaction.routes.js
│   │
│   ├── services/
│   │   └── email.service.js
│   │
│   ├── seed/
│   │   └── seed.js
│   │
│   └── app.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
Environment Setup

Create your environment file:

cp .env.example .env

Configure:

MONGO_DB_URI=

CLIENT_ID=

CLIENT_SECRET=

REFRESH_TOKEN=

EMAIL_USER=

JWT_SECRET=
Variable	Purpose
MONGO_DB_URI	MongoDB connection URI
CLIENT_ID	Google OAuth2 Client ID
CLIENT_SECRET	Google OAuth2 Client Secret
REFRESH_TOKEN	Google OAuth2 refresh token
EMAIL_USER	Gmail account used for sending emails
JWT_SECRET	JWT signing and verification secret

Never commit .env or real credentials to GitHub. The repository includes .env.example containing only the required variable names.

Getting Started
1. Clone
git clone https://github.com/Chandan-kr-tiwari/Banking-system.git
cd Banking-system
2. Install dependencies
npm install
3. Configure environment variables
cp .env.example .env

Add your MongoDB and Gmail OAuth2 credentials to .env.

4. Seed demo data
npm run seed

The seed script creates demo users, accounts, initial funding transactions, a sample transfer, and corresponding ledger entries.

5. Start the server

Development:

npm run dev

Start:

npm start
Demo Credentials
Demo User
Email: demo1@example.com
Password: Demo@12345
Balance: ₹9,000
Test User
Email: demo2@example.com
Password: Demo@12345
Balance: ₹6,000

The credentials and financial data are synthetic and intended only for local development/testing.

Seeded Transaction Flow
System Account
    │
    ├── ₹10,000 → Demo User
    │
    └── ₹5,000  → Test User

Demo User
    │
    └── ₹1,000  → Test User

Result:

Demo User → ₹9,000
Test User → ₹6,000
API Domains
/api/auth
/api/account
/api/transaction
Authentication
Registration
Login
Logout / token revocation
Accounts
Account creation
Account management
Account status validation
Balance retrieval
Transactions
Initial account funding
Account-to-account transfers
Transaction status management
Ledger entry creation
Transaction email notifications
Engineering Decisions
Ledger-Based Balances

Balances are derived from immutable ledger entries instead of being directly stored and updated as a mutable account field.

Idempotent Transactions

Unique idempotency keys reduce the risk of duplicate transfers caused by retries or repeated requests.

Immutable Financial Records

Ledger entries cannot be updated or deleted, preserving the historical record of financial activity.

Transactional Consistency

MongoDB sessions are used to coordinate transaction and ledger operations during fund transfers.

Separation of Responsibilities

The application separates:

Routes
  ↓
Controllers
  ↓
Models / Services / Middleware
  ↓
MongoDB / External Services

This keeps API routing, business logic, persistence, authentication, and email delivery modular.

Security

The project implements:

bcrypt password hashing
JWT authentication
Cookie-based token handling
Token blacklist support
Environment-based secrets
Unique email constraints
Unique transaction idempotency keys
Account status validation
Immutable ledger records
MongoDB transactional sessions
Production Considerations

This project is intended as a backend engineering project, not production banking infrastructure.

A production deployment would additionally require comprehensive automated testing, rate limiting, stronger authorization, centralized error handling, structured logging, monitoring, production-grade secret management, high availability, disaster recovery, security auditing, and regulatory compliance.

Future Improvements
 Unit and integration tests
 Swagger / OpenAPI documentation
 Rate limiting
 Centralized error handling
 Structured logging
 Role-based access control
 Paginated transaction history
 Docker support
 CI/CD pipeline
 Monitoring and observability
 Improved transaction recovery
Author

Chandan Tiwari

Backend-focused developer interested in building reliable APIs, backend systems, DevOps workflows, and production-oriented software architectures.
