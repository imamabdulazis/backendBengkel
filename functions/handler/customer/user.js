const { admin, db } = require('../../utils/admin');
const { uuid } = require("uuidv4");
const bcrypt = require('bcrypt');
const config = require('../..//utils/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignUpUser, validateLoginUser } = require('../../utils/validators');
const { makeid, saltRounds } = require('../../utils/constant');

exports.signUp = (req, res) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
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

            let id_user = makeid(20);

            const { valid, errors } = validateSignUpUser(newUser);

            if (!valid) return res.status(400).json(errors)

            const noImg = 'no-img.png'

            let token, userId, email;
            db.doc(`/users/${id_user}`).get()
                .then(doc => {
                    if (doc.exists) {
                        return res.status(400).json({
                            status: 400,
                            message: 'Internal Server Error!'
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
                        id_user: id_user,
                        nama: newUser.nama,
                        nomor_telp: newUser.nomor_telp,
                        email: newUser.email,
                        password: hash,
                        alamat: newUser.alamat,
                        coordinats: new admin.firestore.GeoPoint(newUser.lat, newUser.lng),
                        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                    };
                    return db.doc(`/users/${id_user}`).set(userCredentials);
                }).then(() => {
                    return res.status(200).json({
                        status: 200,
                        message: `Berhasil daftar ${newUser.nama}`,
                        data: {
                            id_user: id_user,
                            nama: newUser.nama,
                            nomor_telp: newUser.nomor_telp,
                            email: email,
                            alamat: newUser.alamat,
                            message: `Berhasil sign up ${email}`,
                            location: { lat: newUser.lat, lng: newUser.lng },
                            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                            token: token,
                        }
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
        });
    });
}

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
                token: token,
                email: user.email,
            })
        })
        .catch((err) => {
            // console.error(err);
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

