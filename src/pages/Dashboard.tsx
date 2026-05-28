import { useAuth } from '../context/AuthContext'
import AdminDashboard from './admin/AdminDashboard'
import CustomerDashboard from './CustomerDashboard'

export default function Dashboard() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminDashboard /> : <CustomerDashboard />
}
