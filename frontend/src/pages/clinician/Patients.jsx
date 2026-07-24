import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../../components/layout/TopBar';
import PatientTable from '../../components/patients/PatientTable';
import useDebounce from '../../hooks/useDebounce';
import { cachedGet } from '../../services/apiCache';

const PAGE_SIZE = 20;

const Patients = () => {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // The field updates on every keystroke so typing stays responsive, but the
  // request waits until typing pauses.
  const search = useDebounce(searchInput, 300);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    cachedGet('/patients', { search, page, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setPatients(data.patients);
        setTotal(data.total);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // A slow earlier response must not overwrite a newer one.
    return () => {
      cancelled = true;
    };
  }, [search, page]);

  const handleSearch = useCallback((value) => {
    setPage(1);
    setSearchInput(value);
  }, []);

  const handleView = useCallback(
    (patientId) => navigate(`/patients/${patientId}`),
    [navigate]
  );

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <TopBar placeholder="Search Patient Name" value={searchInput} onChange={handleSearch} />

      <div className="px-8 pt-8">
        <h1 className="text-2xl font-bold">Patients</h1>
        <p className="mt-1 text-sm text-slate-600">
          {total.toLocaleString()} records{loading ? ' - loading...' : ''}
        </p>

        <div className="card-plain mt-6 overflow-x-auto">
          <PatientTable patients={patients} onView={handleView} />

          {patients.length === 0 && !loading && (
            <p className="py-6 text-center text-sm text-slate-500">No patients matched.</p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="btn-outline disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-slate-600">
            Page {page} of {lastPage.toLocaleString()}
          </span>
          <button
            type="button"
            disabled={page >= lastPage}
            onClick={() => setPage((current) => current + 1)}
            className="btn-outline disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default Patients;
