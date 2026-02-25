import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-base-300 border-b border-base-content/10 px-4 min-h-12 h-12">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost btn-sm text-lg font-bold">
          Timllo
        </Link>
      </div>
      <div className="navbar-center">
        <div className="form-control">
          <input
            type="text"
            placeholder="Search..."
            className="input input-sm input-bordered w-64 bg-base-200"
          />
        </div>
      </div>
      <div className="navbar-end">
        <Link to="/" className="btn btn-primary btn-sm mr-2">
          Create
        </Link>
        {user && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar btn-sm">
              <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-300 rounded-box z-50 w-52 p-2 shadow mt-2">
              <li className="menu-title text-xs px-2 py-1">{user.email}</li>
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
