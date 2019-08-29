const mongoose=require('mongoose');

const commentsSchema=new mongoose.Schema( {
    text:{

        type:String,
        required:true
    },
    topicID:{
        type: mongoose.Schema.Types.ObjectId,ref:'topics',
        required:true
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId, ref:'users',
        required:true
    }
})

module.exports=mongoose.model('comments',commentsSchema);