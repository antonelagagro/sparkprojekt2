const mongoose=require('mongoose');

const topicsSchema=new mongoose.Schema( {
    title:{
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId, ref:'users',
        required:true
    }
})

module.exports=mongoose.model('topics',topicsSchema);