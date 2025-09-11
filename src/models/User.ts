import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
	name: string,
	email: string,
	password: string,
	confirmed: boolean
}

const userSchema: Schema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		lowercase: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	confirmed: {
		type: Boolean,
		required: true,
		default: false,
	},
})

const User = mongoose.model<IUser>('User', userSchema)
export default User