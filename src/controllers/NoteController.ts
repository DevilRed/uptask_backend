import type { Request, Response } from "express";
import Note, { INote } from "../models/Note";

export class NoteController {
	// set type to request data
	static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
		const {content} = req.body
		const note = new Note()
		note.content = content
		note.createdBy = req.user?.id
		note.task = req.task.id

		// update task with note
		req.task.notes.push(note.id)
		try {
			await Promise.allSettled([note.save(), req.task.save()])
			return res.send('Note successfully created')
		} catch (error) {
			console.log(error);
			res.status(500).json({error: 'There was an error'})
		}

		req.task.notes.push(note.id)
	}
}