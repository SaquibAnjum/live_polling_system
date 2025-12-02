import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { pollAPI } from '../services/api';

function PollHistory() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { teacherToken } = useSelector((state) => state.auth);
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherToken) {
      navigate('/teacher/login');
      return;
    }

    const fetchPoll = async () => {
      try {
        const pollData = await pollAPI.getPoll(pollId);
        setPoll(pollData);
      } catch (error) {
        console.error('Error fetching poll:', error);
      } finally {
        setLoading(false);
      }
    };

    if (pollId && teacherToken) {
      fetchPoll();
    }
  }, [pollId, teacherToken, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Poll not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large max-w-4xl mx-auto p-8 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">View Poll History</h1>
          <button
            onClick={() => navigate(`/teacher/dashboard?pollId=${pollId}`)}
            className="text-primary-light hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="space-y-8">
          {poll.questions && poll.questions.length > 0 ? (
            poll.questions.map((question, qIndex) => {
              const total = question.studentAnswers?.length || 0;
              const percentages = {};
              question.options?.forEach((opt, idx) => {
                percentages[idx] = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
              });

              return (
                <div key={question.questionId} className="border-2 border-dashed border-primary-light/50 bg-gradient-to-r from-primary-light/5 to-secondary-light/5 p-6 rounded-xl mb-4">
                  <h2 className="text-2xl font-bold mb-4">Question {qIndex + 1}</h2>
                  <p className="text-lg mb-6 font-semibold">{question.text}</p>
                  
                  <div className="space-y-3">
                    {question.options?.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{opt.text}</span>
                            <span className="text-sm text-gray-DEFAULT">{percentages[idx]}%</span>
                          </div>
                          <div className="w-full bg-gray-light rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-primary-light h-full transition-all duration-300"
                              style={{ width: `${percentages[idx]}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-DEFAULT text-center py-8">No questions asked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PollHistory;
