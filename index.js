// index.js
const express = require('express')
// add body parser
const bodyParser = require('body-parser')
// add express session
const session = require('express-session')
// add connect flash
const flash = require('connect-flash')
// add cors
const cors = require('cors')
// start express
const app = express()
const port = process.env.PORT || 5000
// controllers
const userController = require('./controllers/user')
const lotteryController = require('./controllers/lottery')

// set view engine type - directory is ./views
app.set('view engine', 'ejs')

// add body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// add connect flash
app.use(flash())

// add session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// add global variable - use middleware
app.use((req, res, next) => {
	res.locals.userId = req.session.userId
	// add connect flash
	res.locals.errorMessage = req.flash('errorMessage')
	next()
})

function redirectBack(req, res) {
	res.redirect('back')
}

app.get('/', lotteryController.index)
app.get('/add', lotteryController.add)
app.post('/add-handle', lotteryController.addHandle, redirectBack)
app.get('/update/:id', lotteryController.update)
app.post('/update-handle/:id', lotteryController.updateHandle, redirectBack)
app.get('/delete/:id', lotteryController.delete)

app.get('/register', userController.register)
app.post('/register', userController.handleRegister, redirectBack)
app.get('/login', userController.login)
app.post('/login', userController.handleLogin, redirectBack)
app.get('/logout', userController.logout)
app.get('/users', userController.index)

app.get('/:type', cors(), lotteryController.lottery)



// start express
app.listen(port, () => {
	console.log(`blog app listening at http://localhost:${port}`)
})
