import { Document, model, Schema, Types } from "mongoose";

export interface ITask extends Document {
  name: string;
  description: string;
  project: Types.ObjectId;
}

export const TaskSchema = new Schema<ITask>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true },
);

const Task = model<ITask>("Task", TaskSchema);

export default Task;
