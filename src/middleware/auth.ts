import { NextFunction, Request, Response } from "express";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	// get token from headers
	const bearer = req.headers.authorization;
	if (!bearer) {
		const error = new Error('Unauthorized')
		return res.status(401).json({ error: error.message })
	}
	// destructure token
	const token = bearer.split(' ')[1]
	console.log(token);
	next()
}
