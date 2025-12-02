import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentJoin from './pages/StudentJoin';
import StudentPoll from './pages/StudentPoll';
import StudentKicked from './pages/StudentKicked';
import PollHistory from './pages/PollHistory';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/teacher/login" element={<TeacherLogin />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/student/join" element={<StudentJoin />} />
      <Route path="/student/poll/:pollId" element={<StudentPoll />} />
      <Route path="/student/kicked" element={<StudentKicked />} />
      <Route path="/teacher/history/:pollId" element={<PollHistory />} />
    </Routes>
  );
}

export default App;

