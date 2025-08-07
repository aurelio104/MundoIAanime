// src/models/Visit.model.ts
import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Visit', visitSchema);
