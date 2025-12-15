import axios from 'axios';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async ({ username, password }: { username: string; password: string })  => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      const { token } = response.data;

      localStorage.setItem('token', token);

      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        alert(err.response.data.message || 'Login failed');
      } else {
        alert('Unknown error during login');
      }
    }
  };

  return (
        <div className="mt-10">
          <AuthForm
            title="Login"
            buttonLabel="Log In"
            onSubmit={handleLogin}
          />
        </div>
  );
}