import * as SchoolModel from '../models/School'; // get types using import
import { Router, Response, Request, NextFunction} from "express"; //ditto, though kind pointless now

let mongoose = require("mongoose");
let School = SchoolModel.SchoolSchema;
let router = Router();

router.get('/', function(req, res, next) {
	res.json({ "response": "good" });
	return;
});


//todo: move find function to model: http://mongoosejs.com/docs/guide.html
//todo: put text index on school name: https://docs.mongodb.com/manual/text-search/
router.get('/search', function(req, res, next) {
	let name: String = req.query.name;
	School.find({ instnm: { $regex: `${name}+.`, $options: 'i' } }, (err: any, school: SchoolModel.intSchoolModel[]) => {
		school.forEach(x => console.log(x.instnm));
		if (err) next(err);
		res.json(school);
	});
	return;
});

module.exports = router;