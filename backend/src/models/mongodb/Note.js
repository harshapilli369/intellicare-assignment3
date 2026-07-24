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

module.exports = mongoose.model('Note', noteSchema);
