const db = require('../db');

const skills = [
  'TypeScript',
  // 'Node.js',
  // 'Express',
  // 'React',
  // 'HTML',
  // 'CSS',
  // 'SQL',
  // 'MongoDB',
  // 'Python',
  // 'C#'
];

skills.forEach(skill => {
  db.run('INSERT OR IGNORE INTO skills (name) VALUES (?)', [skill], err => {
    if (err) {
      console.error(`Error inserting skill ${skill}:`, err.message);
    } else {
      console.log(`Inserted skill: ${skill}`);
    }
  });
});
