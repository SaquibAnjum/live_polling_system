import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTeacherToken } from '../store/slices/authSlice';
import { authAPI } from '../services/api';

function TeacherLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token } = await authAPI.teacherLogin(password);
      dispatch(setTeacherToken(token));
      navigate('/teacher/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large max-w-md w-full p-8 border border-white/20">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-primary-light to-primary-dark px-4 py-2 rounded-full flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-semibold">Intervue Poll</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-4">Teacher Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-glow transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none border-2 border-gray-dark/50"
            style={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              boxShadow: loading ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255,255,255,0.1), inset 0 2px 4px rgba(255,255,255,0.1)',
              background: loading ? '#4a5568' : 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)'
            }}
          >
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="mt-4 text-primary-light hover:underline text-sm"
        >
          ← Back to Welcome
        </button>
      </div>
    </div>
  );
}

export default TeacherLogin;


