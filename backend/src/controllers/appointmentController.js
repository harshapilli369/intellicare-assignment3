const Appointment = require('../models/mongodb/Appointment');
const Patient = require('../models/mongodb/Patient');

const dayBounds = (value) => {
  const date = value ? new Date(value) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const listAppointments = async (req, res, next) => {
  try {
    const { start, end } = dayBounds(req.query.date);

    const appointments = await Appointment.find({
      clinicianId: req.user.id,
      scheduledAt: { $gte: start, $lte: end },
    }).sort({ scheduledAt: 1 });

    // Resolve every patient in one query rather than one per appointment.
    const patients = await Patient.find(
      { patientId: { $in: appointments.map((a) => a.patientId) } },
      { patientId: 1, name: 1 }
    );
    const patientsById = new Map(patients.map((p) => [p.patientId, p]));

    const rows = appointments.map((appointment) => {
      const patient = patientsById.get(appointment.patientId);
      return {
        appointmentId: appointment.appointmentId,
        scheduledAt: appointment.scheduledAt,
        reason: appointment.reason,
        status: appointment.status,
        patient: patient ? { patientId: patient.patientId, name: patient.name } : null,
      };
    });

    res.json({ success: true, date: start, appointments: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { listAppointments };
