import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PropertyList from './pages/properties/PropertyList';
import PropertyDetail from './pages/properties/PropertyDetail';
import RoomList from './pages/rooms/RoomList';
import RoomDetail from './pages/rooms/RoomDetail';
import AssignmentList from './pages/assignments/AssignmentList';
import AssignmentDetail from './pages/assignments/AssignmentDetail';
import UserList from './pages/users/UserList';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user } = useAuth();

  // Basic RBAC check
  if (!user || user.role !== 'admin') {
    return <div className="flex h-screen items-center justify-center bg-gray-100">Access Denied. Admin only.</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route path="properties" element={<PropertyList />} />
        <Route path="properties/:id" element={<PropertyDetail />} />
        
        <Route path="rooms" element={<RoomList />} />
        <Route path="rooms/:id" element={<RoomDetail />} />
        
        <Route path="assignments" element={<AssignmentList />} />
        <Route path="assignments/:id" element={<AssignmentDetail />} />

        <Route path="users" element={<UserList />} />
      </Route>
    </Routes>
  );
}

export default App;
