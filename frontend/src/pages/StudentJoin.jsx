import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setStudentName } from '../store/slices/socketSlice';

function StudentJoin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const pollIdFromUrl = searchParams.get('pollId');
  const [name, setName] = useState('');
  const [pollId, setPollId] = useState(pollIdFromUrl || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    let finalPollId = pollId.trim();
    
    // Extract poll ID from URL if user pasted the full link
    if (finalPollId.includes('pollId=')) {
      const match = finalPollId.match(/pollId=([^&?]+)/);
      if (match) {
        finalPollId = match[1];
      }
    }
    
    // Remove any URL parts if user pasted full URL
    if (finalPollId.includes('http://') || finalPollId.includes('https://') || finalPollId.includes('localhost')) {
      // Try to extract just the ID part
      const parts = finalPollId.split('/');
      finalPollId = parts[parts.length - 1].split('?')[0].split('&')[0];
    }
    
    // Clean up: remove any query parameters or fragments
    finalPollId = finalPollId.split('?')[0].split('&')[0].split('#')[0].trim();
    
    if (!finalPollId) {
      setError('Poll ID is required. Please enter only the Poll ID (e.g., 692add7fe6297f3944825a02)');
      return;
    }

    
    if (!/^[a-f0-9]{24}$/i.test(finalPollId)) {
      setError('Invalid Poll ID format. Please enter a valid Poll ID from your teacher.');
      return;
    }

    dispatch(setStudentName(name.trim()));
    navigate(`/student/poll/${finalPollId}?name=${encodeURIComponent(name.trim())}`);
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

        <h1 className="text-3xl font-bold text-center mb-4">Let's Get Started</h1>
        <p className="text-gray-DEFAULT text-center mb-6">
          If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Enter your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              placeholder="Rahul Bajaj"
              required
            />
            <div className="text-right text-xs text-gray-DEFAULT mt-1">
              {name.length}/100
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {!pollId && (
            <div className="mb-4">
              <div className="text-yellow-600 text-sm bg-yellow-50 p-3 rounded mb-3">
                <strong>Poll ID is required.</strong> Please enter it below or use the link from your teacher.
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Enter Poll ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={pollId}
                  onChange={(e) => {
                    setPollId(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                  placeholder="692add7fe6297f3944825a02"
                  required
                />
                <p className="text-xs text-gray-DEFAULT mt-1">
                  Enter only the Poll ID (24 characters), not the full URL
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!pollId}
            className="w-full text-white py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-glow transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none border-2 border-gray-dark/50"
            style={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              boxShadow: !pollId ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255,255,255,0.1), inset 0 2px 4px rgba(255,255,255,0.1)',
              background: !pollId ? '#4a5568' : 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)'
            }}
          >
            Continue →
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

export default StudentJoin;


