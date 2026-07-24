const aiService = require('../services/aiService');
const Patient = require('../models/mongodb/Patient');
const Appointment = require('../models/mongodb/Appointment');
const Note = require('../models/mongodb/Note');

const buildContext = async (appointmentId) => {
  const appointment = await Appointment.findOne({ appointmentId });
  if (!appointment) return null;

  const patient = await Patient.findOne({ patientId: appointment.patientId });
  if (!patient) return null;

  const earlier = await Appointment.find({
    patientId: patient.patientId,
    scheduledAt: { $lt: appointment.scheduledAt },
  })
    .sort({ scheduledAt: -1 })
    .limit(5);

  const previousNotes = [];
  for (const visit of earlier) {
    const notes = await Note.find({ appointmentId: visit.appointmentId });
    notes.forEach((note) => previousNotes.push(note.body));
  }

  return {
    patientId: patient.patientId,
    patientName: patient.name,
    sex: patient.sex,
    dateOfBirth: patient.dateOfBirth,
    medicalHistory: patient.conditions,
    medications: patient.medications,
    allergies: patient.allergies,
    previousNotes,
    appointmentReason: appointment.reason,
  };
};

const generatePreSummary = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const context = await buildContext(Number(appointmentId));
    if (!context) return res.status(404).json({ message: 'Appointment not found' });

    const result = await aiService.generatePreSummary({
      patientId: context.patientId,
      appointmentId: Number(appointmentId),
      context,
    });

    res.json({ success: true, summary: result.summary, cached: result.cached });
  } catch (err) {
    next(err);
  }
};

const generatePostSummary = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const base = await buildContext(Number(appointmentId));
    if (!base) return res.status(404).json({ message: 'Appointment not found' });

    const context = { ...base, clinicianNotes: req.body.clinicianNotes || '' };

    const result = await aiService.generatePostSummary({
      patientId: context.patientId,
      appointmentId: Number(appointmentId),
      context,
    });

    res.json({
      success: true,
      clinicianSummary: result.clinicianSummary,
      patientSummary: result.patientSummary,
      cached: result.cached,
    });
  } catch (err) {
    next(err);
  }
};

const getSummaryByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const summary = await aiService.getSummaryByAppointment(Number(appointmentId));
    if (!summary) return res.status(404).json({ message: 'No summary found for this appointment' });
    res.json({ success: true, summary });
  } catch (err) {
    next(err);
  }
};

const finalizeSummary = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const edits = req.body;
    const summary = await aiService.finalizeSummary(Number(appointmentId), edits);
    res.json({ success: true, summary });
  } catch (err) {
    next(err);
  }
};

const getPatientSummaries = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const summaries = await aiService.getPatientSummaries(Number(patientId));
    res.json({ success: true, summaries });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generatePreSummary,
  generatePostSummary,
  getSummaryByAppointment,
  finalizeSummary,
  getPatientSummaries,
};
