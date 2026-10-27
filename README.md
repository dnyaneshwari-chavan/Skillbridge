# SkillTrack — Smart Skill & Certificate Management System

A responsive front-end project for organizing skills and certificate records.

## Features
- Dashboard showing skill and certificate counts
- Add, remove, and update proficiency levels for skills
- Add certificates with issuer and issue date
- Attach PDF/image files (up to 2 MB per file)
- Search certificates
- Mark a certificate as verified for personal tracking
- Saves data in browser localStorage
- Responsive layout for mobile and desktop

## Run locally
1. Download and extract the project folder.
2. Open `index.html` in a modern browser.
3. No package installation is required.

For a more complete production version, add a backend API, database, authentication, secure file storage, and real issuer-based certificate verification.

## Important notes
- This starter version is front-end only; it does not contact a real verification service.
- “Mark as verified” is a personal status label, not proof that an issuer validated the certificate.
- Data and attached files are stored in the current browser only. Clearing browser storage can remove them.
