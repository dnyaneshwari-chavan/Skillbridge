const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "change-this-secret-before-deployment";
const DB_FILE = path.join(__dirname, "data.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const seed = {
  users: [],
  courses: [
    { id: 1, title: "Java Programming", category: "Programming", level: "Beginner", duration: "6 weeks", description: "Learn Java fundamentals, OOP, collections and exception handling.", skills: ["Java", "OOP"], lessons: 12, enrolled: 128 },
    { id: 2, title: "Frontend Web Development", category: "Web Development", level: "Beginner", duration: "4 weeks", description: "Build responsive websites with HTML, CSS and modern JavaScript.", skills: ["HTML", "CSS", "JavaScript"], lessons: 10, enrolled: 214 },
    { id: 3, title: "Data Analytics Essentials", category: "Data", level: "Intermediate", duration: "5 weeks", description: "Explore data cleaning, visualization and analytical thinking.", skills: ["Excel", "SQL", "Analytics"], lessons: 9, enrolled: 86 },
    { id: 4, title: "Python for Problem Solving", category: "Programming", level: "Beginner", duration: "5 weeks", description: "Practice Python syntax, functions, data structures and algorithms.", skills: ["Python", "Logic"], lessons: 11, enrolled: 176 },
    { id: 5, title: "SQL & Database Design", category: "Data", level: "Intermediate", duration: "3 weeks", description: "Understand relational databases, joins, queries and schema design.", skills: ["SQL", "Database"], lessons: 8, enrolled: 95 },
    { id: 6, title: "UI/UX Design Basics", category: "Design", level: "Beginner", duration: "3 weeks", description: "Learn user journeys, wireframes, visual hierarchy and prototyping.", skills: ["Figma", "UX"], lessons: 7, enrolled: 72 }
  ],
  progress: [],
  quizResults: []
};
function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2)); return structuredClone(seed); }
}
let db = loadDB();
function saveDB() { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: "Please log in to continue." }); }
}
function publicUser(u) { return { id: u.id, name: u.name, email: u.email, role: u.role }; }

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: "Enter name, email and a password with at least 6 characters." });
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(409).json({ error: "An account with this email already exists." });
  const user = { id: Date.now(), name: name.trim(), email: email.trim().toLowerCase(),
    password: await bcrypt.hash(password, 10), role: "learner", createdAt: new Date().toISOString() };
  db.users.push(user); saveDB();
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: publicUser(user) });
});
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = db.users.find(u => u.email === String(email || "").toLowerCase().trim());
  if (!user || !(await bcrypt.compare(password || "", user.password)))
    return res.status(401).json({ error: "Invalid email or password." });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: "7d" });
  res.json({ token, user: publicUser(user) });
});
app.get("/api/me", auth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: publicUser(user) });
});
app.get("/api/courses", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const category = String(req.query.category || "");
  res.json(db.courses.filter(c =>
    (!q || [c.title, c.category, c.description, ...c.skills].join(" ").toLowerCase().includes(q)) &&
    (!category || category === "All categories" || c.category === category)
  ));
});
app.get("/api/dashboard", auth, (req, res) => {
  const userId = req.user.id;
  const progress = db.progress.filter(p => p.userId === userId);
  const completed = progress.filter(p => p.completed).length;
  const quizzes = db.quizResults.filter(q => q.userId === userId);
  res.json({
    stats: { enrolled: progress.length, completed, quizAverage: quizzes.length ? Math.round(quizzes.reduce((a, q) => a + q.score, 0) / quizzes.length) : 0 },
    progress: progress.map(p => ({ ...p, course: db.courses.find(c => c.id === p.courseId) })).filter(p => p.course),
    recentQuizzes: quizzes.slice(-5).reverse()
  });
});
app.post("/api/enroll/:id", auth, (req, res) => {
  const courseId = Number(req.params.id);
  if (!db.courses.some(c => c.id === courseId)) return res.status(404).json({ error: "Course not found." });
  let p = db.progress.find(p => p.userId === req.user.id && p.courseId === courseId);
  if (!p) { p = { userId: req.user.id, courseId, completedLessons: 0, completed: false, updatedAt: new Date().toISOString() }; db.progress.push(p); saveDB(); }
  res.json({ message: "Course added to your learning plan.", progress: p });
});
app.post("/api/progress/:id", auth, (req, res) => {
  const courseId = Number(req.params.id);
  let p = db.progress.find(p => p.userId === req.user.id && p.courseId === courseId);
  if (!p) return res.status(404).json({ error: "Enroll in this course first." });
  const course = db.courses.find(c => c.id === courseId);
  p.completedLessons = Math.min(course.lessons, Math.max(0, Number(req.body.completedLessons) || 0));
  p.completed = p.completedLessons >= course.lessons;
  p.updatedAt = new Date().toISOString(); saveDB();
  res.json({ progress: p });
});
const questions = [
  { q: "Which HTML element is used for the largest heading?", options: ["<h6>", "<heading>", "<h1>", "<head>"], answer: 2 },
  { q: "Which CSS property changes text color?", options: ["font-style", "color", "background", "text-weight"], answer: 1 },
  { q: "Which keyword declares a block-scoped variable in JavaScript?", options: ["varonly", "dim", "let", "define"], answer: 2 },
  { q: "What does API stand for?", options: ["Application Programming Interface", "Applied Program Internet", "Automated Page Input", "App Process Index"], answer: 0 },
  { q: "Which data structure stores key-value pairs in JavaScript?", options: ["String", "Boolean", "Object", "Character"], answer: 2 }
];
app.get("/api/quiz", auth, (req, res) => res.json(questions.map(({ q, options }, id) => ({ id, q, options }))));
app.post("/api/quiz/submit", auth, (req, res) => {
  const answers = req.body.answers || [];
  let correct = 0;
  questions.forEach((q, i) => { if (Number(answers[i]) === q.answer) correct++; });
  const result = { id: Date.now(), userId: req.user.id, score: Math.round(correct / questions.length * 100), correct, total: questions.length, date: new Date().toISOString() };
  db.quizResults.push(result); saveDB();
  res.json(result);
});
app.get("/api/admin/stats", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  res.json({ users: db.users.length, courses: db.courses.length, enrollments: db.progress.length, completions: db.progress.filter(p => p.completed).length });
});
app.post("/api/admin/courses", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  const { title, category, level, duration, description } = req.body || {};
  if (!title || !category || !description) return res.status(400).json({ error: "Title, category and description are required." });
  const course = { id: Date.now(), title, category, level: level || "Beginner", duration: duration || "Self-paced", description, skills: [], lessons: 5, enrolled: 0 };
  db.courses.push(course); saveDB(); res.status(201).json(course);
});
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`SkillBridge running at http://localhost:${PORT}`));
