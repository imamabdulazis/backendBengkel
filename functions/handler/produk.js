const { db } = require('../utils/admin');
const { validateCreateProduk } = require('../utils/validators');
const { makeid } = require('../utils/constant');

exports.postOneProduk = (req, res) => {
    let id_produk = makeid(20);
    const newProduk = {
        id_produk: id_produk,
        nama: req.body.nama,
        harga: req.body.harga,
        stok: req.body.stok,
        kategori: req.body.kategori,
        keterangan: req.body.keterangan,
        createAt: new Date().toISOString(),

    }

    const { valid, errors } = validateCreateProduk(newProduk)
    if (!valid) return res.status(400).json(errors)

    db
        .collection(`Produk`)
        .doc(`${id_produk}`)
        .set(newProduk)
        .then(doc => {
            res.json({
                status: 200,
                message: `Berhasil menambahkan data ${newProduk.nama}`
            })
        })
        .then(err => {
            res.status(500).json({ error: 'Ada yang salah!' })
            console.error(err);
        })
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

    var id_produk = req.params.id;

    db
        .collection('Produk')
        .doc(id_produk)
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


