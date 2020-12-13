import { model, Schema, Document } from "mongoose";
import * as crypto from "crypto";

export interface UserModel {
  username: string;
  password: string;
  isAdmin: boolean;
  verifyPassword: any;
}

export interface UserSchema extends UserModel, Document {}

let schema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  isAdmin: Boolean,
});

export let UserSchema = model<UserSchema>("user", schema);

UserSchema.schema.statics = {
  create: function (opts: any): Promise<UserSchema> {
    const pw = this.encryptPw(opts.password);
    return UserSchema.create({
      username: opts.username,
      verifyPassword: false,
      password: pw,
      isAdmin: opts.isAdmin,
    }).then((res) => res);
  },

  encryptPw: function (pw: string): string {
    const cipher = crypto.createCipher("aes192", "a password");
    let encrypted = cipher.update(pw, "utf8", "hex");
    return (encrypted += cipher.final("hex"));
  },
};
