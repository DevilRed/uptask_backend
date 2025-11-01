import { Document, model, Schema, Types } from "mongoose";
import Note from "./Note";

// define an object to act as a dictionary for status attribute
const taskStatus = {
  PENDING: 'pending',
  ON_HOLD: 'onHold',
  IN_PROGRESS: 'inProgress',
  UNDER_REVIEW: 'underReview',
  COMPLETED: 'completed'
} as const

// keyof: to set tasks status value to be only 'pending', 'onHold' ....
export type TasksStatus = typeof taskStatus[keyof typeof taskStatus]
export interface ITask extends Document {
  name: string;
  description: string;
  project: Types.ObjectId;
  status: TasksStatus
  completedBy: {
    user: Types.ObjectId;
    status: TasksStatus;
  }[]
  notes: Types.ObjectId[]
}

export const isValidTaskStatus = (value: string): value is TasksStatus => {
  return Object.values(taskStatus).includes(value as TasksStatus);
}

export const TaskSchema = new Schema<ITask>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    status: { type: String, enum: Object.values(taskStatus), default: taskStatus.PENDING },
    completedBy: [{
      user: { type: Schema.Types.ObjectId, ref: "User", default: null },
      status: { type: String, enum: Object.values(taskStatus), default: taskStatus.PENDING }
    }],
    notes: [
      {
        type: Types.ObjectId,
        ref: 'Note'
      }
    ]
  },
  { timestamps: true },
);
// middleware, remove related notes when task is deleted
TaskSchema.pre('deleteOne', {document: true}, async function(next) {
  const taskId = this._id;
  if(!taskId) return;
  await Note.deleteMany({ task: taskId });
  next();
})


const Task = model<ITask>("Task", TaskSchema);

export default Task;
