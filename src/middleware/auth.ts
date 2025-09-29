import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// extend Request from express to add custom properties
declare module 'express' {
	interface Request {
		user?: IUser
	}
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	// get token from headers
	const bearer = req.headers.authorization;
	if (!bearer) {
		const error = new Error('Unauthorized')
		return res.status(401).json({ error: error.message })
	}
	// destructure token
	const token = bearer.split(' ')[1]

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
		// select required data only
		const user = await User.findById(decoded.id).select('_id name email')

		if (user) {
			// add user to request
			req.user = user
			next()
		} else {
			res.status(500).json({ error: 'Invalid token' })
		}
	} catch {
		res.status(500).json({ error: 'Invalid token' })
	}

}
