// ES-modules import
import dotenv from 'dotenv' 
import express from 'express'
import bcrypt from 'bcrypt'

import {fileURLToPath} from 'url'
import {dirname, join} from 'path'

// My scripts
import * as dataBaseFuncs from './database.js'

dotenv.config({path: '../.env'})

const app = express()

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
    res.render('index')
})

app.get('/contacts', (req, res) => {
    context = {
        city: "Dnipro",
        region: "Dnipropetrovska oblast'",
        country: "Ukraine UA",
        year: "2024"
    }
    res.render('contacts', context)
})

// Authorize
app.get('/auth', (req, res) => {
    res.render('auth', {error: null})
})

// Authorization post requests
app.post('/auth', (req, res) => {
    context = {}

    const {username, password} = req.body

    if (!username || !password) {
        context.error = 'You must fill all inputs for authorization'
        return res.render('auth', context)
    }
    dataBaseFuncs.getUser(username, (user) => {
        bcrypt.compare(password, user.password, (error, result) => {
            if (error) {
                console.log(error)
                return res.render('auth', context)
            }
            
            if (result) {
                console.log('Succesful')
                context.error = null
            } else {
                context.error = 'Password incorrect'
            }

            return res.render('auth', context)
        })
    })
})

// Register
app.get('/reg', (req, res) => {
    res.render('reg', {error: null})
})

// Post requests during registration
app.post('/reg', (req, res) => {
    context = {}

    const {username, password, confirmPassword} = req.body

    if (!username || !password || !confirmPassword) {
        context.error = 'You must fill all inputs for registration' 
    } else if (password !== confirmPassword) {
        context.error = 'Passwords are not confirming' 
    } else if (password.length > 8) {
        context.error = 'Password must less then 8 symbols'
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
    
    return res.render('reg', context)
})

app.listen(PORT, HOST, () => {
    console.log(`Server started on http://${HOST}:${PORT}`)
})
