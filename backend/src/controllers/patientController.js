const Patient = require('../models/mongodb/Patient');
const Appointment = require('../models/mongodb/Appointment');
const Note = require('../models/mongodb/Note');

// A search term goes into a regular expression, so anything that carries
// meaning there has to be escaped first. Otherwise a term like ".*" turns the
// query into a full scan again.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listPatients = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { search } = req.query;

    const filter = { clinicianId: req.user.id };
    if (search) {
      // Anchored, against lowercased tokens, so the index can be used. Each
      // word of the term must prefix-match some word of the name, so both
      // "holl" and "aaron ab" behave the way a user typing a name expects.
      const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
      if (terms.length) {
        filter.$and = terms.map((term) => ({
          nameTokens: { $regex: `^${escapeRegex(term)}` },
        }));
      }
    }

    const total = await Patient.countDocuments(filter);
    const patients = await Patient.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, total, page, limit, patients });
  } catch (err) {
    next(err);
  }
};

const getPatient = async (req, res, next) => {
  try {
    const patientId = Number(req.params.id);

    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const appointments = await Appointment.find({ patientId }).sort({ scheduledAt: -1 });

    // Fetch every note for these appointments in one query and group them here.
    // Reading them per appointment meant a round trip for each visit, so a
    // patient with a long history cost as many round trips as they had visits.
    const notes = await Note.find({
      appointmentId: { $in: appointments.map((a) => a.appointmentId) },
    }).sort({ createdAt: -1 });

    const notesByAppointment = new Map();
    for (const note of notes) {
      const existing = notesByAppointment.get(note.appointmentId);
      if (existing) existing.push(note);
      else notesByAppointment.set(note.appointmentId, [note]);
    }

    const history = appointments.map((appointment) => ({
      appointment,
      notes: notesByAppointment.get(appointment.appointmentId) || [],
    }));

    res.json({ success: true, patient, history });
  } catch (err) {
    next(err);
  }
};

module.exports = { listPatients, getPatient };
