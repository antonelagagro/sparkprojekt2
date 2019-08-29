const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    imeIPrezime: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    lozinka: {
        type: String,
        require: true
    },
    ponovljenaLozinka: {
        type: String,
        require: true
    },
    prihvaceniUvjetiKoristenja:{
        type:Boolean,
        require:true
    }
})

module.exports=mongoose.model('Users',usersSchema);