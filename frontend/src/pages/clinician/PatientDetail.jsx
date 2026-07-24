import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import TopBar from '../../components/layout/TopBar';
import api from '../../services/api';

const PatientDetail = () => {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get(`/patients/${id}`).then(({ data }) => {
      setPatient(data.patient);
      setHistory(data.history);
    });
  }, [id]);

  const generatePreSummary = async () => {
    const latest = history[0]?.appointment;
    if (!latest) {
      toast.error('This patient has no appointment to summarise.');
      return;
    }

    setGenerating(true);
    try {
      const { data } = await api.post(`/ai/pre-appointment/${latest.appointmentId}`);
      setSummary(data.summary);
      toast.success(data.cached ? 'Loaded existing summary' : 'Summary generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate the summary');
    } finally {
      setGenerating(false);
    }
  };

  if (!patient) {
    return (
      <>
        <TopBar />
        <p className="px-8 pt-8 text-sm text-slate-500">Loading patient record...</p>
      </>
    );
  }

  const lastAppointment = history[0]?.appointment;

  return (
    <>
      <TopBar />

      <div className="grid grid-cols-1 gap-6 px-8 pt-6 lg:grid-cols-2">
        <div>
          <div className="card">
            <h2 className="text-sm font-bold uppercase tracking-wide">Patient Info Card</h2>
            <div className="mt-4 flex justify-between gap-6">
              <div>
                <p className="text-xl font-bold">Name: {patient.name}</p>
                <dl className="mt-2 space-y-0.5 text-sm text-slate-700">
                  <div>SEX: {patient.sex}</div>
                  <div>AGE: {patient.age}</div>
                  <div>ADDRESS: {patient.address}</div>
                  <div>PHONE: {patient.phone}</div>
                </dl>
              </div>
              {lastAppointment && (
                <div className="shrink-0 text-sm">
                  <p className="text-slate-900">Last appointment:</p>
                  <p className="text-slate-700">
                    {format(new Date(lastAppointment.scheduledAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <h2 className="mt-8 text-2xl font-semibold">Medications &amp; Prescriptions</h2>
          <ul className="mt-3 list-disc pl-6 text-slate-800">
            {patient.medications.length ? (
              patient.medications.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li className="list-none pl-0 text-slate-500">None recorded</li>
            )}
          </ul>

          <h2 className="mt-8 text-2xl font-semibold">Medical History</h2>
          <ul className="mt-3 list-disc pl-6 text-slate-800">
            {patient.conditions.length ? (
              patient.conditions.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li className="list-none pl-0 text-slate-500">No significant history</li>
            )}
          </ul>

          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={generatePreSummary}
              disabled={generating}
              className="btn-outline block w-full max-w-sm py-3 text-base disabled:opacity-60"
            >
              {generating ? 'Generating...' : 'Generate Pre-Appointment Notes'}
            </button>
            <button type="button" className="btn-outline block w-full max-w-sm py-3 text-base">
              + Add New Appointment Notes
            </button>
          </div>

          {summary && (
            <div className="card-plain mt-6 whitespace-pre-wrap text-sm leading-relaxed">
              {summary}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="inline-block border-b-2 border-brand pb-1 text-sm font-bold uppercase tracking-wide">
            Previous Appointments
          </h2>

          <div className="mt-5 space-y-5">
            {history.length === 0 && (
              <p className="text-sm text-slate-500">No previous appointments.</p>
            )}
            {history.map(({ appointment }) => (
              <div key={appointment.appointmentId} className="border-b border-brand pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{appointment.reason}</p>
                    <p className="text-sm text-slate-600">
                      {format(new Date(appointment.scheduledAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" className="rounded-md bg-brand-50 px-3 py-1.5 text-xs text-brand">
                      View Appointment Notes
                    </button>
                    <button type="button" className="rounded-md bg-brand-50 px-3 py-1.5 text-xs text-brand">
                      View Post-Appointment Summary
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientDetail;
