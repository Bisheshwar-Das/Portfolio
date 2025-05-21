const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.all('SELECT * FROM projects', [], (err, projects) => {
    if (err) {
      console.error(err);
      return res.render('projects', { projects: [], user: req.session.user || null });
    }
    res.render('projects', { projects, user: req.session.user || null });
  });
});

module.exports = router;
