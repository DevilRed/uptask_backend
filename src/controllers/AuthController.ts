import { Request, Response } from "express"
import User from "../models/User";

export class AuthController {
	static createAccount = async (req: Request, res: Response) => {
		try {
			const { name, email, password } = req.body;
			await User.create({ name, email, password });
			res.status(201).send('Account created successfully, check your email to confirm your account');
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	}
}