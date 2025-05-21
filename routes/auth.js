const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db'); // adjust if your db file path differs

router.get('/login', (req, res) => {
  res.render('login', { user: req.session.user, error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.render('login', { error: 'Database error', user: null });
    if (!user) return res.render('login', { error: 'Invalid username or password', user: null });

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: 'Invalid username or password', user: null });
    }
    // Store user info in session
    req.session.user = user;
    res.redirect('/admin/dashboard');
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
