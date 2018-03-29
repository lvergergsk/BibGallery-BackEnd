// npm install --unsafe-perm=true
// http://mritjudge.com/linux/install-oracle-instant-client-on-ubuntu-linux/

"use strict";

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const auth = require('./auth');
var jwt = require('express-jwt');

const app = express();
const testQuery = require('./testQuery');
const handlers=require('./handlers');
const addUser=require('./db/addUser')

const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/testDbQuery', testQuery.testQueryHandler);
app.get('/protected',
    jwt({secret: 'shhhhhhared-secret'}),
    function (req, res) {
        if (!req.user.admin) return res.sendStatus(401);
        res.sendStatus(200);
    });

app.post('/login', (req, res) => {
    // let {email, password} = req.body
    // console.log(email, password);
    console.log(req.body);
    res.status(200)
        .json({
            success: true,
            token: auth.createJWTToken({
                sessionData: "theUser",
                maxAge: 3600
            })
        })
});

// app.post('/register', handlers.registerHandler);
app.post('/register', addUser.registerHandler);

console.log("Listening...")
app.listen(port);