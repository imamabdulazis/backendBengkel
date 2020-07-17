const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require("body-parser");
const app = express();

const valToken = require('./utils/fbAuth');
const auth = require('./handler/akun');
const produk = require('./handler/produk');

const config = require('./utils/config');

const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//user 
app.post('/signupUser/:type', auth.signUp);
app.post('/login', auth.login);
app.get('/getUser/:email', valToken.fbAuth, auth.getDetailUsers);

// produk
app.post('/postProduk', valToken.fbAuth, produk.postOneProduk);
app.put('/updateProduk/:id', valToken.fbAuth, produk.updateProduk);






exports.api = functions.https.onRequest(app);