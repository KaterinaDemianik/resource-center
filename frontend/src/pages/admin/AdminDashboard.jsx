import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { FiUsers, FiBook, FiBarChart2 } from 'react-icons/fi'

const AdminDashboard = () => {
  const navigate = useNavigate()

  // Fetch admin statistics
  const fetchStats = async () => {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchStats
  })

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <FiBarChart2 className="me-2" />
              Адміністративна панель
            </h2>
          </div>

          {statsLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Завантаження...</span>
              </div>
            </div>
          ) : (
            <>
              <Row className="g-4">
                {/* Users Stats */}
                <Col md={6} lg={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <FiUsers size={48} className="text-primary mb-3" />
                      <h3 className="text-primary">{statsData?.data?.users?.total || 0}</h3>
                      <p className="text-muted mb-2">Всього користувачів</p>
                      <small className="text-success">
                        +{statsData?.data?.users?.recentlyRegistered || 0} за тиждень
                      </small>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Active Users */}
                <Col md={6} lg={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <FiUsers size={48} className="text-success mb-3" />
                      <h3 className="text-success">{statsData?.data?.users?.active || 0}</h3>
                      <p className="text-muted mb-2">Активні користувачі</p>
                      <small className="text-warning">
                        {statsData?.data?.users?.unverified || 0} неверифіковані
                      </small>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Total Resources */}
                <Col md={6} lg={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <FiBook size={48} className="text-info mb-3" />
                      <h3 className="text-info">{statsData?.data?.resources?.total || 0}</h3>
                      <p className="text-muted mb-2">Всього ресурсів</p>
                      <small className="text-success">
                        +{statsData?.data?.resources?.recentlyCreated || 0} за тиждень
                      </small>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Pending Resources */}
                <Col md={6} lg={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <FiBook size={48} className="text-warning mb-3" />
                      <h3 className="text-warning">{statsData?.data?.resources?.pending || 0}</h3>
                      <p className="text-muted mb-2">Очікують модерації</p>
                      <small className="text-info">
                        {statsData?.data?.resources?.approved || 0} схвалені
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Quick Actions */}
              <Row className="mt-5">
                <Col>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Швидкі дії</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-3">
                        <Col md={4}>
                          <Button 
                            variant="outline-primary" 
                            className="w-100"
                            onClick={() => navigate('/admin/resources')}
                          >
                            <FiBook className="me-2" />
                            Модерація ресурсів
                          </Button>
                        </Col>
                        <Col md={4}>
                          <Button 
                            variant="outline-success" 
                            className="w-100"
                            onClick={() => navigate('/admin/users')}
                          >
                            <FiUsers className="me-2" />
                            Управління користувачами
                          </Button>
                        </Col>
                        <Col md={4}>
                          <Button 
                            variant="outline-info" 
                            className="w-100"
                            disabled
                          >
                            <FiBarChart2 className="me-2" />
                            Детальна аналітика
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default AdminDashboard
