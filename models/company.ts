import mongoose, { Document } from "mongoose";
import { Schema, Types, InferSchemaType } from "mongoose";
export interface ICompany extends Document {
  cName: string;
  cLogo: string | null;
  facebook: string;
  website: string;
  phone: string;
  category: string;
  address: string;
  time: string;
  email: string;
  description: string;
  owner: Types.ObjectId;
  imageGallery: Types.ObjectId[];
}
const companySchema = new Schema<ICompany>({
  cName: { type: String, required: true },
  cLogo: { type: String, required: false },
  facebook: { type: String, required: false },
  website: { type: String, required: false },
  phone: { type: String, required: false },
  category: { type: String, required: false },
  address: { type: String, required: false },
  time: { type: String, required: false },
  email: { type: String, required: false },
  description: { type: String, required: false },
  imageGallery: [{ type: String, required: false }],
  owner: { type: Schema.Types.ObjectId, ref: "User" },
});

export type CompanyType = InferSchemaType<typeof companySchema>;

export default mongoose.model<ICompany>("Company", companySchema);
