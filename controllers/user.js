// ./controllers/user.js
const db = require('../models')
const User = db.User
// add bcrypt
const bcrypt = require('bcrypt')
const saltRounds = 10

const userController = {
	register: (req, res) => {
		res.render('register')
	},
	index: (req, res) => {
		User.findAll().then(users =>{
				res.render('users', {
					users
				})
			}).catch(err => {
				console.log(err.toString())
				res.redirect('/')
			}) 
	},
	handleRegister: (req, res, next) => {
		const {	username,	password,	nickname, user_level} = req.body
		if (!username || !password || !nickname || !user_level) {
			req.flash('errorMessage', '缺少必要欄位!')
			return next()
		}

		bcrypt.genSalt(saltRounds, function (err, salt) {
			bcrypt.hash(password, salt, function (err, hash) {
				if (err) {
					req.flash('errorMessage', err.toString())
					return next()
				}

				console.log(user_level, typeof user_level)
				level = Number(user_level)
				console.log(level, typeof level)
				User.create({
					username: username,
					// nickname: nickname,
					// user_level: 1,	
					user_level: 1,
					nickname: nickname,
					password: hash
				}).then(user => {
					req.session.userId = user.id
					req.session.username = user.username
					res.redirect('/')
				}).catch(err => {
					req.flash('errorMessage', err.toString())
					return next()
				})
			});
		});

	},
	login: (req, res) => {
		res.render('login')
	},
	handleLogin: (req, res, next) => {
		const {username,password} = req.body
		if (!username || !password) {
			req.flash('errorMessage', '該填未填!')
			return next()
		}

		User.findOne({
			where: {
				username: username
			}
		}).then(user => {
			if (!user) {
				req.flash('errorMessage', '無此帳號!')
				return next()
			}

			bcrypt.compare(password, user.password, function (err, isSuccess) {
				if (err || (!isSuccess)) {
					req.flash('errorMessage', '密碼錯誤!')
					return next()
				}
				// console.log(user)
				req.session.userId = user.id
				req.session.username = user.username
				res.redirect('/')
			})
		}).catch(err => {
			req.flash('errorMessage', err.toString())
			return next()
		})
	},
	logout: (req, res) => {
		req.session.userId = null
		req.session.username = null
		res.redirect('/')
	}
}

module.exports = userController