import { Navigate } from 'react-router-dom'
import { Spinner, Container } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext.jsx'

const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" role="status" variant="light">
          <span className="visually-hidden">Завантаження...</span>
        </Spinner>
      </Container>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
