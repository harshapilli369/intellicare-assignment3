const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: Number, required: true },
    patientId: { type: Number, required: true },
    clinicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

// The patient record reads a patient's visits newest first.
appointmentSchema.index({ patientId: 1, scheduledAt: -1 });
// The day view and the dashboard read a clinician's schedule by date.
appointmentSchema.index({ clinicianId: 1, scheduledAt: 1 });
// The dashboard counts past appointments of a given status. Without status in
// the index the count matches on date alone and then has to read every
// candidate document to test it, which is slower than not using an index here.
appointmentSchema.index({ clinicianId: 1, status: 1, scheduledAt: 1 });
// Notes and AI summaries are resolved by this id.
appointmentSchema.index({ appointmentId: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
