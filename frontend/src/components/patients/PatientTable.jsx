import { memo } from 'react';
import { useTable } from 'react-table';

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

// Memoised, and deliberately given only the rows and a stable callback. The
// search field lives in the parent, so without this every keystroke would
// re-render all twenty rows even though the results have not changed.
const PatientTable = memo(({ patients, onView }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: patients,
  });

  return (
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
                  onClick={() => onView(row.original.patientId)}
                >
                  view info
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});

PatientTable.displayName = 'PatientTable';

export default PatientTable;
