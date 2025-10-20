import type { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

type NoteIdParam = {
	noteId: Types.ObjectId
}
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

	static getTaskNotes = async (req: Request, res: Response) => {
		try {
			const notes = await Note.find({ task: req.task.id })
			return res.json(notes)
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'There was an error' })
		}
	}

	static deleteNote = async (req: Request<NoteIdParam>, res: Response) => {
		const { noteId } = req.params
		const note = await Note.findById(noteId)

		if (!note) {
			const error = new Error('Note not found')
			return res.status(404).json({ error: error.message })
		}
		if (note.createdBy.toString() !== req.user?.id.toString()) {
			const error = new Error('Invalid action')
			return res.status(404).json({ error: error.message })
		}
		req.task.notes = req.task.notes.filter(note => note.id.toString() !== noteId.toString())

		try {
			await Promise.allSettled([req.task.save(), note.deleteOne()])
			return res.send('Note deleted succesfully')
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'There was an error' })
		}
	}
}