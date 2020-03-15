const express = require('express');
const app = express();
const { check, body, validationResult } = require("express-validator")
const sendMail = require('./mail');
const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT || 4000
const mongoUrl = process.env.MONGO

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}, (err) => {
    if (!err) console.log('MongoDB Connection succeeded')
    else console.log('Error on DB connection: ' + err)
});

const UserSchema = new mongoose.Schema({
    anrede: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    anfrage: { type: String, required: true },
    beschreibungstext: { type: String, required: false }
    // datenschutz: { type: Boolean, required: true }
})

const User = mongoose.model('User', UserSchema);

app.use(express.json())

app.use((req, res, next) => {
    res.set('ACCESS-CONTROL-ALLOW-ORIGIN', process.env.CORS_ORIGIN)
    res.set('ACCESS-CONTROL-ALLOW-HEADERS', '*')
    res.set('ACCESS-CONTROL-ALLOW-METHODS', 'GET, POST')
    next()
})

app.get('/version', (req, res) => {
    res.json({ message: 'Form version 1' })
})

app.get('/users', async (req, res) => {
    try {
        const users = await User.find()
        res.send(users)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Error getting users.', err })
    }
})

const validation = [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is too short.'),
    body('email', 'Incorrect email format.').normalizeEmail().trim().isEmail(),
    body('beschreibungstext').trim().escape()
]

const createUser = async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        console.log('User created.')
        res.json({ success: true, message: 'User created.' })
    } catch (err) {
        console.log('Error creating user.', err)
        res.status(500).json({ success: false, message: 'Error creating user.', err })
    }
}

app.post('/contact', validation, (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let { name, email, anfrage, beschreibungstext } = req.body
    console.log('req.body:', req.body)
    const subject = anfrage
    if (beschreibungstext) {
        text = beschreibungstext
    } else {
        text = anfrage
    }
    sendMail(email, name, subject, text, (err, data) => {
        if (err) {
            console.log('Error sending email.', err)
            res.status(500).json({ success: false, message: 'Error sending email.', err })
        }
        else {
            console.log('Your email has been sent.')
            createUser(req, res)
            // res.json({ success: true, message: 'Your email has been sent.' })
        }
    })
})

app.get('/drop', (req, res) => {
    User.collection.drop()
        .then(() => res.send({ message: 'User collection dropped.' }))
        .catch(err => res.send(err))
})

app.use((err, req, res, next) => {
    res.status(500).send({ error: err.message || err }) // error handler
})

app.listen(port, () => console.log(`Listening on port ${port}`))
