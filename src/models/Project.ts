import { model, Schema } from "mongoose";

type ProjectType = {
  projectName: string;
  clientName: string;
  description: string;
};

const ProjectSchema = new Schema<ProjectType>(
  {
    projectName: { type: String, required: true },
    clientName: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

const Project = model<ProjectType>("Project", ProjectSchema);

export default Project;
