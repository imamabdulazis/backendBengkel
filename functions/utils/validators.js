const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false
}

const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}

exports.validateSignUpUser = (data) => {
    let errors = {}

    if (isEmpty(data.email)) {
        errors.email = "Email tidak boleh kosong!"
    } else if (!isEmail(data.email)) {
        errors.email = 'Email anda tidak valid!'
    }

    if (isEmpty(data.password)) errors.password = "Tidak boleh kosong!";
    if (data.password !== data.confirm_password) errors.confirm_password = "Password tidak sama!"
    if (isEmpty(data.nama)) errors.nama = "Tidak boleh kosong!";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginUser = (data) => {
    let errors = {};

    if (isEmpty(data.email)) errors.email = "Tidak boleh kosong!";
    if (isEmpty(data.password)) errors.password = "Tidak boleh kosong!";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

// exports.validateCreateSukuBunga = (data) => {
//     let errors = {}

//     if (isEmpty(data.jenis_tabungan)) errors.jenis_tabungan = "Tidak boleh kosong!"
//     if (isEmpty(data.saldo)) errors.saldo = "Tidak boleh kosong!";
//     if (isEmpty(data.bunga)) errors.bunga = "Tidak boleh kosong!";

//     return {
//         errors,
//         valid: Object.keys(errors).length === 0 ? true : false
//     }
// }