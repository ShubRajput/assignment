import mongoose from 'mongoose';

const { Schema } = mongoose;

const roleSchema = new Schema({
  name: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
