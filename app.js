const express = require('express');
const cors = require('cors');
const app = express();

const testQuery=require('./testQuery')


const port = process.env.PORT || 3001;

app.use(cors());

app.get('/testDbQuery',testQuery.testQueryHandler);

console.log("Listening...")
app.listen(port);