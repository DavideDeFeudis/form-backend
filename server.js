const express = require('express');
const app = express();
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
    if (!err) {
        console.log('MongoDB Connection succeeded')
    } else {
        console.log('Error on DB connection: ' + err)
    }
});

const CustomerSchema = new mongoose.Schema({
    anrede: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    anfrage: { type: String, required: true },
    beschreibungstext: { type: String, required: false }
    // datenschutz: { type: Boolean, required: true }
})

const Customer = mongoose.model('Customer', CustomerSchema);

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

app.get('/customers', async (req, res) => {
    try {
        const customers = await Customer.find()
        res.send(customers)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Error getting customers', err })
    }
})

app.post('/contact', async (req, res) => {
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
            console.log('err:', err)
            res.status(500).json({ success: false, message: 'Error sending message.', err })
        }
        else {
            res.json({ success: true, message: 'Your message has been sent.' })
        }
    })

    const customer = new Customer(req.body)
    try {
        await customer.save()
        res.json({ success: true, message: 'Customer created' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: 'Error creating customer', err })
    }
})

// app.get('/drop', (req, res) => {
//     Customer.collection.drop()
//         .then(() => res.send({ message: 'Collection dropped' }))
//         .catch(err => res.send(err))
// })

// // ERROR HANDLER
// app.use((err, req, res, next) => {
//     res.status(500).send({ error: err.message || err })
// })

app.listen(port, () => console.log(`Listening on port ${port}`))
