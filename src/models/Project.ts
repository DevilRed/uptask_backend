import { model, Schema, Document } from "mongoose";

export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
}

const ProjectSchema = new Schema<IProject>(
  {
    projectName: { type: String, required: true },
    clientName: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

const Project = model<IProject>("Project", ProjectSchema);

export default Project;
