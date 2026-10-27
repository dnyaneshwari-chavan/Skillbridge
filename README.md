# SkillBridge — Skill Learning & Career Development Platform

SkillBridge is a full-stack learning platform built with HTML, CSS, JavaScript, Node.js and Express. It helps learners discover courses, track progress, and test their knowledge.

## Features
- Responsive landing page and course catalogue
- Search courses by title, category or skill
- User registration and login (bcrypt password hashing + JWT)
- Personal dashboard with enrollment, completion and quiz statistics
- Course enrollment and lesson progress tracking
- Interactive multiple-choice skill quiz with saved results
- Admin API endpoints for platform statistics and adding courses
- JSON-file persistence so data survives server restarts

## Requirements
- Node.js 18+ (recommended)
- npm

## Run locally
1. Extract the ZIP and open the folder in VS Code.
2. Open Terminal in the project folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the app:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000`.

Create a learner account using **Get started**. Course enrollment, progress, and quiz results require login.

## Project structure
```text
SkillBridge_Project/
├── server.js
├── package.json
├── data.json            # created automatically on first run
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

## Admin endpoints
The admin endpoints are included as an extension point. New registrations are assigned the `learner` role. For a local demo only, you can change a test user's role to `admin` in `data.json` after registering, then log in again to obtain an admin token. Do not expose this demo setup publicly; implement a secure admin provisioning process before deployment.

- `GET /api/admin/stats`
- `POST /api/admin/courses`

## Important production notes
- This starter uses a JSON file as a lightweight local data store, not a production database. For deployment, replace it with PostgreSQL/MySQL/SQLite and use database migrations.
- Set a strong `JWT_SECRET` environment variable before deployment.
- Add rate limiting, email verification, password reset, input validation and secure hosting before public launch.
- The sample quiz is a basic demo, not a formal assessment system.

## Resume description (after you run and test it)
**SkillBridge — Skill Learning & Career Development Platform**  
Technologies: HTML, CSS, JavaScript, Node.js, Express.js, JWT, bcrypt  
- Built a responsive course discovery platform with search and category filtering.
- Implemented secure password hashing, token-based authentication and personalized learning dashboards.
- Added course enrollment, progress tracking, and quiz scoring with persistent results.
