import { Document, model, PopulatedDoc, Schema } from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from "./Note";

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
// middleware has to be before the model
ProjectSchema.pre('deleteOne', {document: true}, async function(next) {
  const projectId = this._id;
  if(!projectId) return;
  // get all tasks associated with the project
  const tasks = await Task.find({ project: projectId });
  // delete all notes associated with the task
  for(const task of tasks) {
    await Note.deleteMany({task: task.id});
  }
  await Task.deleteMany({ project: projectId });
  next();
})

const Project = model<IProject>("Project", ProjectSchema);

export default Project;
