import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Welcome() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');

  const handleContinue = () => {
    if (selectedRole === 'teacher') {
      navigate('/teacher/login');
    } else {
      navigate('/student/join');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-0" style={{ pointerEvents: 'auto' }}>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large max-w-4xl w-full p-8 md:p-12 border border-white/20 relative z-10" style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-primary-light to-primary-dark px-4 py-2 rounded-full flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-semibold">Intervue Poll</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Welcome to the Live Polling System
        </h1>
        <p className="text-gray-DEFAULT text-center mb-8 text-lg">
          Please select the role that best describes you to begin using the live polling system
        </p>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10" style={{ pointerEvents: 'auto' }}>
          {/* Student Card */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRole('student');
            }}
            className={`p-8 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 hover:shadow-glow relative z-50 select-none ${
              selectedRole === 'student'
                ? 'border-primary-DEFAULT bg-gradient-to-br from-primary-light/20 to-secondary-light/20 shadow-glow'
                : 'border-gray-light bg-white/80 hover:border-primary-light/50'
            }`}
            style={{ pointerEvents: 'auto', userSelect: 'none' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedRole('student');
              }
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'student' ? 'bg-primary-DEFAULT text-white' : 'bg-gray-light text-gray-DEFAULT'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">I'm a Student</h3>
            </div>
            <p className="text-gray-DEFAULT text-sm leading-relaxed">
              Submit answers and view live poll results in real-time. See how your responses compare with your classmates.
            </p>
          </div>

          {/* Teacher Card */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRole('teacher');
            }}
            className={`p-8 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 hover:shadow-glow relative z-50 select-none ${
              selectedRole === 'teacher'
                ? 'border-primary-DEFAULT bg-gradient-to-br from-primary-light/20 to-secondary-light/20 shadow-glow'
                : 'border-gray-light bg-white/80 hover:border-primary-light/50'
            }`}
            style={{ pointerEvents: 'auto', userSelect: 'none' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedRole('teacher');
              }
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'teacher' ? 'bg-primary-DEFAULT text-white' : 'bg-gray-light text-gray-DEFAULT'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">I'm a Teacher</h3>
            </div>
            <p className="text-gray-DEFAULT text-sm leading-relaxed">
              Create and manage polls, ask questions, and monitor your students' responses in real-time.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleContinue();
            }}
            className="bg-gradient-to-r from-gray-dark via-gray-DEFAULT to-gray-dark text-white px-16 py-4 rounded-xl font-bold text-xl shadow-2xl hover:shadow-glow transform hover:scale-110 transition-all duration-200 relative z-50 cursor-pointer select-none active:scale-100 border-2 border-gray-dark/50"
            style={{ 
              pointerEvents: 'auto',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255,255,255,0.1), inset 0 2px 4px rgba(255,255,255,0.1)',
              background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)'
            }}
            type="button"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome;

