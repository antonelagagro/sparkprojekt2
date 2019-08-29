require('dotenv').config();

const express=require('express');
const app=express();
const mongoose=require('mongoose');
const bodyParser=require('body-parser');    
const nodemon=require('nodemon');
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser:true});
const db=mongoose.connection
db.on('error',(error)=>console.log(error));
db.once('open',()=>console.log('Connected to db!'));

app.use(express.json());
app.use(bodyParser.json());
const topicsRouter=require('./routes/topics');
app.use('/topics',topicsRouter);
const commentsRouter=require('./routes/comments');
app.use('/comments',commentsRouter);

const usersRouter=require('./routes/users');


app.use('/users',usersRouter);

app.listen(3000,()=>console.log('Server started'));