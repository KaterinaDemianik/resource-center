import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Tab, Tabs, Badge, Alert } from 'react-bootstrap'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { FiUser, FiSettings, FiEdit } from 'react-icons/fi'

const Profile = () => {
  const queryClient = useQueryClient()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setLoading(false)
          return
        }

        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.success) {
          const userData = response.data.user
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || ''
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
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
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  const onSubmitProfile = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put('/api/auth/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        const updatedUser = response.data.user
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        // Інвалідуємо дані користувача для оновлення в навбарі
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Помилка оновлення профілю')
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
    setPasswordError('')
    setPasswordSuccess('')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Нові паролі не співпадають')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Новий пароль повинен містити мінімум 6 символів')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setPasswordSuccess('Пароль успішно змінено')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Помилка зміни паролю')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete('/api/auth/delete-account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/'
      }
    } catch (error) {
      alert('Помилка видалення акаунту: ' + (error.response?.data?.message || 'Невідома помилка'))
    }
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Завантаження...</span>
          </div>
        </div>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Будь ласка, увійдіть в систему для перегляду профілю
        </Alert>
      </Container>
    )
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
            <Tab eventKey="profile" title={<><FiUser className="me-2" />Інформація профілю</>}>
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

            {/* Settings Tab */}
            <Tab eventKey="settings" title={<><FiSettings className="me-2" />Налаштування</>}>
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <h5 className="mb-0">Зміна паролю</h5>
                </Card.Header>
                <Card.Body>
                  {passwordError && (
                    <Alert variant="danger" onClose={() => setPasswordError('')} dismissible>
                      {passwordError}
                    </Alert>
                  )}
                  {passwordSuccess && (
                    <Alert variant="success" onClose={() => setPasswordSuccess('')} dismissible>
                      {passwordSuccess}
                    </Alert>
                  )}

                  <Form onSubmit={handleChangePassword}>
                    <Form.Group className="mb-3">
                      <Form.Label>Поточний пароль</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        placeholder="Введіть поточний пароль"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Новий пароль</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        placeholder="Введіть новий пароль (мінімум 6 символів)"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Підтвердіть новий пароль</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        placeholder="Повторіть новий пароль"
                      />
                    </Form.Group>

                    <Button type="submit" variant="primary">
                      Змінити пароль
                    </Button>
                  </Form>
                </Card.Body>
              </Card>

              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <h5 className="mb-0">Сповіщення</h5>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <Alert.Heading>В розробці</Alert.Heading>
                    <p>Налаштування сповіщень будуть додані в наступних версіях.</p>
                  </Alert>
                </Card.Body>
              </Card>

              <Card className="shadow-sm border-danger">
                <Card.Header className="bg-danger text-white">
                  <h5 className="mb-0">Небезпечна зона</h5>
                </Card.Header>
                <Card.Body>
                  <h6>Видалення акаунту</h6>
                  <p className="text-muted">
                    Після видалення акаунту всі ваші дані будуть безповоротно втрачені. 
                    Ця дія не може бути скасована.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <Button 
                      variant="outline-danger" 
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Видалити акаунт
                    </Button>
                  ) : (
                    <div className="mt-3">
                      <Alert variant="danger">
                        <Alert.Heading>Ви впевнені?</Alert.Heading>
                        <p>Ця дія незворотна. Всі ваші дані будуть видалені назавжди.</p>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="danger" 
                            onClick={handleDeleteAccount}
                          >
                            Так, видалити мій акаунт
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Скасувати
                          </Button>
                        </div>
                      </Alert>
                    </div>
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

export default Profile
