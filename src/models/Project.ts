import { Document, model, PopulatedDoc, Schema } from "mongoose";
import { ITask } from "./Task";
import { IUser } from "./User";

export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
  // project has many tasks
  tasks: PopulatedDoc<ITask & Document>[]
  manager: PopulatedDoc<IUser & Document>
  team: PopulatedDoc<IUser & Document>[]
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
    // save user id
    manager: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    team: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

const Project = model<IProject>("Project", ProjectSchema);

export default Project;
