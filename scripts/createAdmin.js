// Load bcrypt to securely hash the password
const bcrypt = require('bcrypt');
const db = require('../db');

// Define the admin credentials
const username = 'admin';
const plainPassword = 'mypassword123';

// Hash the password using bcrypt with 10 salt rounds
bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) throw err; // Stop the script if hashing fails

  // Insert the new admin user into the 'users' table
  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hash],
    (err) => {
      if (err) {
        console.error('Failed to insert admin:', err.message);
      } else {
        console.log('Admin user created successfully');
      }
    }
  );
});
