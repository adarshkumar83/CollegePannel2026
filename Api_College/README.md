# Api_College

Express + MongoDB (Mongoose) API for the **Manage Exam** module.

## Run

1. Start MongoDB (local install or Docker: `docker run -d -p 27017:27017 mongo`).
2. Check `.env` (copy of `.env.example`):
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/admin_college
   ```
3. ```bash
   npm install
   npm run dev      # nodemon, or: npm start
   ```

## Endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| GET | /api/exams?search=text | List / search exams by name |
| GET | /api/exams/:id | One exam |
| POST | /api/exams | Create exam |
| PUT | /api/exams/:id | Update exam |
| DELETE | /api/exams/:id | Delete exam |

Technical body: `{ "name", "type": "Technical", "physics", "chemistry", "mathematics" }`
Aptitude body: `{ "name", "type": "Aptitude", "aptitude" }`

Counts must be whole numbers (0 or more) and an exam needs at least one question.
Every exam in a response includes `totalQuestions`.
