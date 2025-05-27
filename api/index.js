const serverless = require('serverless-http');
const app = require('../app');
app.get('/debug', (req, res) => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
    if (err) return res.status(500).send('DB Error: ' + err.message);
    res.send(`Connected! Tables: ${rows.map(r => r.name).join(', ')}`);
  });
});

module.exports = serverless(app); 
