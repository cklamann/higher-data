import { Router, Response, Request, NextFunction } from "express";
import { UserSchema, intUserModel } from '../models/User';
import * as passport from 'passport';
import * as crypto from 'crypto';
let router = Router();

function encryptPw(pw: string): string {
	const cipher = crypto.createCipher('aes192', 'a password');
	let encrypted = cipher.update(pw, 'utf8', 'hex');
	return encrypted += cipher.final('hex');
}

/* get users */
router.get('/', function(req, res, next) {

});

/* create new user */
router.post('/', function(req: any, res, next) {
	const pw = encryptPw(req.body.password);
	let user = UserSchema.create({ username: req.body.username, password: pw, isAdmin: req.body.isAdmin }, function(err: Error, doc: Promise<intUserModel>) {
		if (err) {
			res.status(422);
			res.json({ name: err.name, msg: err.message });
		}
		return doc;
	});

	user.then(user => {
		res.json(user)
	});
});

/*delete user*/

router.delete('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
	UserSchema.remove({ username: req.body.username }, function(err: Error) {
		if (err) {
			res.status(500);
			res.json({ error: err.message });
		}
		res.json();
	})
})

/*login user*/

router.post('/login', (req, res, next) => {
	if(!req.body.username || !req.body.password){
		res.sendStatus(400);
	}
	let user = UserSchema.findOne({ username: req.body.username }, (err: Error, user) => {
		if (err) next(err)
		return user;
	});
	user.then(user => {
		if (!user || user.password != encryptPw(req.body.password)) {
			res.sendStatus(401);
		}
		res.json(user);
	})
});

/* logout user */
router.post('/logout', function(req, res, next) {
	req.logout();
	res.redirect('/');
});

/* destroy user */
router.delete('/', function(req, res, next) {

});

module.exports = router;