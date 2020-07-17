const { db, admin } = require('../utils/admin');
const { uuid } = require("uuidv4");
const { validateCreateProduk } = require('../utils/validators');
const { makeid } = require('../utils/constant');
const config = require('../utils/config');
const BusBoy = require('busboy');
const _ = require('lodash');


exports.postOneProduk = (req, res) => {
    const busboy = new BusBoy({ headers: req.headers });
    const path = require("path");
    const os = require("os");
    const fs = require("fs");
    let imageToBeUploaded = {};
    let imageFileName;
    let generatedToken = uuid();

    let data = []
    let newProduk = {}

    busboy.on("field", (key, value) => {
        data.push(value);
    });

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        // console.log(fieldname, file, filename, encoding, mimetype);
        if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
            return res.status(400).json({
                status: 400,
                message: "File format salah!"
            });
        }
        // my.image.png => ['my', 'image', 'png']
        const imageExtension = filename.split(".")[filename.split(".").length - 1];
        // 32756238461724837.png
        imageFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype,
                        //Generate token to be appended to imageUrl
                        firebaseStorageDownloadTokens: generatedToken,
                    },
                },
            })
            .then(() => {
                let id_produk = makeid(20);
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media&token=${generatedToken}`;
                newProduk = {
                    nama: data[0],
                    harga: data[1],
                    stok: parseInt(data[2]),
                    kategori: data[3],
                    keterangan: data[4],
                    createAt: new Date().toISOString(),
                    imageUrl: imageUrl,
                }
                return db
                    .collection(`Produk`)
                    .doc(`${id_produk}`)
                    .set(newProduk)
                    .then(() => {
                        return res.json({
                            status: 200,
                            message: `Berhasil menambahkan data ${newProduk.nama}`
                        })
                    })
                    .catch((err) => {
                        console.error(err);
                        return res.status(500).json({ error: "Internal Server Error" });
                    });
            })
    })
    busboy.end(req.rawBody);
}

exports.updateProduk = (req, res) => {

    const updateProduk = {
        nama: req.body.nama,
        harga: req.body.harga,
        stok: req.body.stok,
        kategori: req.body.kategori,
        keterangan: req.body.keterangan,
        createAt: new Date().toISOString(),
    }

    db
        .collection('Produk')
        .doc(req.params.id)
        .update(updateProduk)
        .then(doc => {
            res.json({
                status: 200,
                message: `Berhasil update data ${updateProduk.nama}`
            })
        })
        .then(err => {
            res.status(500).json({ error: 'Ada yang salah!' })
            console.error(err);
        })
}

exports.updateImage = (req, res) => {
    const path = require("path");
    const os = require("os");
    const fs = require("fs");

    const busboy = new BusBoy({ headers: req.headers });

    let imageToBeUploaded = {};
    let imageFileName;
    // String for image token
    let generatedToken = uuid();

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
            return res.status(400).json({ error: "File format salah!" });
        }
        // my.image.png => ['my', 'image', 'png']
        const imageExtension = filename.split(".")[filename.split(".").length - 1];
        // 32756238461724837.png
        imageFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on("finish", () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype,
                        firebaseStorageDownloadTokens: generatedToken,
                    },
                },
            })
            .then(() => {
                // Append token to url
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media&token=${generatedToken}`;
                return db.doc(`/Produk/${req.params.id}`).update({ imageUrl });
            })
            .then(() => {
                return res.json({
                    status: 200,
                    message: "Update image produk berhasil!"
                });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: "something went wrong" });
            });
    });
    busboy.end(req.rawBody);
}

exports.deletOneProduk = (req, res) => {
    var id = req.params.id;
    db
        .collection('Produk')
        .doc(id)
        .delete()
        .then(doc => {
            res.json({
                status: 200,
                message: `Berhasil menghapus data produk`
            })
        })
        .then(err => {
            res.status(500).json({ error: 'Ada yang salah!' })
            console.error(err);
        })
}

exports.getAllProduk = (req, res) => {
    db
        .collection('Produk')
        .orderBy('createAt', 'desc')
        .get()
        .then(data => {
            let produk = []
            data.forEach(doc => {
                produk.push({
                    id_produk: doc.id,
                    nama: doc.data().nama,
                    harga: doc.data().harga,
                    stok: doc.data().stok,
                    kategori: doc.data().kategori,
                    keterangan: doc.data().keterangan,
                    createAt: doc.data().createAt,
                    imageUrl: doc.data().imageUrl,
                });
            });
            return res.json({
                status: 200,
                message: "Berhasil retrieve data produk",
                data: produk
            });
        })
        .catch(err => console.log(err))
}

exports.getKategoriProduk = (req, res) => {
    db
        .collection('Produk')
        .where('kategori', '==', req.params.kategori)
        .get()
        .then(data => {
            let produk = []
            data.forEach(doc => {
                produk.push({
                    id_produk: doc.id,
                    nama: doc.data().nama,
                    harga: doc.data().harga,
                    stok: doc.data().stok,
                    kategori: doc.data().kategori,
                    keterangan: doc.data().keterangan,
                    createAt: doc.data().createAt,
                    imageUrl: doc.data().imageUrl,
                });
            })
            if (!_.isEmpty(produk)) {
                return res.json({
                    status: 200,
                    message: `Berhasil retrieve kategori ${req.params.kategori}`,
                    data: produk
                })
            } else {
                return res.json({
                    status: 204,
                    message: `Data produk kategori ${req.params.kategori} kosong`,
                });
            }
        })
        .catch(err => console.log(err))
}




