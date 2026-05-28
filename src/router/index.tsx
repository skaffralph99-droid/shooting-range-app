import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import BookLane from '../pages/customer/BookLane'
import MyBookings from '../pages/customer/MyBookings'
import MyScores from '../pages/customer/MyScores'
import AdminBookings from '../pages/admin/Bookings'
import Members from '../pages/admin/Members'
import Inventory from '../pages/admin/Inventory'
import AdminScores from '../pages/admin/Scores'
import Lanes from '../pages/admin/Lanes'

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/book', element: <BookLane /> },
      { path: '/my-bookings', element: <MyBookings /> },
      { path: '/my-scores', element: <MyScores /> },
      { path: '/admin/bookings', element: <ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute> },
      { path: '/admin/members', element: <ProtectedRoute adminOnly><Members /></ProtectedRoute> },
      { path: '/admin/inventory', element: <ProtectedRoute adminOnly><Inventory /></ProtectedRoute> },
      { path: '/admin/scores', element: <ProtectedRoute adminOnly><AdminScores /></ProtectedRoute> },
      { path: '/admin/lanes', element: <ProtectedRoute adminOnly><Lanes /></ProtectedRoute> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
