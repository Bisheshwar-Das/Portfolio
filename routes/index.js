const express = require('express');
const router = express.Router();
const db = require('../tmp/db');

router.get('/', (req, res) => {
  // Fetch skills
  db.all('SELECT * FROM skills', [], (err, skills) => {
    if (err) {
      console.error('Error fetching skills:', err);
      return res.render('index', {
        title: 'Home - Bisheshwar Das',
        skills: [],
        projects: [],
        user: req.session.user || null
      });
    }

    // Then fetch projects
    db.all('SELECT * FROM projects ORDER BY id DESC LIMIT 3', [], (err2, projects) => {
      if (err2) {
        console.error('Error fetching projects:', err2);
        return res.render('index', {
          title: 'Home - Bisheshwar Das',
          skills,
          projects: [],
          user: req.session.user || null
        });
      }

      // Both queries succeeded
      res.render('index', {
        title: 'Home - Bisheshwar Das',
        skills,
        projects,
        user: req.session.user || null
      });
    });
  });
});

module.exports = router;
