const { admin, db } = require('./admin');


exports.fbAuth = (req, res, next) => {
    let idToken;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No Token Found')
        return res.status(403).json({
            status: 403,
            error: "Unauthorized token"
        })
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodeToken => {
            req.user = decodeToken;
            return db.collection('users')
                .where('id_user', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then((data) => {
            req.user.handle = data.docs[0].data().handle;
            return next();
        })
        .catch((err) => {
            if (err.code == 'auth/id-token-expired') {
                res.status(401).json({
                    status: 401,
                    message: "Token expired!"
                })
            }
            // return res.status(403).json(err);
        })
}