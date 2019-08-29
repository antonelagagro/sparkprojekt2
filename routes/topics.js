const express = require('express');
const router = express.Router();
const Topic = require('../models/topics')
const checkAuth = require('../middleware/check-auth')

//paginacija
router.get('/page/:pageNo', checkAuth, (req, res) => {
    var pageNo = parseInt(req.params.pageNo)
    var size = 5;
    var query = {}
    if (pageNo < 0 || pageNo === 0) {
        response = { "error": true, "message": "invalid page number, should start with 1" };
        return res.status(400).json(response)
    }
    query.skip = size * (pageNo - 1)
    query.limit = size
    Topic.countDocuments({}, function (err, totalCount) {
        if (err) {
            response = { "error": true, "message": "Error fetching data" }
        }
        Topic.find({}, {}, query, function (err, data) {
            if (err) {
                response = { "error": true, "message": "Error fetching data" };
            } else {
                var totalPages = Math.ceil(totalCount / size)
                response = { "error": false, "message": data, "pages": totalPages };
            }
            return res.json(response);
        });
    })
})
//get sve teme
router.get('/', checkAuth, async (req, res) => {
    try {
        const topics = await Topic.find();
        return res.status(200).json(topics);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

//get jedne teme
router.get('/:id', checkAuth, async (req, res) => {
    try {
        topic = await Topic.findById(req.params.id);
        return res.status(200).send(topic);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


//kreiranje teme
router.post('/', checkAuth, async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    var id = req.userData.userId;
    const nTopic = new Topic({
        title: req.body.title,
        text: req.body.text,
        userID: id
    })
    try {
        const newTopic = await nTopic.save();
        return res.status(201).json(newTopic);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

//izmjena teksta teme
router.patch('/:id', checkAuth, async (req, res) => {
    var id = req.userData.userId;
    try {
        var topic = await Topic.findById(req.params.id);
    } catch (error) {
        return res.status(400).json({ message: 'Tema ne postoji' });
    }
    if (topic.userID != id) {
        return res.status(401).json({ message: 'Mozete izmijeniti samo svoju temu.' });
    }
    else {

        if (req.body.text != null) {
            topic.text = req.body.text;
        }
        try {
            var nTopic = await topic.save();
            return res.status(200).json(nTopic);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
})

//brisanje teme
router.delete('/:id', checkAuth, async (req, res) => {
    var id = req.userData.userId;
    try {

        var topic = await Topic.findById(req.params.id);
    } catch (error) {
        return res.status(400).json({ message: 'Tema ne postoji' });
    }


    if (topic.userID != id) {
        return res.status(401).json({ message: 'Mozete obrisati samo svoju temu.' })
    }
    else {
        try {
            await Topic.findByIdAndDelete(req.params.id)
            return res.status(200).json({ message: 'Deleted!' })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    }
})

//search po nazivu teme
router.get('/title/:naziv', checkAuth, async (req, res) => {
    var titleT = req.params.naziv.toLowerCase();

    Topic.find({
        $or: [
            { title: { "$regex": titleT, "$options": "i" } }
        ]
    }, function (err, data) {
        if (err)
            return res.status(500).json({ message: err.message });
        return res.status(200).json(data);
    });
})
module.exports = router;