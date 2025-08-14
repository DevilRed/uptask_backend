import { Document, model, Schema, Types } from "mongoose";

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
}

export const isValidTaskStatus = (value: string): value is TasksStatus => {
  return Object.values(taskStatus).includes(value as TasksStatus);
}

export const TaskSchema = new Schema<ITask>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    status: { type: String, enum: Object.values(taskStatus), default: taskStatus.PENDING }
  },
  { timestamps: true },
);

const Task = model<ITask>("Task", TaskSchema);

export default Task;
