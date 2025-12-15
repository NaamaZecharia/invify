import { Link, useNavigate } from 'react-router-dom';
import { isLoggedIn, logout } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();

   const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md">
      <ul className="flex space-x-6 text-lg font-medium">
        <li>
          <Link to="/" className="hover:text-yellow-300 transition">
            Home
          </Link>
        </li>
        <li>
          <Link to="/add" className="hover:text-yellow-300 transition">
            Add Task
          </Link>
        </li>
        <li>
          <Link to="/about" className="hover:text-yellow-300 transition">
            About
          </Link>
        </li>
        {!isLoggedIn() ? (
          <>
            <li><Link to="/register" className="hover:text-yellow-300">Register</Link></li>
            <li><Link to="/login" className="hover:text-yellow-300">Login</Link></li>
          </>
        ) : (
          <li>
            <button onClick={handleLogout} className="hover:text-yellow-300">
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}