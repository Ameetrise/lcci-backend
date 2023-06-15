import mongoose, { Document } from "mongoose";
import { Schema, Types, InferSchemaType } from "mongoose";
export interface ICompany extends Document {
  cName: string;
  cLogo: string;
  owner: Types.ObjectId;
}
const companySchema = new Schema<ICompany>({
  cName: { type: String, required: true },
  cLogo: { type: String, required: false },
  owner: { type: Schema.Types.ObjectId, ref: "User" },
});

export type Company = InferSchemaType<typeof companySchema>;

export default mongoose.model<ICompany>("Company", companySchema);
