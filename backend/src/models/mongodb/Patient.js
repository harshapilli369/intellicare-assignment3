const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: Number, required: true },
    name: { type: String, required: true },
    // Lowercased words of the name. The directory searches this rather than the
    // display name so that an anchored expression can use an index: a
    // case-insensitive search for part of a name cannot.
    nameTokens: { type: [String], default: [] },
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

patientSchema.statics.tokenise = (name) =>
  (name || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

patientSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.nameTokens = this.constructor.tokenise(this.name);
  }
  next();
});

// Supports prefix matching on any word of a patient's name.
patientSchema.index({ nameTokens: 1 });
// The directory lists and sorts by name within a clinician's caseload.
patientSchema.index({ clinicianId: 1, name: 1 });
// Every patient lookup and every appointment join resolves by this id.
patientSchema.index({ patientId: 1 }, { unique: true });

patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

patientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
