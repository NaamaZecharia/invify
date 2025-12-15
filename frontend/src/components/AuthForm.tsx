import { useState } from 'react';

type Props = {
  onSubmit: (data: { username: string; password: string }) => void;
  title: string;
  buttonLabel: string;
};

export default function AuthForm({ onSubmit, title, buttonLabel }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md space-y-4"
    >
      <h2 className="text-2xl font-bold">{title}</h2>

      <div>
        <label className="block mb-1 font-medium">Username</label>
        <input
          type="text"
          className="w-full border border-gray-300 px-3 py-2 rounded-md"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          className="w-full border border-gray-300 px-3 py-2 rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        {buttonLabel}
      </button>
    </form>
  );
}