// npm install --unsafe-perm=true
// http://mritjudge.com/linux/install-oracle-instant-client-on-ubuntu-linux/

"use strict";
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
var jwt = require('express-jwt');

const app = express();
const registerHandler = require('./handlers/registerHandler');
const loginHandler = require('./handlers/loginHandler');
const testHandler=require('./handlers/testHandler');

const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/login', loginHandler);
app.post('/register', registerHandler);
app.get('/protected',jwt({secret: process.env.JWT_SECRET}), testHandler);

console.log("Listening...")
app.listen(port);