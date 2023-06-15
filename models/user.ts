import mongoose, { Document } from "mongoose";
import { Schema, Types, InferSchemaType } from "mongoose";
export interface IUser extends Document {
  name: string;
  userName: string;
  password?: string;
  phone: string;
  email: string;
  userRole: string;
  userImage: string;
  isActive: boolean;
  company?: Types.ObjectId[];
}
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  userName: { type: String, unique: true, required: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  email: { type: String, required: false },
  userRole: { type: String, required: true },
  userImage: { type: String, required: false },
  isActive: { type: Boolean, required: true },
  company: [{ type: Types.ObjectId, required: false, ref: "Company" }],
});

export default mongoose.model<IUser>("User", userSchema);
