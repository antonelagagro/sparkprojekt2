const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/users')
const jwt = require('jsonwebtoken');
const genpass = require('generate-password');
const mailcheck = require('email-existence');

router.post('/signup', (req, res, next) => {

    User.find({
        email: req.body.email
    })
        .exec()
        .then(user => {

            if (user.length >= 1) {
                return res.status(409).json({ message: 'Mail already exists' })
            }
            else {
                mailcheck.check(req.body.email, (err, response) => {
                    if (err) {
                        return res.status(409).json({ message: 'Mail does not exist!' })
                    }
                    else {
                        var user = new User({
                            imeIPrezime: req.body.imeIPrezime,
                            email: req.body.email,
                            lozinka: req.body.lozinka,
                            ponovljenaLozinka: req.body.ponovljenaLozinka,
                            prihvaceniUvjetiKoristenja: req.body.prihvaceniUvjetiKoristenja
                        })
                        if (user.lozinka.length < 8)
                            res.status(422).json({ message: 'Lozinka mora imati minimalno 8 karaktera.' })
                        if (user.lozinka == user.ponovljenaLozinka && user.prihvaceniUvjetiKoristenja == true) {
                            try {
                                var nUser = user.save();
                                res.status(201).json({ message: 'User created' })
                            } catch (error) {
                                res.status(500).json({ message: error.message });
                            }
                        }
                        else
                               res.status(422).json({ message: 'Neispravno uneseni podaci!' });
                    }
                })
            }


        })
        .catch()


})
router.post('/login', (req, res, next) => {



    User.find({ email: req.body.email }, function (err, obj) {
        if (err) {
            return res.status(401).json({ message: 'Auth failed' })
        }
        if (obj[0] != undefined) {

            var obj = obj[0].toObject();
            var lozinka = obj.lozinka;
            var email = obj.email;
            var id = obj._id;
            if (lozinka !== req.body.lozinka) {


                return res.status(401).json({ message: 'Auth failed' })
            }
            else {
                const token = jwt.sign({
                    email: email,
                    userId: id
                }, process.env.JWT_KEY, {
                        expiresIn: "1h"
                    }
                );
                return res.status(200).json({ message: 'Auth successful', token: token })
            }
        }
        else {
            return res.status(401).json({ message: 'Auth failed' })

        }

    })


})
router.delete('/:id', async (req, res) => {

    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(201).json({ message: 'Deleted!' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

})

//reset password
router.post('/reset', async (req, res) => {
    const sgMail = require('@sendgrid/mail');
    var email = req.body.email;

    User.find({ email: email }, (err, obj) => {
        if (obj[0] == undefined)
            res.json({ message: 'User not found!' });
        else {
            var user = obj[0].toObject();
            var pass = genpass.generate({
                length: 8,
                numbers: true
            });
            sgMail.setApiKey(process.env.APIKEY);
            const msg = {
                to: email,
                from: 'test@outlook.com',
                subject: 'Your new password',
                html: `<strong>This is your new password: ${pass}</strong>`,
            };
            try {
                sgMail.send(msg);
                var query = { _id: user._id };
                mongoose.set('useFindAndModify', false);
                User.findOneAndUpdate(query, { $set: { lozinka: pass, ponovljenaLozinka: pass } }, { new: true }, (err, doc) => {
                    if (err)
                        res.status(500).json({message:err.message});
                    else
                        res.status(201).json({ message: 'Check your new password on mail' });

                });
            } catch (error) {
                res.status(500).json({ message: error.message })
            }

        }
    })

});



module.exports = router;