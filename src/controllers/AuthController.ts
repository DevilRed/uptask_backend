import { Request, Response } from "express"
import User from "../models/User";
import { hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";

export class AuthController {
	static createAccount = async (req: Request, res: Response) => {
		try {
			const { name, email, password } = req.body;
			// check if user already exists
			const userExists = await User.findOne({ email });
			if (userExists) {
				return res.status(409).json({ error: 'User already exists' });
			}

			const user = new User({ name, email, password });
			user.password = await hashPassword(password);

			// generate token
			const token = new Token()
			token.token = generateToken()
			token.user = user.id

			// await user.save();
			// await token.save()
			await Promise.allSettled([user.save(), token.save()])

			res.status(201).send('Account created successfully, check your email to confirm your account');
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	}
}