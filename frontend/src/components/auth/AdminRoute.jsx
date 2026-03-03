import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Spinner, Container, Alert } from 'react-bootstrap'

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </Spinner>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Доступ заборонено</Alert.Heading>
          <p>У вас немає прав доступу до адміністративної панелі.</p>
        </Alert>
      </Container>
    )
  }

  return children
}

export default AdminRoute
