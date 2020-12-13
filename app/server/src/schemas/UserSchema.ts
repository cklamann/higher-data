import { model, Schema, Document, Model } from 'mongoose';
import * as crypto from 'crypto';


export interface intUserModel {
	username: string,
	password: string,
	isAdmin: boolean,
	verifyPassword: any,
};

export interface intUserSchema extends intUserModel, Document { };

let schema: Schema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: String,
	isAdmin: Boolean
});

export let UserSchema = model<intUserSchema>('user', schema);

UserSchema.schema.statics = {

	create: function(opts: any): Promise<intUserSchema> {
		const pw = this.encryptPw(opts.password);
		return UserSchema.create({ username: opts.username, password: pw, isAdmin: opts.isAdmin })
			.then((res) => res);
	},

	encryptPw: function(pw: string): string {
		const cipher = crypto.createCipher('aes192', 'a password');
		let encrypted = cipher.update(pw, 'utf8', 'hex');
		return encrypted += cipher.final('hex');
	} 
}
