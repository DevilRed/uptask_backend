import type { Request, Response } from "express";
import User from "../models/User";

export class TeamMemberController {
	static findMemberByEmail = async (req: Request, res: Response) => {
		const { email } = req.body;
		const user = await User.findOne({ email }).select('id name email')
		if (!user) {
			const error = new Error('User not found')
			return res.status(404).json({ error: error.message })
		}
		return res.status(200).json(user)
	}
}