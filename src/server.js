// ES-modules import
import dotenv from 'dotenv' 
import express from 'express'
import bcrypt from 'bcrypt'
import session from 'express-session'

import {fileURLToPath} from 'url'
import {dirname, join} from 'path'

// My scripts
import * as dataBaseFuncs from './database.js'
import * as utilsFuncs from './utils.js'

dotenv.config({path: '../.env'})

const app = express()

app.use(session({
    secret: 'lalalalalalala',
    resave: false,
    saveUninitialized: false,
}))

app.use(express.urlencoded({extended: true}))

let context = {}

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || 'localhost'

// Prepare file system consts for config temp. and stat.
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configure templates and statics
app.set('view engine', 'ejs')
app.set('views', './templates')

app.use('/static/', express.static(join(__dirname, 'static')))

app.get('/', (req, res) => {
    context = {}

    utilsFuncs.getUsername(req, context)

    res.render('index', context)
})

app.get('/contacts', (req, res) => {
    context = {
        city: "Dnipro",
        region: "Dnipropetrovska oblast'",
        country: "Ukraine UA",
        year: "2024"
    }

    utilsFuncs.getUsername(req, context)

    res.render('contacts', context)
})

// Authorize
app.get('/auth', (req, res) => {
    context = {}
    
    utilsFuncs.getUsername(req, context)

    context.error = null
    context.session = req.session

    return res.render('auth', context)
})

// Authorization post requests
app.post('/auth', (req, res) => {
    context = {}

    const {username, password, action} = req.body
    
    if (action === 'login') {
        if (!username || !password) {
            context.error = 'You must fill all inputs for authorization'
            context.username = null
            context.session = null
            return res.render('auth', context)
        }
        dataBaseFuncs.getUser(username, (user) => {
            bcrypt.compare(password, user.password, (error, result) => {
                if (error) {
                    console.log(error)
                    return res.render('auth', context)
                }
                
                if (result) {
                    req.session.user = {
                        username: user.username
                    }
    
                    context.error = null
                    context.session = req.session
                    context.username = req.session.user.username
                } else {
                    context.error = 'Password incorrect'
                    context.username = null
                    context.session = null
                }
    
                return res.render('auth', context)
            })
        })
    } else if (action === 'logout') {
        req.session.destroy(function (error) {
            if (error) {
                console.log(error)
            } else {
                return res.redirect('/')
            }
        })
    }
})

// Register
app.get('/reg', (req, res) => {
    context = {}

    utilsFuncs.getUsername(req, context)

    context.error = null
    
    res.render('reg', context)
})

// Post requests during registration
app.post('/reg', (req, res) => {
    context = {}

    const {username, password, confirmPassword} = req.body

    if (!username || !password || !confirmPassword) {
        context.error = 'You must fill all inputs for registration'
        context.username = null
    } else if (password !== confirmPassword) {
        context.error = 'Passwords are not confirming'
        context.username = null
    } else if (password.length > 8) {
        context.error = 'Password must less then 8 symbols'
        context.username = null
    } else {   
        context.error = null

        const saltRounds = 10

        bcrypt.genSalt(saltRounds, (error, salt) => {
            if (error) {
                return
            }
            
            bcrypt.hash(password, salt, (error, hash) => {
                if (error) {
                    return
                }
                
                dataBaseFuncs.addNewUser(username, hash)
            })
        })
    }
    context.username = null

    return res.render('reg', context)
})

app.listen(PORT, HOST, () => {
    console.log(`Server started on http://${HOST}:${PORT}`)
})
