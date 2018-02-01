import { Router, Response, Request, NextFunction } from "express";
import { UserSchema, intUserSchema } from '../schemas/UserSchema';
import * as passport from 'passport';
let router = Router();

/* get users */
router.get('/', function(req, res, next) {

});

//todo: restrict route on prod!

/* create new user */
router.post('/', function(req: any, res, next) {
	UserSchema.schema.statics.create(req.body)
		.then((user:any) => {
			res.json(user);
		})
		.catch( (err:Error) => next(err));

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
	if (!req.body.username || !req.body.password) {
		res.sendStatus(400);
	}
	let user = UserSchema.findOne({ username: req.body.username }, (err: Error, user) => {
		if (err) next(err)
		return user;
	});
	user.then(user => {
		if (!user || user.password != UserSchema.schema.statics.encryptPw(req.body.password)) {
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