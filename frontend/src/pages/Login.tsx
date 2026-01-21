import axios from 'axios';
import { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import AlertModal from '../components/AlertModal';
import { useToast } from "../toast/ToastProvider";

export default function Login() {
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleLogin = async ({ username, password }: { username: string; password: string })  => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      const { token } = response.data;

      localStorage.setItem('token', token);
      showToast("Welcome back 👋 Login successful", "success");
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setAlertMessage(err.response.data.message || 'Login failed');
      } else {
        setAlertMessage('Unknown error during login');
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
          <AlertModal
            isOpen={!!alertMessage}
            title="Login failed"
            message={alertMessage ?? ""}
            onClose={() => setAlertMessage(null)}
          />
        </div>
  );
}