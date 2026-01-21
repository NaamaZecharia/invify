import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthForm from '../components/AuthForm';
import api from '../utils/api';
import axios from 'axios';
import AlertModal from '../components/AlertModal';

export default function Register() {
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleRegister = async (data: { username: string; password: string }) => {
    try {
      const response = await api.post('/auth/register', data);

      localStorage.setItem('token', response.data.token);

      navigate('/');
    } catch (err) {
      console.error('Registration failed', err);
      if (axios.isAxiosError(err) && err.response) {
        setAlertMessage('Registration failed: ' + err.response.data.message);
     } else {
        setAlertMessage('Registration failed: Unknown error');
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
      <AlertModal
      isOpen={!!alertMessage}
      title="Register failed"
      message={alertMessage ?? ""}
      onClose={() => setAlertMessage(null)}
    />
    </div>
  );
}