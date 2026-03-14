import React, { useState } from 'react'
import { Container, Row, Col, Card, Tab, Tabs, Table, Button, Badge, Alert } from 'react-bootstrap'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { FiHome, FiUsers, FiBook, FiBarChart2, FiCheck, FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  // Fetch resources for admin
  const fetchAdminResources = async () => {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/admin/resources?status=pending&limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }

  const { data: resourcesData, isLoading: resourcesLoading, refetch: refetchResources } = useQuery({
    queryKey: ['adminResources'],
    queryFn: fetchAdminResources,
    enabled: activeTab === 'resources'
  })

  // Fetch users for admin
  const fetchAdminUsers = async () => {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/admin/users?limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchAdminUsers,
    enabled: activeTab === 'users'
  })

  const handleApproveResource = async (resourceId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/admin/resources/${resourceId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Invalidate queries for AJAX auto-update
      queryClient.invalidateQueries({ queryKey: ['adminResources'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    } catch (error) {
      console.error('Error approving resource:', error)
    }
  }

  const handleRejectResource = async (resourceId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/admin/resources/${resourceId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Invalidate queries for AJAX auto-update
      queryClient.invalidateQueries({ queryKey: ['adminResources'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    } catch (error) {
      console.error('Error rejecting resource:', error)
    }
  }

  const handleToggleUserActive = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/admin/users/${userId}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Invalidate queries for AJAX auto-update
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA')
  }

  const getStatusBadge = (resource) => {
    if (!resource.isActive) {
      return <Badge bg="secondary">Деактивований</Badge>
    }
    if (!resource.isApproved) {
      return <Badge bg="warning">Очікує модерації</Badge>
    }
    return <Badge bg="success">Активний</Badge>
  }

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

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            {/* Overview Tab */}
            <Tab eventKey="overview" title={<><FiHome className="me-2" />Огляд</>}>
              {statsLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Завантаження...</span>
                  </div>
                </div>
              ) : (
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
              )}

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
                            onClick={() => setActiveTab('resources')}
                          >
                            <FiBook className="me-2" />
                            Модерація ресурсів
                          </Button>
                        </Col>
                        <Col md={4}>
                          <Button 
                            variant="outline-success" 
                            className="w-100"
                            onClick={() => setActiveTab('users')}
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
            </Tab>

            {/* Resources Management Tab */}
            <Tab eventKey="resources" title={<><FiBook className="me-2" />Ресурси</>}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Ресурси, що очікують модерації</h5>
                </Card.Header>
                <Card.Body>
                  {resourcesLoading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Завантаження...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {resourcesData?.data?.resources?.length === 0 ? (
                        <Alert variant="info">
                          <Alert.Heading>Немає ресурсів для модерації</Alert.Heading>
                          <p>Всі ресурси опрацьовані або немає нових заявок.</p>
                        </Alert>
                      ) : (
                        <Table responsive hover>
                          <thead>
                            <tr>
                              <th>Назва</th>
                              <th>Автор</th>
                              <th>Категорія</th>
                              <th>Дата створення</th>
                              <th>Статус</th>
                              <th>Дії</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resourcesData?.data?.resources?.map((resource) => (
                              <tr key={resource._id}>
                                <td>
                                  <strong>{resource.title}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {resource.description.substring(0, 100)}...
                                  </small>
                                </td>
                                <td>
                                  {resource.author?.firstName} {resource.author?.lastName}
                                  <br />
                                  <small className="text-muted">{resource.author?.email}</small>
                                </td>
                                <td>
                                  <Badge bg="secondary">{resource.category}</Badge>
                                </td>
                                <td>{formatDate(resource.createdAt)}</td>
                                <td>{getStatusBadge(resource)}</td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleApproveResource(resource._id)}
                                      disabled={resource.isApproved}
                                      title={resource.isApproved ? 'Вже схвалено' : 'Схвалити ресурс'}
                                    >
                                      <FiCheck />
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleRejectResource(resource._id)}
                                      title="Відхилити ресурс"
                                    >
                                      <FiX />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            {/* Users Management Tab */}
            <Tab eventKey="users" title={<><FiUsers className="me-2" />Користувачі</>}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Управління користувачами</h5>
                </Card.Header>
                <Card.Body>
                  {usersLoading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Завантаження...</span>
                      </div>
                    </div>
                  ) : (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Користувач</th>
                          <th>Email</th>
                          <th>Роль</th>
                          <th>Статус</th>
                          <th>Дата реєстрації</th>
                          <th>Дії</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersData?.data?.users?.map((user) => (
                          <tr key={user._id}>
                            <td>
                              <strong>{user.firstName} {user.lastName}</strong>
                            </td>
                            <td>
                              {user.email}
                              {!user.emailVerified && (
                                <Badge bg="warning" className="ms-2">Не підтверджено</Badge>
                              )}
                            </td>
                            <td>
                              <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                                {user.role === 'admin' ? 'Адмін' : 'Користувач'}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={user.isActive ? 'success' : 'secondary'}>
                                {user.isActive ? 'Активний' : 'Неактивний'}
                              </Badge>
                            </td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td>
                              <Button
                                variant={user.isActive ? "outline-danger" : "outline-success"}
                                size="sm"
                                onClick={() => handleToggleUserActive(user._id)}
                              >
                                {user.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  )
}

export default AdminDashboard
