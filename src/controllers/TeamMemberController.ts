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

	static addMemberById = async (req: Request, res: Response) => {
		const { id } = req.body;
		const user = await User.findById(id).select('id name email')
		if (!user) {
			const error = new Error('User not found')
			return res.status(404).json({ error: error.message })
		}
		if (req.project.team.includes(user.id)) {
			const error = new Error('User already in project')
			return res.status(400).json({ error: error.message })
		}
		req.project.team.push(user.id)
		await req.project.save()
		return res.status(200).send("Member added to project")
	}
}