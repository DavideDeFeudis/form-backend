const express = require('express');
const app = express();
const sendMail = require('./mail');
const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT || 4000
const mongoUrl = process.env.MONGO

app.use(express.json())

app.use((req, res, next) => {
    res.set('ACCESS-CONTROL-ALLOW-ORIGIN', process.env.CORS_ORIGIN)
    res.set('ACCESS-CONTROL-ALLOW-HEADERS', '*')
    res.set('ACCESS-CONTROL-ALLOW-METHODS', 'GET, POST')
    next()
})

app.get('/version', (req, res) => {
    res.json({ message: 'form version 1' })
})

app.post('/contact', (req, res) => {
    let { name, email, anfrage, text } = req.body
    console.log('req.body:', req.body)
    const subject = anfrage
    if (!text) text = 'Text nicht angegeben.'

    sendMail(email, name, subject, text, (err, data) => {
        if (err) {
            console.log('err:', err)
            res.status(500).json({ success: false, message: 'Error sending message.', err })
        }
        else {
            console.log('data:', data)
            res.json({ success: true, message: 'Your message has been sent.' })
        }
    })
})

app.listen(port, () => console.log(`Listening on port ${port}`))
