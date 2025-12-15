import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import api from '../utils/api';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = async (data: { username: string; password: string }) => {
    try {
      const response = await api.post('/auth/register', data);

      localStorage.setItem('token', response.data.token);

      navigate('/');
    } catch (err) {
      console.error('Registration failed', err);
      if (axios.isAxiosError(err) && err.response) {
        alert('Registration failed: ' + err.response.data.message);
     } else {
        alert('Registration failed: Unknown error');
     }
    }
  };

  return (
    <div className="mt-10">
      <AuthForm
        title="Register"
        buttonLabel="Sign Up"
        onSubmit={handleRegister}
      />
    </div>
  );
}