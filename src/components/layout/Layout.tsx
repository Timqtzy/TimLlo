import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.js';
import Sidebar from './Sidebar.js';

export default function Layout() {
  const location = useLocation();
  const isBoardPage = location.pathname.startsWith('/board/');

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar />
      <div className="flex-1 flex">
        {!isBoardPage && <Sidebar />}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
