// npm install --unsafe-perm=true
// http://mritjudge.com/linux/install-oracle-instant-client-on-ubuntu-linux/

"use strict";
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const testQuery = require('./testQuery');
const registerHandler = require('./handlers/registerHandler');
const loginHandler = require('./handlers/loginHandler');

const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/testDbQuery', testQuery.testQueryHandler);
app.post('/login', loginHandler);
app.post('/register', registerHandler);

console.log("Listening...")
app.listen(port);