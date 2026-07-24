import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/patients', label: 'Patients' },
  { to: '/appointments', label: 'Appointments' },
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="px-6 pb-6 pt-7">
        <p className="text-2xl font-bold text-brand">IntelliCare</p>
        <p className="mt-1 text-xs text-slate-600">{user?.name}</p>
        <p className="text-[11px] text-slate-500">{user?.title || user?.role}</p>
      </div>

      <nav className="flex flex-col">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-6 py-2.5 text-sm transition ${
                isActive ? 'bg-brand-50 font-semibold text-brand' : 'text-slate-800 hover:bg-slate-50'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
