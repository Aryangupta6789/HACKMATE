import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateTeam from './pages/CreateTeam';
import Profile from './pages/Profile';
import TeamDetails from './pages/TeamDetails';
import Notifications from './pages/Notifications';
import Analysis from './pages/Analysis';
import MyTeams from './pages/MyTeams';
import ChatPage from './pages/ChatPage';

// Placeholder components for now
function Home() { return <Dashboard /> }

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<Layout />}>
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/create-team" element={<PrivateRoute><CreateTeam /></PrivateRoute>} />
            <Route path="/team/:teamId" element={<PrivateRoute><TeamDetails /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/analysis" element={<PrivateRoute><Analysis /></PrivateRoute>} />
            <Route path="/my-teams" element={<PrivateRoute><MyTeams /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
