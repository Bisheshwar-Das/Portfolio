const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session setup
app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: false
}));

// Make session info available in views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Set 'active' nav link based on current URL path
app.use((req, res, next) => {
  const pathToActive = {
    '/': 'home',
    '/projects': 'projects',
    '/admin/dashboard': 'dashboard',
    '/about': 'about',
    '/contact': 'contact',
  };

  res.locals.active = pathToActive[req.path] || '';
  next();
});

// Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const adminRoutes = require('./routes/admin');
const aboutRouter = require('./routes/about');
const contactRouter = require('./routes/contact');


app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/projects', projectsRouter);
app.use('/admin', adminRoutes);
app.use('/about', aboutRouter);
app.use('/contact', contactRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});