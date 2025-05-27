const express = require('express');
const router = express.Router();
const db = require('../tmp/db');
const bcrypt = require('bcrypt');

// Middleware to check login
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/auth/login');
}

// GET: Dashboard page
// GET: Admin dashboard with projects and contact messages
router.get('/dashboard', isAuthenticated, (req, res) => {
  db.all('SELECT * FROM projects', [], (err, projects) => {
    if (err) throw err;

    db.all('SELECT * FROM contact_submissions ORDER BY submitted_at DESC', [], (err2, contacts) => {
      if (err2) throw err2;

      res.render('adminDashboard', {
        title: 'Admin Dashboard',
        projects,
        contacts
      });
    });
  });
});

// POST: Change password
router.post('/change-password', isAuthenticated, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const username = req.session.user.username;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.status(500).send('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send('Old password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    db.run('UPDATE users SET password = ? WHERE username = ?', [hashedNewPassword, username], (err) => {
      if (err) return res.status(500).send('Error updating password');
      res.redirect('/admin/dashboard');
    });
  });
});

// GET: Show add project form
router.get('/add', isAuthenticated, (req, res) => {
  db.all('SELECT * FROM skills', [], (err, skills) => {
    if (err) throw err;
    res.render('addProject', { title: 'Add Project', skills });
  });
});

// POST: Handle new project submission
router.post('/add', isAuthenticated, (req, res) => {
  const { title, description, github_url, live_url, skill_ids } = req.body;

  db.run(
    'INSERT INTO projects (title, description, github_url, live_url) VALUES (?, ?, ?, ?)',
    [title, description, github_url, live_url],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.send('Failed to add project');
      }

      const projectId = this.lastID;

      const selectedSkills = Array.isArray(skill_ids) ? skill_ids : [skill_ids];

      const stmt = db.prepare('INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)');
      selectedSkills.forEach(skillId => {
        stmt.run(projectId, skillId);
      });
      stmt.finalize();

      res.redirect('/admin/dashboard');
    }
  );
});


// GET Edit form for a project
router.get('/edit/:id', isAuthenticated, (req, res) => {
  const projectId = req.params.id;

  // Get project info
  db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, project) => {
    if (err) throw err;
    if (!project) return res.status(404).send('Project not found');

    // Get all skills
    db.all('SELECT * FROM skills', [], (err2, skills) => {
      if (err2) throw err2;

      // Get skills linked to this project
      db.all('SELECT skill_id FROM project_skills WHERE project_id = ?', [projectId], (err3, projectSkills) => {
        if (err3) throw err3;

        const selectedSkillIds = projectSkills.map(ps => ps.skill_id);

        res.render('editProject', {
          title: 'Edit Project',
          project,
          skills,
          selectedSkillIds
        });
      });
    });
  });
});

// POST Update project details
router.post('/edit/:id', isAuthenticated, (req, res) => {
  const projectId = req.params.id;
  const { title, description, github_url, live_url, skill_ids } = req.body;

  // Update project info
  db.run(
    'UPDATE projects SET title = ?, description = ?, github_url = ?, live_url = ? WHERE id = ?',
    [title, description, github_url, live_url, projectId],
    (err) => {
      if (err) {
        console.error(err.message);
        return res.send('Failed to update project');
      }

      // Delete old skills links for this project
      db.run('DELETE FROM project_skills WHERE project_id = ?', [projectId], (err2) => {
        if (err2) throw err2;

        const selectedSkills = Array.isArray(skill_ids) ? skill_ids : skill_ids ? [skill_ids] : [];

        if (selectedSkills.length === 0) {
          return res.redirect('/admin/dashboard');
        }

        // Insert new skills links
        const stmt = db.prepare('INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)');
        selectedSkills.forEach(skillId => {
          stmt.run(projectId, skillId);
        });
        stmt.finalize();

        res.redirect('/admin/dashboard');
      });
    }
  );
});

// POST Delete project
router.post('/delete/:id', isAuthenticated, (req, res) => {
  const projectId = req.params.id;

  // Delete project skills links first (due to FK constraints)
  db.run('DELETE FROM project_skills WHERE project_id = ?', [projectId], (err) => {
    if (err) throw err;

    // Then delete project
    db.run('DELETE FROM projects WHERE id = ?', [projectId], (err2) => {
      if (err2) throw err2;

      res.redirect('/admin/dashboard');
    });
  });
});


module.exports = router;
