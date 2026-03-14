import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Tab, Tabs, Badge, Alert, Modal } from 'react-bootstrap'
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
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCreateResource, setShowCreateResource] = useState(false)
  const [showEditResource, setShowEditResource] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    category: 'technology',
    urls: [''],
    tags: ''
  })

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

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
      }
    }

    fetchCurrentUser()
  }, [])

  // Fetch user's resources
  const fetchUserResources = async () => {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/resources/user/my-resources', {
      headers: { Authorization: `Bearer ${token}` }
    })
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

  const handleCreateResource = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const tagsArray = newResource.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      const urlsArray = newResource.urls.filter(url => url.trim() !== '')
      
      const response = await axios.post('/api/resources', {
        title: newResource.title,
        description: newResource.description,
        category: newResource.category,
        url: urlsArray[0] || '',
        urls: urlsArray,
        tags: tagsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setShowCreateResource(false)
        setNewResource({
          title: '',
          description: '',
          category: 'technology',
          urls: [''],
          tags: ''
        })
        refetchResources()
        alert('Ресурс успішно створено!')
      }
    } catch (error) {
      alert('Помилка створення ресурсу: ' + (error.response?.data?.message || 'Невідома помилка'))
    }
  }

  const handleEditResource = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const tagsArray = editingResource.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      const urlsArray = editingResource.urls.filter(url => url.trim() !== '')
      
      const response = await axios.put(`/api/resources/${editingResource._id}`, {
        title: editingResource.title,
        description: editingResource.description,
        category: editingResource.category,
        url: urlsArray[0] || '',
        urls: urlsArray,
        tags: tagsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setShowEditResource(false)
        setEditingResource(null)
        refetchResources()
        alert('Ресурс успішно оновлено!')
      }
    } catch (error) {
      alert('Помилка оновлення ресурсу: ' + (error.response?.data?.message || 'Невідома помилка'))
    }
  }

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей ресурс?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`/api/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        refetchResources()
        alert('Ресурс успішно видалено!')
      }
    } catch (error) {
      alert('Помилка видалення ресурсу: ' + (error.response?.data?.message || 'Невідома помилка'))
    }
  }

  const openEditModal = (resource) => {
    setEditingResource({
      ...resource,
      urls: resource.urls && resource.urls.length > 0 ? resource.urls : [resource.url || ''],
      tags: resource.tags.join(', ')
    })
    setShowEditResource(true)
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
                <Button variant="primary" onClick={() => setShowCreateResource(true)}>
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
                        <Button variant="primary" onClick={() => setShowCreateResource(true)}>
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

                              <div className="mt-2 mb-2">
                                <div className="d-flex justify-content-between text-muted small">
                                  <span>
                                    <FiUser className="me-1" />
                                    {resource.author?.firstName} {resource.author?.lastName}
                                  </span>
                                  <span>
                                    <FiBook className="me-1" />
                                    {resource.views || 0} переглядів
                                  </span>
                                </div>
                                <small className="text-muted">
                                  {formatDate(resource.createdAt)}
                                </small>
                              </div>

                              <div className="d-flex justify-content-end gap-2">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => openEditModal(resource)}
                                >
                                  <FiEdit className="me-1" />
                                  Редагувати
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleDeleteResource(resource._id)}
                                >
                                  <FiTrash2 className="me-1" />
                                  Видалити
                                </Button>
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

      {/* Modal для створення ресурсу */}
      <Modal show={showCreateResource} onHide={() => setShowCreateResource(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Додати новий ресурс</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateResource}>
            <Form.Group className="mb-3">
              <Form.Label>Назва ресурсу *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введіть назву ресурсу"
                value={newResource.title}
                onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Опис *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Опишіть ресурс"
                value={newResource.description}
                onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Категорія *</Form.Label>
              <Form.Select
                value={newResource.category}
                onChange={(e) => setNewResource({...newResource, category: e.target.value})}
              >
                <option value="technology">Технології</option>
                <option value="education">Освіта</option>
                <option value="health">Здоров'я</option>
                <option value="business">Бізнес</option>
                <option value="entertainment">Розваги</option>
                <option value="other">Інше</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Посилання</Form.Label>
              {newResource.urls.map((url, index) => (
                <div key={index} className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...newResource.urls]
                      newUrls[index] = e.target.value
                      setNewResource({...newResource, urls: newUrls})
                    }}
                  />
                  {newResource.urls.length > 1 && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => {
                        const newUrls = newResource.urls.filter((_, i) => i !== index)
                        setNewResource({...newResource, urls: newUrls})
                      }}
                    >
                      <FiTrash2 />
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setNewResource({...newResource, urls: [...newResource.urls, '']})}
              >
                <FiPlus className="me-1" />
                Додати посилання
              </Button>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Теги (через кому)</Form.Label>
              <Form.Control
                type="text"
                placeholder="javascript, react, frontend"
                value={newResource.tags}
                onChange={(e) => setNewResource({...newResource, tags: e.target.value})}
              />
              <Form.Text className="text-muted">
                Введіть теги через кому для кращого пошуку
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreateResource(false)}>
                Скасувати
              </Button>
              <Button variant="primary" type="submit">
                <FiPlus className="me-2" />
                Створити ресурс
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal для редагування ресурсу */}
      <Modal show={showEditResource} onHide={() => setShowEditResource(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Редагувати ресурс</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingResource && (
            <Form onSubmit={handleEditResource}>
              <Form.Group className="mb-3">
                <Form.Label>Назва ресурсу *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Введіть назву ресурсу"
                  value={editingResource.title}
                  onChange={(e) => setEditingResource({...editingResource, title: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Опис *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Опишіть ресурс"
                  value={editingResource.description}
                  onChange={(e) => setEditingResource({...editingResource, description: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Категорія *</Form.Label>
                <Form.Select
                  value={editingResource.category}
                  onChange={(e) => setEditingResource({...editingResource, category: e.target.value})}
                >
                  <option value="technology">Технології</option>
                  <option value="education">Освіта</option>
                  <option value="health">Здоров'я</option>
                  <option value="business">Бізнес</option>
                  <option value="entertainment">Розваги</option>
                  <option value="other">Інше</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Посилання</Form.Label>
                {editingResource.urls.map((url, index) => (
                  <div key={index} className="d-flex gap-2 mb-2">
                    <Form.Control
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...editingResource.urls]
                        newUrls[index] = e.target.value
                        setEditingResource({...editingResource, urls: newUrls})
                      }}
                    />
                    {editingResource.urls.length > 1 && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => {
                          const newUrls = editingResource.urls.filter((_, i) => i !== index)
                          setEditingResource({...editingResource, urls: newUrls})
                        }}
                      >
                        <FiTrash2 />
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setEditingResource({...editingResource, urls: [...editingResource.urls, '']})}
                >
                  <FiPlus className="me-1" />
                  Додати посилання
                </Button>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Теги (через кому)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="javascript, react, frontend"
                  value={editingResource.tags}
                  onChange={(e) => setEditingResource({...editingResource, tags: e.target.value})}
                />
                <Form.Text className="text-muted">
                  Введіть теги через кому для кращого пошуку
                </Form.Text>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowEditResource(false)}>
                  Скасувати
                </Button>
                <Button variant="primary" type="submit">
                  <FiEdit className="me-2" />
                  Зберегти зміни
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default Profile
