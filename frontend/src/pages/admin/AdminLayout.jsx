import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Nav, Card } from 'react-bootstrap'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { FiUsers, FiBook, FiBarChart2, FiHome } from 'react-icons/fi'

const AdminLayout = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(storedUser)
    
    // Check if user is admin
    if (userData.role !== 'admin') {
      navigate('/')
      return
    }

    setUser(userData)
  }, [navigate])

  if (!user) {
    return null
  }

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2} className="mb-4">
          <Card 
            className="sidebar"
            style={{
              minWidth: '200px',
              width: '200px',
              backgroundColor: '#16213e',
              borderRadius: '12px'
            }}
          >
            <Card.Body style={{ padding: '1.5rem 1rem' }}>
              <h5 className="mb-4" style={{ whiteSpace: 'nowrap', color: '#e2e8f0' }}>
                Адмін панель
              </h5>
              <Nav className="flex-column">
                <Nav.Link 
                  as={Link} 
                  to="/admin" 
                  className={isActive('/admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    color: location.pathname === '/admin' ? '#a78bfa' : '#94a3b8',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none'
                  }}
                >
                  <FiBarChart2 size={18} />
                  Статистика
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/admin/resources" 
                  className={isActive('/admin/resources')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    color: location.pathname === '/admin/resources' ? '#a78bfa' : '#94a3b8',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none'
                  }}
                >
                  <FiBook size={18} />
                  Ресурси
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/admin/users" 
                  className={isActive('/admin/users')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    color: location.pathname === '/admin/users' ? '#a78bfa' : '#94a3b8',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none'
                  }}
                >
                  <FiUsers size={18} />
                  Користувачі
                </Nav.Link>
                <hr style={{ borderColor: '#2d3748', margin: '1rem 0' }} />
                <Nav.Link 
                  as={Link} 
                  to="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none'
                  }}
                >
                  <FiHome size={18} />
                  На головну
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col md={9} lg={10}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  )
}

export default AdminLayout
