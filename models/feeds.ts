import mongoose from "mongoose";
import { Schema, Types, InferSchemaType } from "mongoose";
interface IFeeds {
  title: string;
  description: string;
  createdAt: string;
  newsImage: string;
  author: Types.ObjectId;
  timestamps: true;
}
const feedSchema = new Schema<IFeeds>({
  title: { type: String, required: true },
  description: { type: String, required: false },
  createdAt: { type: String, required: false },
  newsImage: { type: String, required: false },
  author: { type: Schema.Types.ObjectId, ref: "User" },
});

export type Feed = InferSchemaType<typeof feedSchema>;

export default mongoose.model<IFeeds>("Feed", feedSchema);
