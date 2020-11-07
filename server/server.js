const express = require('express');
const dao = require('./dao');
const morgan = require('morgan');
const jwt=require('express-jwt');
const moment=require('moment');


const PORT = 3001;
const app = express();

app.use(morgan('tiny'));
app.use(express.json());





app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));