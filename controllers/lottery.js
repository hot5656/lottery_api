// ./controllers/lottery.js
const db = require('../models')
const Lottery = db.Lottery

const lotteryController = {
	index: (req, res) => {
		Lottery.findAll({
			order: [
				['type', 'ASC'],
				['index', 'ASC'],
			]
		}).then(lotteries =>{
				res.render('index', {
					lotteries
				})
			}).catch(err => {
				console.log(err.toString())
				res.redirect('/')
			}) 
	},
	add: (req, res) => {
		res.render('add')
	},
	update: (req, res) => {
		Lottery.findOne({
			where: {
				id: req.params.id
			}
		}).then(lottery =>{
			res.render('update',{
				lottery
			})
		}).catch(err => {
			console.log(err.toString())
			res.redirect('/')
		}) 
	},
	addHandle: (req, res, next) => {
		const {	type, index, prize, description, url} = req.body
		let {	probability} = req.body
		if( !type || !index || !prize || !description || !url || !probability ){
			req.flash('errorMessage', '缺少必要欄位!')
			return next()
		}

		if (prize === 'NONE') {
			probability = 0
		}

		Lottery.findAll({
			where: {
				type: type
			}
		}).then( lotteries => {
			let percent = 0
			lotteries.forEach( lottery =>{
				percent += lottery.probability
			})

			// console.log(percent,  probability, percent+probability, (percent+Number(probability)) >= 100)
			if ((percent+Number(probability)) >= 100) {
				// req.flash('errorMessage', '總機率設定太高!')
				// next()
				throw 'over probability!';
			}
		}).then( () =>{
			Lottery.create({
				type,
				index,
				prize,
				description,
				url,
				probability
			})
		}).then(lottery => {
			res.redirect('/')
		}).catch(err => {
			if (err.toString() === 'over probability!')  {
				req.flash('errorMessage', '總機率設定太高!')
			}
			else {
				req.flash('errorMessage', err.toString())
			}
			return next()
		})
	},
	updateHandle: (req, res, next) => {
		const {	index, type, prize, description, url} = req.body
		let {	probability} = req.body
		if( !index || !prize || !description || !url || !probability ){
			req.flash('errorMessage', '缺少必要欄位!')
			return next()
		}

		if (prize === 'NONE') {
			probability = 0
		}

		Lottery.findAll({
			where: {
				type: type
			}
		}).then( lotteries => {
			let percent = 0
			lotteries.forEach( lottery =>{
				if (lottery.id !== Number(req.params.id)) {
					percent += lottery.probability
				}
			})

			// console.log(type, percent,  probability, percent+probability, (percent+Number(probability)) >= 100)
			if ((percent+Number(probability)) >= 100) {
				// req.flash('errorMessage', '總機率設定太高!')
				// next()
				throw 'over probability!';
			}
		}).then( () =>{
			Lottery.findOne({
				where: {
					id: req.params.id
				}
			}).then(lottery =>{
				lottery.update({
					index,
					prize,
					description,
					url,
					probability
				})
			})
		}).then(lottery => {
			res.redirect('/')
		}).catch(err => {
			if (err.toString() === 'over probability!')  {
				req.flash('errorMessage', '總機率設定太高!')
			}
			else {
				req.flash('errorMessage', err.toString())
			}
			return next()
		})
	},
	delete: (req,res) => {
		Lottery.findOne({
			where: {
				id: req.params.id
			}
		}).then( lottery =>{
			lottery.destroy()
		}).then(() =>{
			res.redirect('/')
		}).catch( err =>{
			console.log(err.toString())
			res.redirect('/')
		})
	}, 
	lottery: (req,res) => {
		let {type} = req.params
		let value = Math.floor(Math.random()*100)
		let percent = 0
	 	let prize = {
		 	prize: 'NULL',
		 	description: 'NULL',
		 	url: 'NULL'
		}					
		// console.log('valeu : ', value) 
		Lottery.findAll({
			where: {
				type: type
			},
			order: [
				['probability', 'DESC' ]
			]
		}).then( lotteries => {
			for (let i=0 ; i<lotteries.length ; i++) {
				// console.log(lotteries[i].id, lotteries[i].prize, lotteries[i].probability)
				percent += lotteries[i].probability

				if ((lotteries[i].prize === 'NONE') || (value < percent)) {
					prize = {
							prize: lotteries[i].prize,
							description: lotteries[i].description,
							url: lotteries[i].url
						}					
						break
				}
			} 
			// console.log(prize)
			res.json(prize)
		}).then().catch(err=> {
			console.log(err.toString())
			res.end()
		})
	}
}

module.exports = lotteryController