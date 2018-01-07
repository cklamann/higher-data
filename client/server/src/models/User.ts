import { model, Schema, Document, Model } from 'mongoose';

export interface intUserModel extends Document {
	username: string,
	password: string,
	isAdmin: boolean,
	verifyPassword: any,
};

let schema: Schema = new Schema({
	username: String,
	password: String,
	isAdmin: Boolean
});

export let UserSchema = model<intUserModel>('user', schema);