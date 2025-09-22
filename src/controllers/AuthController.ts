import { Request, Response } from "express";
import { AuthEmail } from "../emails/AuthEmail";
import Token from "../models/Token";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
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

			// email send
			AuthEmail.sendConfirmationEmail({
				email: user.email,
				name: user.name,
				token: token.token
			})

			// await user.save();
			// await token.save()
			await Promise.allSettled([user.save(), token.save()])

			res.status(201).send('Account created successfully, check your email to confirm your account');
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			res.status(500).json({ error: 'some error' })
		}
	}

	static confirmAccount = async (req: Request, res: Response) => {
		try {
			const { token } = req.body
			const tokenExists = await Token.findOne({ token })
			if (!tokenExists) {
				const error = new Error('Invalid token')
				return res.status(401).json({ error: error.message })
			}
			// get user from token update his confirmed field
			const user = await User.findById(tokenExists.user)
			user!.confirmed = true
			await Promise.allSettled([
				user!.save(),
				tokenExists.deleteOne()
			])
			return res.send('Account confirmed successfully')
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'There was an error' })
		}
	}

	static login = async (req: Request, res: Response) => {
		try {
			// verify user exists
			const { email, password } = req.body
			const user = await User.findOne({ email });
			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}
			// verify token is confirmed
			if (!user.confirmed) {
				const token = new Token()
				token.token = generateToken()
				token.user = user.id
				await token.save()

				// email send
				AuthEmail.sendConfirmationEmail({
					email: user.email,
					name: user.name,
					token: token.token
				})

				return res.status(201).send('Account needs to be confirmed, check your email to confirm your account');
			}
			// validate password
			const isPasswordCorrect = await checkPassword(password, user.password)
			if (!isPasswordCorrect) {
				res.status(401).json({ error: 'Incorrect Password' })
			}
			return res.status(200).send('Authenticated');
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'There was an error' })
		}
	}

	static requestConfirmationCode = async (req: Request, res: Response) => {
		try {
			const { email } = req.body;
			// user exists
			const user = await User.findOne({ email });
			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			if (user.confirmed) {
				const error = new Error('The user is already confirmed')
				return res.status(409).json({ error: error.message })
			}

			// generate token
			const token = new Token()
			token.token = generateToken()
			token.user = user.id

			// email send
			AuthEmail.sendConfirmationEmail({
				email: user.email,
				name: user.name,
				token: token.token
			})

			// await user.save();
			// await token.save()
			await Promise.allSettled([user.save(), token.save()])

			res.status(201).send('A new token has been sent, check your email to confirm your account');
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			res.status(500).json({ error: 'There was an error.' })
		}
	}
}