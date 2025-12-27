## Safe Log AI (backend)

Express + MongoDB backend for collecting application error logs, masking sensitive data, deduplicating them via fingerprints, and returning cached AI solutions when available.

### 🆕 Classified Database System

The system now supports **three user types** with different data sharing and privacy requirements:

- **Public Users**: Share cached error logs and AI solutions globally with all public users
- **Private Users**: Complete isolation - no sharing of logs or solutions with anyone
- **Team Users**: Share logs and solutions only within their designated team

### Current status (what's built)
- API server boots from `backend/server.js`, loads environment variables, and connects to MongoDB via `backend/config/db.js`.
- Error logs are stored in `backend/models/ErrorLog.js` with fields for `userId`, `userType`, `teamId`, `fingerprint`, `maskedLog`, optional `aiSolution`, and a `hitCount` to track repeat occurrences.
- User authentication with JWT tokens includes user classification (`userType`, `teamId`, `teamRole`).
- Team management system with invite codes, member management, and role-based permissions.
- `/api/logs/submit` (see `backend/routes/logs.js`) accepts `rawLog` and implements classified caching:
  - **Public users**: Cache is shared globally across all public users
  - **Private users**: Cache is isolated to individual user
  - **Team users**: Cache is shared only within the team
  - It sends `rawLog` to the Presidio masking service and receives `maskedLog`.
  - It generates a fingerprint from `maskedLog` and checks for existing logs based on user type.
  - Cache hit returns the stored `aiSolution` with `fromCache: true` (no AI call).
  - Cache miss calls NVIDIA NIM Chat Completions using model `meta/llama-4-maverick-17b-128e-instruct`, stores the solution, and returns it.
- Fingerprint utility in `backend/utils/fingerprint.js` normalizes error text and hashes it (SHA-256) for deduplication.
- Presidio masking client in `backend/services/presidioService.js` posts logs to the masking service with a regex fallback.
- Masking microservice (`masking-service/app.py`) built with Flask + Presidio Analyzer/Anonymizer:
  - Standard PII plus custom recognizers for `SESSION_TOKEN`, `USER_ID`, `API_KEY`
  - Post-processing masks sensitive key/value pairs and high-entropy tokens; a fail-safe masks any remaining long high-entropy tokens to `<UNKNOWN>`.
  - Exception-line protection: any line matching `\b[A-Za-z]+Exception\b` is skipped by Presidio + post-processing + fail-safe, and preserved verbatim in the final output.

### Project structure
- `backend/server.js` – Express bootstrap and route registration.
- `backend/config/db.js` – MongoDB connection helper.
- `backend/routes/auth.js` – User authentication (signup/login) with user type support.
- `backend/routes/logs.js` – Log submission endpoint with classified caching logic.
- `backend/routes/teams.js` – Team management endpoints (create, join, leave, manage members).
- `backend/models/User.js` – Mongoose schema/model with user classification fields.
- `backend/models/Team.js` – Mongoose schema/model for team management.
- `backend/models/ErrorLog.js` – Mongoose schema/model with multi-tenant support.
- `backend/middleware/auth.js` – JWT authentication middleware with user type extraction.
- `backend/utils/fingerprint.js` – Fingerprinting helper for log normalization.
- `backend/services/presidioService.js` – Outbound client to masking service with timeout and regex fallback.
- `backend/scripts/migrate-users.js` – Migration script for existing users.
- `backend/scripts/migrate-logs.js` – Migration script for existing logs.
- `backend/test/test-user-types.js` – Test suite for user type isolation and cache sharing.
- `backend/test/test-teams.js` – Test suite for team management features.
- `masking-service/app.py` – Flask + Presidio masking API.

### Prerequisites
- Node.js 18+ recommended.
- MongoDB instance (local or hosted).
- Python 3.10+ for masking service.

### Clone & run (fresh machine)
1) Clone the repo
```
git clone <your-repo-url>
cd safe-log-ai
```

2) Start MongoDB
- Make sure MongoDB is running and reachable (local or hosted).

3) Start the masking service (Python)
```
cd masking-service
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\python app.py
```

It should listen on `http://localhost:5001`.

4) Start the backend API (Node.js)
```
cd backend
npm install
node server.js
```

Create `.env` in `backend/` with:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/safe-log-ai
NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key
JWT_SECRET=your-secret-key-change-in-production
```

Backend should listen on `http://localhost:3000`.

5) Quick test
```
node test/test-user-types.js
node test/test-teams.js
```

### API reference

#### Authentication
- `POST /api/auth/signup`
  - Body: `{ "email": "string", "password": "string", "userType": "public|private|team", "inviteCode": "string (optional, required for team)" }`
  - Response: `{ "token": "jwt", "user": { "id", "email", "userType", "teamId", "teamRole" } }`

