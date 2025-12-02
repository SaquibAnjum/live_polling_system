import { useNavigate } from 'react-router-dom';

function StudentKicked() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large max-w-md w-full p-8 text-center border border-white/20">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-primary-light to-primary-dark px-4 py-2 rounded-full flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-semibold">Intervue Poll</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">You've been Kicked out!</h1>
        <p className="text-gray-DEFAULT mb-6">
          Looks like the teacher had removed you from the poll system. Please Try again sometime.
        </p>
        <button
          onClick={() => navigate('/')}
          className="text-white px-10 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-glow transform hover:scale-110 transition-all duration-200 border-2 border-gray-dark/50"
          style={{ 
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255,255,255,0.1), inset 0 2px 4px rgba(255,255,255,0.1)',
            background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)'
          }}
        >
          Go to Home →
        </button>
      </div>
    </div>
  );
}

export default StudentKicked;


