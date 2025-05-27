const serverless = require('serverless-http');
const app = require('../app'); // your main express app

module.exports.handler = serverless(app);
