import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

import TopBar from '../../components/layout/TopBar';
import api from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => setStats(data.stats));
    api.get('/dashboard/upcoming').then(({ data }) => setUpcoming(data.upcoming));
    api.get('/appointments').then(({ data }) => setAppointments(data.appointments));
  }, []);

  return (
    <>
      <TopBar />

      <div className="grid grid-cols-1 gap-6 px-8 pt-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card-plain">
            <div className="grid grid-cols-2 gap-y-8">
              <div>
                <p className="text-3xl font-semibold">{stats?.appointmentsToday ?? '-'}</p>
                <p className="mt-1 text-sm text-slate-700">Appointments</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">{stats?.writeupsToApprove ?? '-'}</p>
                <p className="mt-1 text-sm text-slate-700">Writeups to Approve</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">{stats?.pendingReports ?? '-'}</p>
                <p className="mt-1 text-sm text-slate-700">Pending Report</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">{stats?.totalPatients ?? '-'}</p>
                <p className="mt-1 text-sm text-slate-700">Total Patients</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Patient List</h2>
              <span className="text-sm text-slate-600">Today</span>
            </div>

            <div className="mt-5 space-y-5">
              {appointments.length === 0 && (
                <p className="text-sm text-slate-500">No appointments scheduled today.</p>
              )}
              {appointments.map((appointment) => (
                <div key={appointment.appointmentId} className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{appointment.patient?.name}</p>
                    <p className="text-sm text-brand">{appointment.reason}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="pill">{format(new Date(appointment.scheduledAt), 'h:mm a')}</span>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => navigate(`/patients/${appointment.patient?.patientId}`)}
                    >
                      view info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-sm font-bold uppercase tracking-wide">Upcoming Appointment</h2>
            {upcoming ? (
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold">{upcoming.patient?.name}</p>
                  <p className="text-sm text-brand">{upcoming.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="pill">{format(new Date(upcoming.scheduledAt), 'h:mm a')}</span>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate(`/patients/${upcoming.patient?.patientId}`)}
                  >
                    view info
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">Nothing scheduled.</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold">Calendar</h2>
            <div className="mt-4">
              <DatePicker selected={calendarDate} onChange={setCalendarDate} inline />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
