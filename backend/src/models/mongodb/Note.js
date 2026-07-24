const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    appointmentId: { type: Number, required: true },
    patientId: { type: Number, required: true },
    body: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Notes are always read for a set of appointments, newest first.
noteSchema.index({ appointmentId: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
