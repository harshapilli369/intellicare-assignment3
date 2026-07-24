const Appointment = require('../models/mongodb/Appointment');
const Patient = require('../models/mongodb/Patient');
const AISummary = require('../models/mongodb/AISummary');

const getStats = async (req, res, next) => {
  try {
    const clinicianId = req.user.id;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const appointmentsToday = await Appointment.countDocuments({
      clinicianId,
      scheduledAt: { $gte: start, $lte: end },
    });

    const writeupsToApprove = await AISummary.countDocuments({ finalized: false });

    const pendingReports = await Appointment.countDocuments({
      clinicianId,
      status: 'completed',
      scheduledAt: { $lt: start },
    });

    const totalPatients = await Patient.countDocuments({ clinicianId });

    res.json({
      success: true,
      stats: { appointmentsToday, writeupsToApprove, pendingReports, totalPatients },
    });
  } catch (err) {
    next(err);
  }
};

const getUpcoming = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      clinicianId: req.user.id,
      scheduledAt: { $gte: new Date() },
      status: 'scheduled',
    }).sort({ scheduledAt: 1 });

    if (!appointment) return res.json({ success: true, upcoming: null });

    const patient = await Patient.findOne({ patientId: appointment.patientId });

    res.json({
      success: true,
      upcoming: {
        appointmentId: appointment.appointmentId,
        scheduledAt: appointment.scheduledAt,
        reason: appointment.reason,
        patient: patient ? { patientId: patient.patientId, name: patient.name } : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getUpcoming };
