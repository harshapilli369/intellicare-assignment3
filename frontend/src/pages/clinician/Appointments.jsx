import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import TopBar from '../../components/layout/TopBar';
import api from '../../services/api';

const Appointments = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [generatingId, setGeneratingId] = useState(null);

  useEffect(() => {
    api.get('/appointments').then(({ data }) => setAppointments(data.appointments));
  }, []);

  const generate = async (appointmentId) => {
    setGeneratingId(appointmentId);
    try {
      const { data } = await api.post(`/ai/pre-appointment/${appointmentId}`);
      toast.success(data.cached ? 'Loaded existing summary' : 'Summary generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate the summary');
    } finally {
      setGeneratingId(null);
    }
  };

  const visible = appointments.filter((appointment) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      appointment.patient?.name.toLowerCase().includes(term) ||
      format(new Date(appointment.scheduledAt), 'h:mm a').toLowerCase().includes(term)
    );
  });

  return (
    <>
      <TopBar placeholder="Search Patient Name or Time" value={search} onChange={setSearch} />

      <div className="px-8 pt-8">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <p className="mt-1 text-sm text-slate-600">{format(new Date(), 'MMMM d, yyyy')}</p>

        <div className="mt-6 space-y-5">
          {visible.length === 0 && (
            <p className="text-sm text-slate-500">No appointments for this day.</p>
          )}

          {visible.map((appointment) => (
            <div
              key={appointment.appointmentId}
              className="flex flex-wrap items-center gap-6 rounded-lg bg-white px-6 py-5"
            >
              <span className="rounded-md bg-brand-50 px-5 py-3 font-medium text-slate-800">
                {format(new Date(appointment.scheduledAt), 'h:mm a')}
              </span>

              <div className="min-w-[10rem] flex-1">
                <p className="text-lg font-semibold">{appointment.patient?.name}</p>
                <p className="text-sm text-slate-600">{appointment.reason}</p>
              </div>

              <button
                type="button"
                className="btn-primary px-6 py-3"
                onClick={() => navigate(`/patients/${appointment.patient?.patientId}`)}
              >
                view info
              </button>

              <button
                type="button"
                disabled={generatingId === appointment.appointmentId}
                onClick={() => generate(appointment.appointmentId)}
                className="btn-outline px-6 py-3 text-base disabled:opacity-60"
              >
                {generatingId === appointment.appointmentId
                  ? 'Generating...'
                  : 'Generate Pre-Appointment Notes'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Appointments;
