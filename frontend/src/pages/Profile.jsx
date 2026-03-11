import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Tab, Tabs, Badge, Alert } from 'react-bootstrap'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { FiUser, FiSettings, FiBook, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || ''
      })
    }
  }, [])

  // Fetch user's resources
  const fetchUserResources = async () => {
    const response = await axios.get('/api/resources/user/my-resources')
    return response.data
  }

  const { data: resourcesData, isLoading: resourcesLoading, refetch: refetchResources } = useQuery({
    queryKey: ['userResources'],
    queryFn: fetchUserResources,
    enabled: activeTab === 'resources'
  })

  const onSubmitProfile = async (e) => {
    e.preventDefault()
    try {
      const updatedUser = { ...user, ...formData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setIsEditing(false)
    } catch (error) {
      console.error('Profile update error:', error)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getCategoryBadgeVariant = (category) => {
    const variants = {
      education: 'primary',
      technology: 'info',
      health: 'success',
      business: 'warning',
      entertainment: 'danger',
      other: 'secondary'
    }
    return variants[category] || 'secondary'
  }

  const categories = {
    education: 'Освіта',
    technology: 'Технології',
    health: 'Здоров\'я',
    business: 'Бізнес',
    entertainment: 'Розваги',
    other: 'Інше'
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
    <Container className="py-5">
      <Row>
        <Col lg={3}>
          {/* Profile Sidebar */}
          <Card className="shadow-sm mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <FiUser size={64} className="text-muted" />
              </div>
              <h5>{user?.firstName} {user?.lastName}</h5>
              <p className="text-muted">{user?.email}</p>
              <Badge bg={user?.role === 'admin' ? 'danger' : 'primary'}>
                {user?.role === 'admin' ? 'Адміністратор' : 'Користувач'}
              </Badge>
            </Card.Body>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-sm">
            <Card.Body>
              <h6>Статистика</h6>
              <div className="d-flex justify-content-between mb-2">
                <span>Ресурсів:</span>
                <Badge bg="primary">{resourcesData?.data?.pagination?.total || 0}</Badge>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Статус:</span>
                <Badge bg={user?.isActive ? 'success' : 'danger'}>
                  {user?.isActive ? 'Активний' : 'Неактивний'}
                </Badge>
              </div>
              <div className="d-flex justify-content-between">
                <span>Email підтверджено:</span>
                <Badge bg={user?.emailVerified ? 'success' : 'warning'}>
                  {user?.emailVerified ? 'Так' : 'Ні'}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            {/* Profile Tab */}
            <Tab eventKey="profile" title={<><FiUser className="me-2" />Профіль</>}>
              <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Інформація профілю</h5>
                  <Button
                    variant={isEditing ? "success" : "outline-primary"}
                    size="sm"
                    onClick={() => {
                      if (isEditing) {
                        onSubmitProfile({ preventDefault: () => {} })
                      } else {
                        setIsEditing(true)
                      }
                    }}
                  >
                    <FiEdit className="me-2" />
                    {isEditing ? 'Зберегти' : 'Редагувати'}
                  </Button>
                </Card.Header>
                <Card.Body>
                  {!user?.emailVerified && (
                    <Alert variant="warning" className="mb-4">
                      <Alert.Heading>Email не підтверджено</Alert.Heading>
                      <p>Будь ласка, перевірте свою електронну пошту та підтвердіть акаунт.</p>
                    </Alert>
                  )}

                  <Form onSubmit={onSubmitProfile}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ім'я</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Прізвище</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                      />
                    </Form.Group>

                    {isEditing && (
                      <div className="d-flex gap-2">
                        <Button type="submit" variant="success">
                          Зберегти зміни
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => setIsEditing(false)}
                        >
                          Скасувати
                        </Button>
                      </div>
                    )}
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            {/* Resources Tab */}
            <Tab eventKey="resources" title={<><FiBook className="me-2" />Мої ресурси</>}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5>Мої ресурси</h5>
                <Button variant="primary">
                  <FiPlus className="me-2" />
                  Додати ресурс
                </Button>
              </div>

              {resourcesLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Завантаження...</span>
                  </div>
                </div>
              ) : (
                <>
                  {resourcesData?.data?.resources?.length === 0 ? (
                    <Card className="text-center py-5">
                      <Card.Body>
                        <FiBook size={48} className="text-muted mb-3" />
                        <h5>У вас ще немає ресурсів</h5>
                        <p className="text-muted">Додайте свій перший ресурс, щоб поділитися знаннями з іншими</p>
                        <Button variant="primary">
                          <FiPlus className="me-2" />
                          Додати ресурс
                        </Button>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Row className="g-3">
                      {resourcesData?.data?.resources?.map((resource) => (
                        <Col md={6} key={resource._id}>
                          <Card className="h-100">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <Badge 
                                  bg={getCategoryBadgeVariant(resource.category)}
                                  className="category-badge"
                                >
                                  {categories[resource.category] || resource.category}
                                </Badge>
                                {getStatusBadge(resource)}
                              </div>
                              
                              <Card.Title className="h6">{resource.title}</Card.Title>
                              <Card.Text className="text-muted small">
                                {resource.description.length > 100 
                                  ? `${resource.description.substring(0, 100)}...`
                                  : resource.description
                                }
                              </Card.Text>

                              <div className="d-flex justify-content-between align-items-center mt-auto">
                                <small className="text-muted">
                                  {formatDate(resource.createdAt)}
                                </small>
                                <div>
                                  <Button variant="outline-primary" size="sm" className="me-2">
                                    <FiEdit />
                                  </Button>
                                  <Button variant="outline-danger" size="sm">
                                    <FiTrash2 />
                                  </Button>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </>
              )}
            </Tab>

            {/* Settings Tab */}
            <Tab eventKey="settings" title={<><FiSettings className="me-2" />Налаштування</>}>
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Налаштування акаунту</h5>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <Alert.Heading>В розробці</Alert.Heading>
                    <p>Додаткові налаштування акаунту будуть додані в наступних версіях.</p>
                  </Alert>

                  <div className="mb-4">
                    <h6>Зміна паролю</h6>
                    <p className="text-muted">Функція зміни паролю буде додана пізніше.</p>
                  </div>

                  <div className="mb-4">
                    <h6>Сповіщення</h6>
                    <p className="text-muted">Налаштування сповіщень будуть додані пізніше.</p>
                  </div>

                  <div className="border-top pt-4">
                    <h6 className="text-danger">Небезпечна зона</h6>
                    <p className="text-muted">Видалення акаунту буде додано пізніше.</p>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  )
}

export default Profile