- `POST /api/auth/login`
  - Body: `{ "email": "string", "password": "string" }`
  - Response: `{ "token": "jwt", "user": { "id", "email", "userType", "teamId", "teamRole" } }`

#### Log Management
- `POST /api/logs/submit`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "rawLog": "string" }`
  - Responses:
    - Cache hit: `{ "fromCache": true, "solution": "<cached aiSolution>", "maskedLog": "...", "hitCount": N, "_id": "..." }`
    - New log: `{ "fromCache": false, "message": "<aiSolution>", "solution": "<aiSolution>", "maskedLog": "...", "hitCount": 1, "_id": "..." }`

- `GET /api/logs/history`
  - Headers: `Authorization: Bearer <token>`
  - Returns logs based on user type (public: all public logs, private: user's logs, team: team's logs)

- `GET /api/logs/get/:id`
  - Headers: `Authorization: Bearer <token>`
  - Returns specific log with access control based on user type

#### Team Management
- `POST /api/teams/create`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "string", "description": "string (optional)" }`
  - Response: `{ "team": { "id", "name", "description", "inviteCode", "createdAt" } }`

- `POST /api/teams/join`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "inviteCode": "string" }`
  - Response: `{ "message": "...", "team": { "id", "name", "description" } }`

- `GET /api/teams/my-team`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "team": {...}, "members": [...], "yourRole": "admin|member" }`

- `DELETE /api/teams/leave`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "message": "Successfully left the team" }`

- `DELETE /api/teams/:id/remove/:userId` (Admin only)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "message": "Member removed successfully" }`

- `PUT /api/teams/:id` (Admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "string", "description": "string", "settings": {} }`
  - Response: `{ "message": "...", "team": {...} }`

### Data models

#### User
```
email: string (required, unique)
password: string (required, hashed)
userType: enum ['public', 'private', 'team'] (default: 'private')
teamId: ObjectId ref Team (null for public/private)
teamRole: enum ['member', 'admin'] (default: 'member')
timestamps: createdAt / updatedAt (auto)
```

#### Team
```
name: string (required, unique)
description: string
createdBy: ObjectId ref User (required)
inviteCode: string (unique, auto-generated UUID)
settings: object (default: {})
timestamps: createdAt / updatedAt (auto)
```

#### ErrorLog
```
userId: string (required)
userType: enum ['public', 'private', 'team'] (required)
teamId: ObjectId ref Team (null for public/private)
fingerprint: string (required)
maskedLog: string (required)
aiSolution: string | null (defaults to null)
hitCount: number (defaults to 1)
timestamps: createdAt / updatedAt (auto)
```

### How classified caching works
- **Public users**: Logs are searched across all public users by `{ userType: 'public', fingerprint }`
- **Private users**: Logs are searched only for that user by `{ userId, fingerprint }`
- **Team users**: Logs are searched within the team by `{ userType: 'team', teamId, fingerprint }`
- Route sends `rawLog` to the masking service and receives `maskedLog`.
- Route fingerprints `maskedLog` and checks MongoDB for existing logs based on user type.
- Masking service uses Presidio (standard + custom recognizers) and additional regex/entropy-based passes to scrub secrets.
- Lines containing an exception token (matching `\b[A-Za-z]+Exception\b`) are not analyzed or modified by any masking stage.
- Cache hit returns the stored solution; cache miss calls NVIDIA NIM and stores the new solution.

### Migration for existing deployments

If you have existing users and logs, run the migration scripts:

1. **Backup your database first!**
```
mongodump --uri="mongodb://localhost:27017/safe-log-ai" --out=backup
```

2. **Migrate users** (defaults to 'private' type for safety)
```
cd backend
node scripts/migrate-users.js        # Dry run
node scripts/migrate-users.js --live # Apply changes
```

3. **Migrate logs** (backfills userType and teamId from user data)
```
node scripts/migrate-logs.js        # Dry run
node scripts/migrate-logs.js --live # Apply changes
```

### Testing

Run the test suites to verify the classified database system:

```bash
# Test user type isolation and cache sharing
node test/test-user-types.js

# Test team management features
node test/test-teams.js
```

### Suggested next steps
- Add retry/backoff and better error surfacing for AI call failures.
- Add validation (e.g., using `express-validator`/`zod`) and error handling middleware.
- Add environment-aware logging and health checks.
- Implement pagination for team member lists and log history.
- Add team analytics and usage statistics.

### Troubleshooting
- If masking returns fallback behavior, ensure the masking service is running on `http://localhost:5001`.
- If new logs return 500, confirm `NVIDIA_NIM_API_KEY` is set and valid.
- If MongoDB connection fails, verify `MONGO_URI` and that MongoDB is running.
- If team operations fail, ensure JWT_SECRET is set and tokens are valid.
- For migration issues, always run dry-run mode first and keep database backups.
