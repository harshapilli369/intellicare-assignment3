const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: Number, required: true },
    name: { type: String, required: true },
    sex: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, default: null },
    phone: { type: String, default: null },
    conditions: { type: [String], default: [] },
    medications: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    clinicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

patientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
