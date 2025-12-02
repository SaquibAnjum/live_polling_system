import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createSocket } from '../services/socket';
import { pollAPI } from '../services/api';
import { setSocket, setConnected, addChatMessage, clearChatMessages, setChatMessages } from '../store/slices/socketSlice';
import { setCurrentPoll, setCurrentQuestion, setResults, setParticipants } from '../store/slices/pollSlice';
import Chat from '../components/Chat';

function TeacherDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { teacherToken } = useSelector((state) => state.auth);
  const { currentPoll, currentQuestion, results, participants } = useSelector((state) => state.poll);
  const { socket } = useSelector((state) => state.socket);

  const [pollId, setPollId] = useState(() => {
    const fromQuery = new URLSearchParams(location.search).get('pollId');
    return fromQuery || localStorage.getItem('pollId') || '';
  });
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
  const [timeLimit, setTimeLimit] = useState(60);
  const [showChat, setShowChat] = useState(false);
  const [canStartQuestion, setCanStartQuestion] = useState(true);
  const chatStorageKey = pollId ? `chat_${pollId}` : null;

  // Sync pollId from URL if provided (e.g., returning from history)
  useEffect(() => {
    const fromQuery = new URLSearchParams(location.search).get('pollId');
    if (fromQuery && fromQuery !== pollId) {
      setPollId(fromQuery);
      localStorage.setItem('pollId', fromQuery);
    }
  }, [location.search, pollId]);

  
  useEffect(() => {
    if (!pollId || !teacherToken || !socket) return;

    const restorePoll = async () => {
      try {
        const pollData = await pollAPI.getPoll(pollId);
        dispatch(setCurrentPoll(pollData));
        if (pollData.currentQuestionId) {
          const q = pollData.questions.find(q => q.questionId === pollData.currentQuestionId);
          if (q) {
            dispatch(setCurrentQuestion({
              questionId: q.questionId,
              text: q.text,
              options: q.options.map(o => o.text),
              timeLimit: q.timeLimit,
            }));
            setCanStartQuestion(false);
          }
        }
        socket.emit('teacher_join', { pollId });
      } catch (error) {
        console.error('Error restoring poll:', error);
      }
    };

    restorePoll();
  }, [pollId, teacherToken, socket, dispatch]);

  useEffect(() => {
    if (!teacherToken) {
      navigate('/teacher/login');
      return;
    }

    // Initialize socket
    const newSocket = createSocket(teacherToken);
    dispatch(setSocket(newSocket));

    newSocket.on('connect', () => {
      dispatch(setConnected(true));
      console.log('✅ Connected to server');
    });

    newSocket.on('disconnect', () => {
      dispatch(setConnected(false));
    });

    newSocket.on('chat_message', (data) => {
      dispatch(addChatMessage(data));
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(error.message || 'An error occurred');
    });

    return () => {
      newSocket.disconnect();
      dispatch(clearChatMessages());
    };
  }, [teacherToken, navigate, dispatch]);

  // Load stored chat history for this poll
  useEffect(() => {
    if (!chatStorageKey) return;
    const stored = localStorage.getItem(chatStorageKey);
    if (stored) {
      try {
        dispatch(setChatMessages(JSON.parse(stored)));
      } catch {
        // ignore parse errors
      }
    }
  }, [chatStorageKey, dispatch]);

  useEffect(() => {
    if (!socket) return;

    socket.on('participants_update', (data) => {
      dispatch(setParticipants(data.participants));
    });

    socket.on('result_update', (data) => {
      dispatch(setResults(data));
    });

    socket.on('question_started', (data) => {
      dispatch(setCurrentQuestion({
        questionId: data.questionId,
        text: data.questionText,
        options: data.options,
        timeLimit: data.timeLimit,
      }));
      dispatch(setResults(null)); // Clear previous results
      setCanStartQuestion(false);
    });

    socket.on('question_ended', (data) => {
      dispatch(setResults(data));
      setCanStartQuestion(true);
    });

    return () => {
      socket.off('participants_update');
      socket.off('result_update');
      socket.off('question_started');
      socket.off('question_ended');
      dispatch(clearChatMessages());
    };
  }, [socket, dispatch]);

  const handleCreatePoll = async () => {
    try {
      const { pollId: newPollId } = await pollAPI.createPoll({
        title: 'Live Polling Session',
        options: ['Option 1', 'Option 2'], // Provide at least 2 options as required by API
      });
      setPollId(newPollId);
      localStorage.setItem('pollId', newPollId);
      
      const pollData = await pollAPI.getPoll(newPollId);
      dispatch(setCurrentPoll(pollData));
      
      // Join poll room
      if (socket) {
        socket.emit('teacher_join', { pollId: newPollId });
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleStartQuestion = () => {
    if (!pollId || !questionText.trim()) {
      alert('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      alert('Please add at least 2 options');
      return;
    }

    if (!canStartQuestion) {
      alert('Cannot start new question. Previous question is still active or not all students have answered.');
      return;
    }

    socket?.emit('start_question', {
      pollId,
      question: {
        text: questionText,
        options: validOptions.map(opt => ({ text: opt.text, isCorrect: !!opt.isCorrect })),
        timeLimit,
      },
    });

    // Reset form
    setQuestionText('');
    setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    setCanStartQuestion(false);
  };

  const handleEndQuestion = () => {
    if (!pollId || !currentQuestion) {
      alert('No active question to end.');
      return;
    }
    socket?.emit('end_question', { pollId });
  };

  const handleKick = (targetSocketId) => {
    if (!targetSocketId || !pollId) return;
    socket?.emit('kick_student', { pollId, socketId: targetSocketId });
  };

  if (!pollId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large max-w-2xl w-full p-8 border border-white/20">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-primary-light to-primary-dark px-4 py-2 rounded-full flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <span className="text-white font-semibold">Intervue Poll</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-6">Let's Get Started</h1>
          <p className="text-gray-DEFAULT text-center mb-8">
            you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </p>

          <button
            onClick={handleCreatePoll}
            className="w-full text-white py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-glow transform hover:scale-105 transition-all duration-200 border-2 border-gray-dark/50"
            style={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255,255,255,0.1), inset 0 2px 4px rgba(255,255,255,0.1)',
              background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)'
            }}
          >
            Create New Poll →
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large max-w-6xl mx-auto p-4 sm:p-8 border border-white/20">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-primary-light to-primary-dark px-4 py-2 rounded-full flex items-center gap-2">
              <span className="text-white font-semibold">+ Intervue Poll</span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/teacher/history/${pollId}`)}
            className="flex items-center gap-2 text-primary-light hover:underline"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Poll history
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-4">Let's Get Started</h1>
        <p className="text-gray-DEFAULT mb-8">
          you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
        </p>

        {/* Question Form */}
        <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <label className="block text-sm font-medium">Enter your question</label>
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light w-full sm:w-auto"
          >
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={90}>90 seconds</option>
            <option value={120}>120 seconds</option>
          </select>
        </div>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light h-24 resize-none"
            placeholder="Enter your question here..."
          />
          <div className="text-right text-xs text-gray-DEFAULT mt-1">
            {questionText.length}/100
          </div>
        </div>

        {/* Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Edit Options</h3>
          {options.map((option, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center font-bold flex-shrink-0">
                {index + 1}
              </div>
              <input
                type="text"
                value={option.text}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index].text = e.target.value;
                  setOptions(newOptions);
                }}
                className="flex-1 px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                placeholder={`Option ${index + 1}`}
              />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <span className="text-sm font-medium">Is it Correct?</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={option.isCorrect}
                      onChange={() => {
                        const newOptions = [...options];
                        newOptions[index].isCorrect = true;
                        setOptions(newOptions);
                      }}
                      className="w-4 h-4 text-primary-light"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={!option.isCorrect}
                      onChange={() => {
                        const newOptions = [...options];
                        newOptions[index].isCorrect = false;
                        setOptions(newOptions);
                      }}
                      className="w-4 h-4 text-primary-light"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>
              {options.length > 2 && (
                <button
                  onClick={() => handleRemoveOption(index)}
                  className="text-red-500 hover:text-red-700 self-start sm:self-center"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button
              onClick={handleAddOption}
              className="text-primary-light border border-primary-light px-4 py-2 rounded-lg hover:bg-primary-light hover:text-white transition-colors"
            >
              + Add More option
            </button>
          )}
        </div>

        {/* Current Question Display */}
        {currentQuestion && (
          <div className="mb-8 p-6 bg-gradient-to-r from-primary-light/10 to-secondary-light/10 rounded-xl border border-primary-light/20">
            <h3 className="text-xl font-bold mb-4">Current Question</h3>
            <p className="text-lg mb-4">{currentQuestion.text}</p>
            <div className="space-y-2">
              {currentQuestion.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-light text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="mb-8 p-6 bg-gradient-to-r from-success-light/10 to-primary-light/10 rounded-xl border border-success-light/20">
            <h3 className="text-xl font-bold mb-4">Live Results</h3>
            <div className="space-y-3">
              {currentQuestion?.options?.map((opt, idx) => {
                const percentage = results.percentages?.[idx] || 0;
                const count = results.counts?.[idx] || 0;
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{opt}</span>
                        <span className="text-sm text-gray-DEFAULT">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-light rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-primary-light h-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-gray-DEFAULT">
              Total responses: {results.total || 0}
            </p>
          </div>
        )}

        {/* Share Link */}
        <div className="mb-6 p-6 bg-gradient-to-r from-primary-light/10 to-secondary-light/10 rounded-xl border border-primary-light/20">
          <h3 className="text-lg font-semibold mb-2">Share Poll Link</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/student/join?pollId=${pollId}`}
              className="w-full px-4 py-2 bg-white border border-gray-light rounded-lg text-sm"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/student/join?pollId=${pollId}`);
                alert('Link copied to clipboard!');
              }}
              className="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto text-center"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Participants */}
        {participants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Participants ({participants.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {participants.map((p) => (
                <div key={p.socketId} className="flex items-center justify-between px-3 py-2 bg-gray-light rounded-lg text-sm">
                  <span>{p.name}</span>
                  <button
                    onClick={() => handleKick(p.socketId)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Kick
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ask Question Button */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          {!canStartQuestion && (
            <button
              onClick={handleEndQuestion}
              className="text-gray-800 px-6 py-4 rounded-xl font-semibold border-2 border-primary-light/60 hover:bg-primary-light hover:text-white transition-all duration-200 w-full sm:w-auto"
            >
              End Question
            </button>
          )}
          <button
            onClick={handleStartQuestion}
            disabled={!canStartQuestion}
            className="text-white px-10 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-glow transform hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:transform-none border-2 border-gray-dark/50 w-full sm:w-auto text-center"
            style={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              boxShadow: !canStartQuestion ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255,255,255,0.1), inset 0 2px 4px rgba(255,255,255,0.1)',
              background: !canStartQuestion ? '#4a5568' : 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)'
            }}
          >
            Ask Question →
          </button>
        </div>
      </div>

      {/* Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-200 z-40 border-2 border-white"
        style={{ background: '#7765DA', boxShadow: '0 0 0 3px rgba(255,255,255,0.85), 0 12px 28px rgba(0,0,0,0.35)' }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {showChat && <Chat pollId={pollId} role="teacher" />}
    </div>
  );
}

export default TeacherDashboard;
