const admin = require('firebase-admin');
const serviceAccount = require('./service_account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://bengkelta-8b68d.firebaseio.com",
    storageBucket: "bengkelta-8b68d.appspot.com",
});

const db = admin.firestore();

module.exports = { admin, db };