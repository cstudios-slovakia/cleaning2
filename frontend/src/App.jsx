import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PropertyList from './pages/properties/PropertyList';
import PropertyDetail from './pages/properties/PropertyDetail';
import PropertyLogs from './pages/properties/PropertyLogs';
import RoomList from './pages/rooms/RoomList';
import RoomDetail from './pages/rooms/RoomDetail';
import AssignmentList from './pages/assignments/AssignmentList';
import AssignmentDetail from './pages/assignments/AssignmentDetail';
import UserList from './pages/users/UserList';
import Login from './pages/Login';
import { useAuth } from './contexts/AuthContext';

import Settings from './pages/settings/Settings';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user?.role === 'cleaner' ? "/assignments" : "/dashboard"} replace />} />
      
      {/* Explicitly catch index.html caused by server rewrites */}
      <Route path="/index.html" element={<Navigate to={user?.role === 'cleaner' ? "/assignments" : "/dashboard"} replace />} />
      
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Navigate to={user?.role === 'cleaner' ? "/assignments" : "/dashboard"} replace />} />
        <Route path="dashboard" element={user?.role === 'cleaner' ? <Navigate to="/assignments" replace /> : <Dashboard />} />
        
        <Route path="properties" element={user?.role === 'cleaner' ? <Navigate to="/assignments" replace /> : <PropertyList />} />
        <Route path="properties/:id" element={user?.role === 'cleaner' ? <Navigate to="/assignments" replace /> : <PropertyDetail />} />
        <Route path="properties/:id/logs" element={user?.role === 'cleaner' ? <Navigate to="/assignments" replace /> : <PropertyLogs />} />
        
        <Route path="rooms" element={<RoomList />} />
        <Route path="rooms/:id" element={<RoomDetail />} />
        
        <Route path="assignments" element={<AssignmentList />} />
        <Route path="assignments/:id" element={<AssignmentDetail />} />

        <Route path="users" element={user?.role === 'cleaner' ? <Navigate to="/assignments" replace /> : <UserList />} />

        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all route for unhandled paths */}
      <Route path="*" element={<Navigate to={user ? (user.role === 'cleaner' ? "/assignments" : "/dashboard") : "/login"} replace />} />
    </Routes>
  );
}

export default App;
