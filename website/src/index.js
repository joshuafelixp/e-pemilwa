// environtment
import 'dotenv/config'
const port = process.env.PORT
const secret = process.env.SECRET

// app
import express from "express"
const app = express()

// connect to db
import './configs/db.js'

// request body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// session & cookieParser
import session from 'express-session'
import cookieParser from 'cookie-parser'

// flash
import flash from 'connect-flash'
app.use(cookieParser(secret))
app.use(session({
    cookie: { maxAge: 60000 },
    secret: secret,
    resave: true,
    saveUninitialized: true,
}))
app.use(flash())

// path for using views and public folder content
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

// view engine setup with ejs
app.set('view engine', 'ejs')

//ejs layouts
import expressLayouts from 'express-ejs-layouts'
app.use(expressLayouts)

// routes
import router from './routes/routes.js'
import authRouter from './routes/authRoutes.js'
import dashboardRouter from './routes/dashboardRoutes.js'
import votingRouter from './routes/votingRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import testRouter from './routes/testRoutes.js'

app.use(router)
app.use(authRouter)
app.use(dashboardRouter)
app.use(votingRouter)
app.use(adminRouter)
app.use(testRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Page Not Found')
    err.status = 404
    next(err)
})

// error handler and rendor error
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', { layout: false, status: err.status, message: err.message })
})

// server running listening on port
app.listen(port, () => {
    console.log(`Pemilwa app listening on port ${port}`)
})