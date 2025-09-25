import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

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
		const user = await User.findById(decoded.id)
		console.log(user);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: 'Invalid token' })
	}
	next()
}
