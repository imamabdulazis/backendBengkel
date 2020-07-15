const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
// module 
const auth = require('./handler/customer/user');


app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(function (err, req, res, next) {
//     if (err instanceof SyntaxError && err.status === 400 && 'body' in err && err.type === 'entity.parse.failed') {
//         res.status(400)
//         res.set('Content-Type', 'application/json')
//         res.json({
//             message: 'JSON malformed'
//         })
//     } else {
//         next();
//     }
//     return res.sendStatus(500);
// });

//user route
app.post('/signupUser', auth.signUp);

exports.api = functions.region('asia-east2').https.onRequest(app);