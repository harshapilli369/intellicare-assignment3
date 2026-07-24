import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';

import TopBar from '../../components/layout/TopBar';
import api from '../../services/api';

const PAGE_SIZE = 20;

const columns = [
  { Header: 'Name', accessor: 'name' },
  { Header: 'Sex', accessor: 'sex' },
  { Header: 'Phone', accessor: 'phone' },
  {
    Header: 'Conditions',
    accessor: 'conditions',
    Cell: ({ value }) => (value?.length ? value.join(', ') : '-'),
  },
];

const Patients = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('/patients', { params: { search, page, limit: PAGE_SIZE } })
      .then(({ data }) => {
        setPatients(data.patients);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: patients,
  });

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <TopBar
        placeholder="Search Patient Name"
        value={search}
        onChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
      />

      <div className="px-8 pt-8">
        <h1 className="text-2xl font-bold">Patients</h1>
        <p className="mt-1 text-sm text-slate-600">
          {total.toLocaleString()} records{loading ? ' - loading...' : ''}
        </p>

        <div className="card-plain mt-6 overflow-x-auto">
          <table {...getTableProps()} className="w-full text-left text-sm">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()} className="border-b border-slate-200">
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()} className="pb-3 font-semibold text-slate-700">
                      {column.render('Header')}
                    </th>
                  ))}
                  <th className="pb-3" />
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="border-b border-slate-100 last:border-0">
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} className="py-3 pr-4">
                        {cell.render('Cell')}
                      </td>
                    ))}
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => navigate(`/patients/${row.original.patientId}`)}
                      >
                        view info
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {rows.length === 0 && !loading && (
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
