import { Document, model, Schema } from "mongoose";

export interface ITask extends Document {
  name: string;
  description: string;
}

export const TaskSchema = new Schema<ITask>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

const Task = model<ITask>("Task", TaskSchema);

export default Task;
