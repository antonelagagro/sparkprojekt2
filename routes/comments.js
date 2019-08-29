const express = require('express');
const router = express.Router();
const Comment = require('../models/comments')
const Topic = require('../models/topics');
var mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
var checkAuth = require('../middleware/check-auth');


//svi komentari
router.get('/', checkAuth, async (req, res) => {
    try {
        const comments = await Comment.find();
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//komentari za poslani id teme
router.get('/:id', checkAuth, async (req, res) => {
    try {
        var collection = await Comment.find();
      
        var list = Array();
        collection.forEach(element => {
           
            if (element.topicID == req.params.id) {
                list.push(element);
            }
        });
        res.status(200).send(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

//kreiranje komentara
router.post('/', checkAuth, async (req, res) => {
    var id = req.userData.userId;

    var topic = Topic.findById(req.body.topicID);

    if (topic !== null) {
        const nComment = new Comment({
            text: req.body.text,
            topicID: req.body.topicID,
            userID: id
        })
        try {
            const newComment = await nComment.save();
            res.status(201).json(newComment);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    else {
        res.status(404).json({ message: 'Topic does not exist' });
    }
})

//izmjena teksta komentara
router.patch('/:id', checkAuth, async (req, res) => {
    var id = req.userData.userId;
    try {
        var comment = await Comment.findById(req.params.id);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

    if (comment.userID != id) {
        res.status(401).json({ message: 'Mozete izmijeniti samo svoj komentar!' });
    }
    else {
        if (req.body.text != null) {
            comment.text = req.body.text;
        }
        try {
            var nComment = await comment.save();
            res.status(200).json(nComment);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
})

//brisanje komentara
router.delete('/:id', checkAuth, async (req, res) => {
    var id = req.userData.userId;
    try {
        var comment = await Comment.findById(req.params.id);
    } catch (error) {
        res.status(500).json({message:error.message});        
    }
    if (comment != null) {

        if (comment.userID != id) {
            res.status(401).json({ message: 'Mozete izbrisati samo svoj komentar!' });
        }
        else {

            try {
                await Comment.findByIdAndDelete(req.params.id)
                res.status(200).json({ message: 'Deleted!' })
            } catch (error) {
                res.status(500).json({ message: error.message })

            }
        }
    }
    else {
        res.status(204).json({ message: 'Komentar nije pronađen' });

    }
})




//pretraga po tekstu u komentarima
router.get('/text/:text', checkAuth, async (req, res) => {
    var textT = req.params.text.toLowerCase();
    Comment.find({
        $or: [
            { text: { "$regex": textT, "$options": "i" } }
        ]
    }, function (err, data) {
        if (err)
            res.status(500).json({ message: err.message });
        res.status(200).json(data);
    });
})

module.exports = router;