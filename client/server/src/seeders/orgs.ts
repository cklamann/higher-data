import * as Orgs from '../tests/fixtures/fixtures';
import { SchoolSchema } from '../schemas/SchoolSchema';
import { VariableDefinitionSchema, intVariableDefinitionModel } from '../schemas/VariableDefinitionSchema';
import { UserSchema } from '../schemas/UserSchema';
import * as mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/colleges');

let testUser = {
	username: "test",
	password: "test",
	isAdmin: true
}

UserSchema.find({ username: testUser.username }).remove()
	.then(() => {
		UserSchema.schema.statics.create(testUser).then( (res:any) => console.log(res))
			.then((res:any) => console.log(res));
	});

//this seeder will let you build a simple chart

SchoolSchema.find({ unitid: Orgs.nwData.unitid }).remove().then(() => {
	let nw = new SchoolSchema(Orgs.nwData).save()
}).then((res) => console.log(res));

const in_state_tuition: intVariableDefinitionModel = {
	variable: "in_state_tuition",
	type: "currency",
	sources: [{
		start_year: 2015,
		end_year: 2017,
		source: "IPEDS",
		table: "test_ipeds_table",
		formula: "source formula doesn't matter",
		definition: "test definition",
		notes: "some test notes"
	}]
}

const room_and_board: intVariableDefinitionModel = {
	variable: "room_and_board",
	type: "currency",
	sources: [{
		start_year: 2015,
		end_year: 2017,
		source: "IPEDS",
		table: "test_ipeds_table",
		formula: "source formula doesn't matter",
		definition: "test definition",
		notes: "some test notes would go here"
	}]
}


VariableDefinitionSchema.find({ variable: { "$in": [in_state_tuition.variable, room_and_board.variable] } }).remove()
	.then(() => {
		let inState = new VariableDefinitionSchema(in_state_tuition).save().then(res => console.log(res));
	}).then(() => {
		let roomAndBoard = new VariableDefinitionSchema(room_and_board).save().then((res) => console.log(res));
	});