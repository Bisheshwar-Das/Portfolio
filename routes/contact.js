const express = require('express');
const router = express.Router();
const db = require('../tmp/db');

// GET: Contact page
router.get('/', (req, res) => {
  res.render('contact', {
    title: 'Contact - Bisheshwar Das',
    user: req.session.user || null
  });
});

// POST: Handle contact form submission
router.post('/', (req, res) => {
  const { name, email, message } = req.body;

  db.run(
    'INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Error saving message');
      }
      res.redirect('/contact?success=true');
    }
  );
});

module.exports = router;
