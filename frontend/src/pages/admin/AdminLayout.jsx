import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { FiUsers, FiBook, FiBarChart2, FiHome, FiPlusCircle } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Spinner, Container } from 'react-bootstrap'

const AdminLayout = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="light" />
      </Container>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div style={{
      display: 'flex',
      gap: '1.5rem',
      padding: '2rem',
      alignItems: 'flex-start'
    }}
    >
      <div style={{
        width: '200px',
        flexShrink: 0,
        backgroundColor: '#16213e',
        border: '1px solid #2d3748',
        borderRadius: '12px',
        padding: '1.5rem 1rem',
        marginTop: '2rem'
      }}
      >
        <h5 style={{ whiteSpace: 'nowrap', color: '#e2e8f0', marginBottom: '1.5rem' }}>
          Адмін панель
        </h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link
            to="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              color: location.pathname === '/admin' ? '#a78bfa' : '#94a3b8',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <FiBarChart2 size={18} />
            Статистика
          </Link>
          <Link
            to="/admin/resources"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              color: location.pathname === '/admin/resources' ? '#a78bfa' : '#94a3b8',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <FiBook size={18} />
            Ресурси
          </Link>
          <Link
            to="/admin/create-resource"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              color: location.pathname === '/admin/create-resource' ? '#a78bfa' : '#94a3b8',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <FiPlusCircle size={18} />
            Створити ресурс
          </Link>
          <Link
            to="/admin/users"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              color: location.pathname === '/admin/users' ? '#a78bfa' : '#94a3b8',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <FiUsers size={18} />
            Користувачі
          </Link>
          <hr style={{ borderColor: '#2d3748', margin: '1rem 0' }} />
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              color: '#94a3b8',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <FiHome size={18} />
            На головну
          </Link>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
