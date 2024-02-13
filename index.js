import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import express from 'express'
import hbs from 'hbs'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { readPosts, readUser, insertUser, insertPost, likeFun, shareFun, deleteFun } from './operations.js'
const app = express()

mongoose.connect("mongodb://127.0.0.1:27017/cinema", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const screen1Model = mongoose.model('screen1', {
    seatno: { type: Number },
    status: { type: String }
})
const screen2Model = mongoose.model('screen2', {
    seatno: { type: Number },
    status: { type: String }
})
const screen3Model = mongoose.model('screen3', {
    seatno: { type: Number },
    status: { type: String }
})
const moviesModel = mongoose.model('movies', {
    name: { type: String },
    rate: { type: Number },
    screenNo: { type: Number }

})

var screen1Res
screen1Model.find()
    .then(function (output) {
        screen1Res = output


    })
    .catch(function (err) {
        console.log(err)

    })

var screen2Res
screen2Model.find()
    .then(function (output) {
        screen2Res = output


    })
    .catch(function (err) {
        console.log(err)

    })
    
var screen3Res
screen3Model.find()
    .then(function (output) {
        screen3Res = output


    })
    .catch(function (err) {
        console.log(err)

    })
var moviesRes
moviesModel.find()
    .then(function (output) {
        moviesRes = output


    })
    .catch(function (err) {
        console.log(err)

    })


app.set('view engine', 'hbs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

app.get('/', (req, res) => {
    res.render("login")

})

app.get('/cinema', (req, res) => {
    res.render("cinema", {
        movies: moviesRes,
        screen1: screen1Res,
        screen2: screen2Res,
        Screen3: screen3Res

    })

})

app.post('/login', async (req, res) => {
    const output = await readUser(req.body.profile)
    const password = output[0]. password
    if (password === req.body.password) {
        const secret = "a56a1923b570596420b1107160f41f32496024b9f29714beebecfb5732fab6453ac14ded37db64225e277182f08e34ec5a09fa41950836cb2d05e983145207f3"
        const paylod = { "profile": output[0].profile, "name": output[0].name, "headline": output[0].headline }
        const token = jwt.sign(paylod, secret)


        res.cookie("token", token)
        res.redirect("/posts")
    }
    else {

        res.send("Incorrect userName or Password")
    }

})

app.get('/posts', verifyLogin, async (req, res) => {
    const output = await readPosts()
    res.render("posts", {
        data: output,
        userInfo: req.payload
    })
})

app.post('/addposts', async (req, res) => {
    await insertPost(req.body.profile, req.body.content)
    res.redirect("/posts")

})

function verifyLogin(req, res, next) {
    const secret = "a56a1923b570596420b1107160f41f32496024b9f29714beebecfb5732fab6453ac14ded37db64225e277182f08e34ec5a09fa41950836cb2d05e983145207f3"
    const token = req.cookies.token
    jwt.verify(token, secret, (err, payload) => {
        if (err) return res.sendStatus(403)
        req.payload = payload
    })
    next()
}

app.post('/adduser', async (req, res) => {
    if (req.body.password === req.body.cnfpassword) {
        await insertUser(req.body.name, req.body.profile, req.body.password, req.body.headline)
        res.redirect('/')

    }
    else {
        res.send("password and Confirm password Did Not Match")

    }

})

app.get('/register', (req, res) => {
    res.render("register")
})
app.post('/like', async (req, res) => {
    await likeFun(req.body.content)
    res.redirect('/posts')

})
app.post('/share', async (req, res) => {
    await shareFun(req.body.content)
    res.redirect('/posts')

})
app.post('/delete', async (req, res) => {
    await deleteFun(req.body.content)
    res.redirect('/posts')

})
app.listen(3000, () => {
    console.log("Server is Running...")
})