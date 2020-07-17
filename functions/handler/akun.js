const { admin, db } = require('../utils/admin');
const { uuid } = require("uuidv4");
const bcrypt = require('bcrypt');
const config = require('../utils/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignUpUser, validateSignUpBengkel, validateLoginUser } = require('../utils/validators');
const { makeid, saltRounds } = require('../utils/constant');

exports.signUp = (req, res) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            if (req.params.type === 'user') {
                const newUser = {
                    nama: req.body.nama,
                    email: req.body.email,
                    nomor_telp: req.body.nomor_telp,
                    alamat: req.body.alamat,
                    password: req.body.password,
                    confirm_password: req.body.confirm_password,
                    lat: req.body.lat,
                    lng: req.body.lng,
                };

                const { valid, errors } = validateSignUpUser(newUser);

                if (!valid) return res.status(400).json(errors)

                const noImg = 'no-img.png'

                let token, userId, email;
                db.doc(`/users/${newUser.email}`).get()
                    .then(doc => {
                        if (doc.exists) {
                            return res.status(400).json({
                                status: 400,
                                email: "Email sudah digunakan!"
                            })
                        } else {
                            return firebase.auth()
                                .createUserWithEmailAndPassword(newUser.email, newUser.password)
                        }
                    })
                    .then((data) => {
                        // console.log("UID :",data.user.uid)
                        userId = data.user.uid;
                        email = data.user.email;
                        // reftoken=data.user.
                        return data.user.getIdToken();
                    })
                    .then((idToken) => {
                        token = idToken;
                        const userCredentials = {
                            createdAt: new Date().toISOString(),
                            id_user: userId,
                            nama: newUser.nama,
                            nomor_telp: newUser.nomor_telp,
                            email: newUser.email,
                            password: hash,
                            alamat: newUser.alamat,
                            coordinats: new admin.firestore.GeoPoint(newUser.lat, newUser.lng),
                            type: 1,
                            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                        };
                        return db.doc(`/users/${newUser.email}`).set(userCredentials);
                    }).then(() => {
                        return res.status(200).json({
                            status: 200,
                            message: `Berhasil daftar ${newUser.nama}`,
                            data: {
                                id_user: userId,
                                nama: newUser.nama,
                                nomor_telp: newUser.nomor_telp,
                                email: email,
                                alamat: newUser.alamat,
                                location: { lat: newUser.lat, lng: newUser.lng },
                                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                                type: 1,
                            },
                            token: token,
                        })
                    })
                    .catch((err) => {
                        console.error(err);
                        if (err.code === 'auth/email-already-in-use') {
                            return res.status(400).json({
                                status: 400,
                                email: "Email sudah digunakan!"
                            })
                        } else {
                            return res.status(500).json({
                                status: 500,
                                error: err.code
                            })
                        }
                    })
            } else {
                const newUser = {
                    nama_bengkel: req.body.nama_bengkel,
                    nama_pemilik: req.body.nama_pemilik,
                    email: req.body.email,
                    alamat: req.body.alamat,
                    nomor_telp: req.body.nomor_telp,
                    password: req.body.password,
                    confirm_password: req.body.confirm_password,
                    lat: req.body.lat,
                    lng: req.body.lng,
                };

                const { valid, errors } = validateSignUpBengkel(newUser);

                if (!valid) return res.status(400).json(errors)

                const noImg = 'no-img.png'

                let token, userId, email;
                db.doc(`/users/${newUser.email}`).get()
                    .then(doc => {
                        if (doc.exists) {
                            return res.status(400).json({
                                status: 400,
                                email: "Email sudah digunakan!"
                            })
                        } else {
                            return firebase.auth()
                                .createUserWithEmailAndPassword(newUser.email, newUser.password)
                        }
                    })
                    .then((data) => {
                        userId = data.user.uid;
                        email = data.user.email;
                        return data.user.getIdToken();
                    })
                    .then((idToken) => {
                        token = idToken;
                        const userCredentials = {
                            createdAt: new Date().toISOString(),
                            id_user: userId,
                            nama_bengkel: newUser.nama_bengkel,
                            nama_pemilik: newUser.nama_pemilik,
                            email: newUser.email,
                            alamat: newUser.alamat,
                            nomor_telp: newUser.nomor_telp,
                            password: hash,
                            coordinats: new admin.firestore.GeoPoint(newUser.lat, newUser.lng),
                            type: 0,
                            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                        };
                        return db.doc(`/users/${newUser.email}`).set(userCredentials);
                    }).then(() => {
                        return res.status(200).json({
                            status: 200,
                            message: `Berhasil daftar bengkel ${newUser.nama_bengkel}`,
                            data: {
                                id_user: userId,
                                nama_bengkel: newUser.nama_bengkel,
                                nama_pemilik: newUser.nama_pemilik,
                                nomor_telp: newUser.nomor_telp,
                                email: email,
                                alamat: newUser.alamat,
                                location: { lat: newUser.lat, lng: newUser.lng },
                                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                                type: 0,
                            },
                            token: token,
                        })
                    })
                    .catch((err) => {
                        console.error(err);
                        if (err.code === 'auth/email-already-in-use') {
                            return res.status(400).json({
                                status: 400,
                                email: "Email sudah digunakan!"
                            })
                        } else {
                            return res.status(500).json({
                                status: 500,
                                error: err.code
                            })
                        }
                    })
            }
        });
    });
}

// // bengkel
// exports.signUpBengkel = (req, res) => {
//     bcrypt.genSalt(saltRounds, function (err, salt) {
//         bcrypt.hash(req.body.password, salt, function (err, hash) {

//         });
//     });
// }

// user
exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };

    const { valid, errors } = validateLoginUser(user);

    if (!valid) return res.status(400).json(errors)

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.status(200).json({
                status: 200,
                message: "Login berhasil!",
                email: user.email,
                token: token,
                type: 0,
            })
        })
        .catch((err) => {
            if (err.code === 'auth/invalid-email') {
                return res.status(403).json({
                    status: 403,
                    message: "Email tidak valid, silahkan masukkan dengan benar!"
                })
            } else if (err.code === 'auth/user-not-found') {
                return res.status(403).json({
                    status: 403,
                    message: "Email tidak ditemukan, silahkan daftar dahulu!"
                })
            } else if (err.code === 'auth/wrong-password') {
                return res.status(403).json({
                    status: 400,
                    message: "Password anda salah!"
                })
            } else return res.status(500).json({ error: err.code });
        })
}

exports.getDetailUsers = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.params.email}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                userData.user = doc.data();
                return db
                    .collection("users")
                    .where("email", "==", req.params.email)
                    .orderBy("createdAt", "desc")
                    .get();
            } else {
                return res.status(404).json({ errror: "User not found" });
            }
        })
        .then((data) => {
            userData = [];
            data.forEach((doc) => {
                userData.push({
                    id_user: doc.data().id_user,
                    createdAt: doc.data().createdAt,
                    nama: doc.data().nama,
                    email: doc.data().email,
                    imageUrl: doc.data().imageUrl,
                    nomor_telp: doc.data().nomor_telp,
                    alamat: doc.data().alamat,
                    location: doc.data().coordinats,
                    type: doc.data().type,
                });
            });
            return res.status(200).json({
                status: 200,
                message: "Berhasil detail user",
                userData
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
}