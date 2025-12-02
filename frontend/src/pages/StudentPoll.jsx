import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createSocket } from '../services/socket';
import { setSocket, setConnected, setTimeLeft, setHasAnswered, setKickedOut, resetSocket, addChatMessage, clearChatMessages, setChatMessages } from '../store/slices/socketSlice';
import { setCurrentQuestion, setResults, clearPoll } from '../store/slices/pollSlice';
import Chat from '../components/Chat';

function StudentPoll() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pollId } = useParams();
  const [searchParams] = useSearchParams();
  const studentName = searchParams.get('name') || 'Student';

  const { socket, isConnected, timeLeft, hasAnswered, kickedOut } = useSelector((state) => state.socket);
  const { currentQuestion, results } = useSelector((state) => state.poll);

  const [selectedOption, setSelectedOption] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [waitingForQuestion, setWaitingForQuestion] = useState(true);
  const [tabId, setTabId] = useState(() => localStorage.getItem('tabId') || `tab_${Date.now()}`);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const answeredQuestionIds = useRef(new Set());
  const chatStorageKey = pollId ? `chat_${pollId}` : null;

  useEffect(() => {
    if (!pollId || !studentName) {
      navigate('/student/join');
      return;
    }

    // Initialize socket
    const newSocket = createSocket();
    dispatch(setSocket(newSocket));

    newSocket.on('connect', () => {
      dispatch(setConnected(true));
      
      // Join poll as student
      localStorage.setItem('tabId', tabId);
      
      newSocket.emit('student_join', {
        pollId,
        name: studentName,
        tabId,
      });
    });

    newSocket.on('disconnect', () => {
      dispatch(setConnected(false));
    });

    newSocket.on('name_assigned', (data) => {
      // Name was changed due to duplicate
      alert(`Your name has been changed to: ${data.name}`);
    });

    newSocket.on('question_started', (data) => {
      dispatch(setCurrentQuestion({
        questionId: data.questionId,
        text: data.questionText,
        options: data.options,
        timeLimit: data.timeLimit,
      }));
      dispatch(setTimeLeft(data.timeLeft || data.timeLimit));
      dispatch(setHasAnswered(false));
      setSelectedOption(null);
      setWaitingForQuestion(false);
    });

    newSocket.on('time_left', (data) => {
      dispatch(setTimeLeft(data.secondsLeft));
    });

    newSocket.on('result_update', (data) => {
      dispatch(setResults(data));
    });

    newSocket.on('chat_message', (data) => {
      dispatch(addChatMessage(data));
    });

    newSocket.on('answer_feedback', (data) => {
      if (data.questionId && answeredQuestionIds.current.has(data.questionId)) {
        return;
      }
      if (data.isCorrect) {
        toast.success('Correct answer! 🎉');
        setCorrectCount((prev) => prev + 1);
      } else {
        const correct = data.correctAnswer ? `Correct answer: ${data.correctAnswer}` : 'That was incorrect.';
        toast.error(correct);
      }
      setAttemptedCount((prev) => prev + 1);
      if (data.questionId) {
        answeredQuestionIds.current.add(data.questionId);
      }
    });

    newSocket.on('question_ended', (data) => {
      dispatch(setResults(data));
      dispatch(setTimeLeft(0));
    });

    newSocket.on('kicked_out', () => {
      dispatch(setKickedOut(true));
      setTimeout(() => {
        navigate('/student/kicked');
      }, 2000);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(error.message || 'An error occurred');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [pollId, studentName, navigate, dispatch]);

  // Load stored chat history on mount
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

  const handleSubmitAnswer = () => {
    if (selectedOption === null || hasAnswered || !currentQuestion) {
      return;
    }

    socket?.emit('submit_answer', {
      pollId,
      questionId: currentQuestion.questionId,
      optionIndex: selectedOption,
      studentName,
      socketId: socket.id,
      tabId,
    });

    dispatch(setHasAnswered(true));
  };

  const handleExit = () => {
    socket?.disconnect();
    dispatch(clearPoll());
    dispatch(resetSocket());
    dispatch(clearChatMessages());
    if (chatStorageKey) {
      localStorage.removeItem(chatStorageKey);
    }
    navigate('/');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (kickedOut) {
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
        </div>
      </div>
    );
  }

  const pagePadding = showChat ? 'pb-72 sm:pb-4' : '';

  if (waitingForQuestion) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative transition-all duration-300 ${pagePadding}`}>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large max-w-md w-full p-8 text-center border border-white/20">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-primary-light to-primary-dark px-4 py-2 rounded-full flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <span className="text-white font-semibold">Intervue Poll</span>
            </div>
          </div>
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-primary-light border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-xl text-gray-DEFAULT">
            Wait for the teacher to ask questions..
          </p>
        </div>
        <button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-200"
          style={{ background: '#7765DA', boxShadow: '0 0 0 3px rgba(255,255,255,0.85), 0 12px 28px rgba(0,0,0,0.35)' }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        {showChat && <Chat pollId={pollId} role="student" studentName={studentName} />}
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 transition-all duration-300 ${pagePadding}`}>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large max-w-4xl mx-auto p-4 sm:p-8 border border-white/20">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Question 1</h2>
            {timeLeft !== null && (
              <div className="flex items-center gap-2 mt-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-lg font-semibold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-DEFAULT'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-DEFAULT">Correct answers</div>
              <div className="text-lg font-semibold">{correctCount} / {attemptedCount}</div>
            </div>
            <button
              onClick={handleExit}
              className="px-4 py-2 text-sm rounded-lg border border-gray-light hover:bg-gray-light transition-colors w-full sm:w-auto"
            >
              Exit Quiz
            </button>
          </div>
        </div>

        {/* Question */}
        <div className="bg-gradient-to-r from-primary-light/10 to-secondary-light/10 p-4 sm:p-6 rounded-xl mb-6 border border-primary-light/20">
          <h3 className="text-xl font-semibold mb-2">Question</h3>
          <p className="text-lg">{currentQuestion?.text}</p>
        </div>

        {/* Options */}
        {!hasAnswered && (
          <div className="space-y-3 sm:space-y-4 mb-6">
            {currentQuestion?.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => !hasAnswered && setSelectedOption(index)}
                disabled={hasAnswered}
                className={`w-full p-3 sm:p-4 rounded-lg border-2 text-left transition-all ${
                  selectedOption === index
                    ? 'border-primary-light bg-purple-50'
                    : 'border-gray-light bg-white hover:border-primary-light'
                } ${hasAnswered ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    selectedOption === index ? 'bg-primary-light text-white' : 'bg-gray-light text-gray-DEFAULT'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-base sm:text-lg">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {results && (hasAnswered || timeLeft === 0) && (
          <div className="space-y-3 sm:space-y-4 mb-6">
            {currentQuestion?.options?.map((option, index) => {
              const percentage = results.percentages?.[index] || 0;
              const count = results.counts?.[index] || 0;
              const isSelected = selectedOption === index;
              
              return (
                <div
                  key={index}
                  className={`p-3 sm:p-4 rounded-lg border-2 ${
                    isSelected ? 'border-primary-light bg-purple-50' : 'border-gray-light bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      isSelected ? 'bg-primary-light text-white' : 'bg-gray-light text-gray-DEFAULT'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base sm:text-lg font-medium">{option}</span>
                        <span className="text-sm text-gray-DEFAULT">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-light rounded-full h-3 sm:h-4 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isSelected ? 'bg-primary-light' : 'bg-primary-light opacity-50'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-center text-gray-DEFAULT mt-4 text-sm sm:text-base">
              Wait for the teacher to ask a new question..
            </p>
          </div>
        )}

        {/* Submit Button */}
        {!hasAnswered && !results && (
          <div className="flex justify-end">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="w-full sm:w-auto text-white px-8 sm:px-10 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-glow transform hover:scale-105 sm:hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:transform-none border-2 border-gray-dark/50 text-center"
              style={{ 
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                boxShadow: selectedOption === null ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255,255,255,0.1), inset 0 2px 4px rgba(255,255,255,0.1)',
                background: selectedOption === null ? '#4a5568' : 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)'
              }}
            >
              Submit Answer →
            </button>
          </div>
        )}
      </div>

      {/* Chat Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-200 border-2 border-white"
          style={{ background: '#7765DA', boxShadow: '0 0 0 3px rgba(255,255,255,0.9), 0 14px 32px rgba(0,0,0,0.35)' }}
        >
          <svg className="w-6 h-6 text-white sm:text-white md:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {showChat && <Chat pollId={pollId} role="student" studentName={studentName} />}
    </div>
  );
}

export default StudentPoll;
