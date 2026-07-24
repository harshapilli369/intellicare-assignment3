import Sidebar from './Sidebar';

const AppLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="flex-1 pb-10">{children}</main>
  </div>
);

export default AppLayout;
