import { FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const initials = (name) =>
  (name || '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

const TopBar = ({ placeholder = 'Search', value, onChange }) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center gap-4 px-8 pt-6">
      <div className="relative flex-1">
        <input
          type="text"
          value={value ?? ''}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-6 pr-12 text-sm outline-none focus:border-brand"
        />
        <FiSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
      </div>

      <button
        type="button"
        onClick={logout}
        title="Sign out"
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2.5 pl-2.5 pr-5"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand">
          {initials(user?.name)}
        </span>
        <span className="text-sm font-medium text-slate-800">
          {user?.title === 'Physician' ? `Dr. ${user.name.split(' ').pop()}` : user?.name}
        </span>
      </button>
    </div>
  );
};

export default TopBar;
