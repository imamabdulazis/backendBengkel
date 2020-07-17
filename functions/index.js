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
app.post('/produk', valToken.fbAuth, produk.postOneProduk);
app.put('/produk/:id', valToken.fbAuth, produk.updateProduk);
app.put('/updateImage/:id', valToken.fbAuth, produk.updateImage);
app.delete('/produk/:id', valToken.fbAuth, produk.deletOneProduk);
app.get('/produk', valToken.fbAuth, produk.getAllProduk);
app.get('/produkKategori/:kategori', valToken.fbAuth, produk.getKategoriProduk);






exports.api = functions.https.onRequest(app);