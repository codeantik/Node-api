const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
let User = require('./models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(`mongodb://localhost:27017/mern-app`)

app.post('/api/register', async (req, res) => {
    console.log(req.body)
    try {
        const newPassword = await bcrypt.hash(req.body.password, 10)
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword,
        })
        res.json({ status: 'ok' })
    } catch (error) {
        console.log(error)
        res.json({ status: 'error', error: 'duplicate email' })
    }
})

app.post('/api/login', async (req, res) => {

    const user = await User.findOne({
        email: req.body.email,
    })

    if(!user) {
        return res.json({ status: 'error', error: 'invalid login' })
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password)

    if(isPasswordValid) {
        const token = jwt.sign({
            name: user.name,
            email: user.email,
        }, 'secret123')

        return res.json({ status: 'ok', user: token })
    }
    else {
        return res.json({ status: 'error', user: false })
    }

})

app.get('/api/quote', async (req, res) => {

    const token = req.headers['x-access-token']

    try {
        const decoded = jwt.verify(token, 'secret123')
        const email = decoded.email
        const user = await findOne({ email: email })

        return res.json({ status: 'ok', quote: user.quote })
    }
    catch(error) {
        console.log(error)
        res.json({ status: 'error', error: 'invalid token' })
    }

})

app.post('/api/quote', async (req, res) => {

    const token = req.headers['x-access-token']

    try {
        const decoded = jwt.verify(token, 'secret123')
        const email = decoded.email
        await updateOne(
            { email: email },
            { $set: { quote: req.body.quote } },
        )

        return res.json({ status: 'ok' })
    }
    catch(error) {
        console.log(error)
        res.json({ status: 'error', error: 'invalid token' })
    }

})



app.listen(1337, () => {
    console.log('server running on port 1337')
})