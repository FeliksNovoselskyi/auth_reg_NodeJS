// ES-modules import
import dotenv from 'dotenv' 
import express from 'express'

import {fileURLToPath} from 'url'
import {dirname, join} from 'path'

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

app.get('/auth', (req, res) => {
    res.render('auth')
})

app.get('/reg', async (req, res) => {
    res.render('reg', {error: null})
})

// Post requests during registration
app.post('/reg', async (req, res) => {
    context = {}
    // try {
    //     if (req.query.username) {
        
    //     }
    // } catch {
        
    // }

    const {username, password, confirmPassword} = req.body
    // console.log(username, password, confirmPassword)

    if (!username || !password || !confirmPassword) {
        context.error = 'You must fill all inputs for registration' 
    } else if (password !== confirmPassword) {
        context.error = 'Passwords are not confirming' 
    } else {   
        context.error = null
    }
    
    return res.render('reg', context)
})

app.listen(PORT, HOST, () => {
    console.log(`Server started on http://${HOST}:${PORT}`)
})
