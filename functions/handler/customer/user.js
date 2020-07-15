const { admin, db } = require('../../utils/admin');
const { uuid } = require("uuidv4");

const config = require('../..//utils/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignUpUser, validateLoginUser } = require('../../utils/validators');
const { makeid } = require('../../utils/makeid');

exports.signUp = (req, res) => {
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
                return res.status(400).json({ handle: 'Internal Server Error!' })
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
                alamat: newUser.alamat,
                coordinats: new admin.firestore.GeoPoint(newUser.lat, newUser.lng),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
            };
            return db.doc(`/users/${id_user}`).set(userCredentials);
        }).then(() => {
            return res.status(200).json({
                status: 200,
                id_user: id_user,
                nama: newUser.nama,
                nomor_telp: newUser.nomor_telp,
                email: email,
                alamat: newUser.alamat,
                message: `Berhasil sign up ${email}`,
                location: { lat: newUser.lat, lng: newUser.lng },
                token: token,
            })
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: "email sudah digunakan!" })
            } else {
                return res.status(500).json({ error: err.code })
            }
        })
}

