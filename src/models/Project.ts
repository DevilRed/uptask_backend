import { model, Schema, Document, PopulatedDoc } from "mongoose";
import { ITask } from "./Task";

export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
  // project has many tasks
  tasks: PopulatedDoc<ITask & Document>[];
}

const ProjectSchema = new Schema<IProject>(
  {
    projectName: { type: String, required: true },
    clientName: { type: String, required: true },
    description: { type: String, required: true },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  { timestamps: true },
);

const Project = model<IProject>("Project", ProjectSchema);

export default Project;
