import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { FiSearch, FiFilter, FiEye, FiCalendar, FiUser, FiEdit, FiTrash2 } from 'react-icons/fi'
import broadcastSync, { SYNC_EVENTS } from '../utils/broadcastSync'
import './Resources.css'

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const queryClient = useQueryClient()

  const categories = [
    { value: '', label: 'Всі категорії' },
    { value: 'education', label: 'Освіта' },
    { value: 'technology', label: 'Технології' },
    { value: 'health', label: 'Здоров\'я' },
    { value: 'business', label: 'Бізнес' },
    { value: 'entertainment', label: 'Розваги' },
    { value: 'other', label: 'Інше' }
  ]

  const fetchResources = async () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '12'
    })
    
    if (selectedCategory) params.append('category', selectedCategory)
    if (searchTerm) params.append('search', searchTerm)

    const response = await axios.get(`/api/resources?${params}`)
    return response.data
  }

  const fetchMyResources = async () => {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '12'
    })
    
    const response = await axios.get(`/api/resources/user/my-resources?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resources', currentPage, selectedCategory, searchTerm, activeTab],
    queryFn: activeTab === 'my' ? fetchMyResources : fetchResources,
    staleTime: 30 * 1000, // 30 секунд
    refetchInterval: 30 * 1000, // Автоматично оновлювати кожні 30 секунд
    refetchOnWindowFocus: true, // Оновлювати при переключенні на вкладку
    refetchOnMount: true, // Оновлювати при монтуванні компонента
    enabled: activeTab === 'all' || (activeTab === 'my' && !!localStorage.getItem('token'))
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    refetch()
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  // Підписка на події з інших вкладок
  useEffect(() => {
    const unsubscribeCreated = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_CREATED, () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    })

    const unsubscribeUpdated = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    })

    const unsubscribeDeleted = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_DELETED, () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    })

    const unsubscribeApproved = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_APPROVED, () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    })

    return () => {
      unsubscribeCreated()
      unsubscribeUpdated()
      unsubscribeDeleted()
      unsubscribeApproved()
    }
  }, [queryClient])

  const deleteMutation = useMutation({
    mutationFn: async (resourceId) => {
      const token = localStorage.getItem('token')
      return axios.delete(`/api/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    },
    onSuccess: () => {
      // Автоматично оновлюємо всі пов'язані запити
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      // Повідомляємо інші вкладки про видалення
      broadcastSync.broadcast(SYNC_EVENTS.RESOURCE_DELETED, {})
      alert('Ресурс успішно видалено!')
    },
    onError: (error) => {
      alert('Помилка видалення ресурсу: ' + (error.response?.data?.message || 'Невідома помилка'))
    }
  })

  const handleDeleteResource = (resourceId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей ресурс?')) {
      deleteMutation.mutate(resourceId)
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA')
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Помилка завантаження</Alert.Heading>
          <p>Не вдалося завантажити ресурси. Спробуйте пізніше.</p>
          <Button variant="outline-danger" onClick={() => refetch()}>
            Спробувати знову
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <>
      {/* Search Section */}
      <section style={{ 
        background: 'linear-gradient(180deg, #1e1535 0%, #16213e 60%, #0d0d1a 100%)',
        padding: '3rem 0',
        marginBottom: '2rem'
      }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <h2 className="text-center mb-4">Знайдіть потрібні ресурси</h2>
              <Form onSubmit={handleSearch}>
                <Row className="g-2">
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      placeholder="Пошук ресурсів..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="lg"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.07)',
                        border: '1px solid #2d3748',
                        color: '#e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                  </Col>
                  <Col md={4}>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-100"
                      style={{
                        backgroundColor: '#7c3aed',
                        borderColor: '#7c3aed',
                        color: '#ffffff',
                        fontWeight: 500
                      }}
                    >
                      <FiSearch className="me-2" />
                      Пошук
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-4">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => {
            setActiveTab(k)
            setCurrentPage(1)
          }}
          className="mb-4"
          style={{ borderBottom: '2px solid #2d3748' }}
        >
          <Tab 
            eventKey="all" 
            title="Усі ресурси"
            tabClassName="text-light"
          />
          <Tab 
            eventKey="my" 
            title="Мої ресурси"
            tabClassName="text-light"
            disabled={!localStorage.getItem('token')}
          />
        </Tabs>
      </Container>

      <Container className="py-3">
        <Row>
          {/* Sidebar */}
          <Col lg={3}>
            <div className="sidebar">
              <h5 className="mb-3">
                <FiFilter className="me-2" />
                Фільтри
              </h5>
              
              <div className="mb-4">
                <h6>Категорії</h6>
                {categories.map((category) => (
                  <Form.Check
                    key={category.value}
                    type="radio"
                    id={`category-${category.value}`}
                    label={category.label}
                    name="category"
                    checked={selectedCategory === category.value}
                    onChange={() => handleCategoryChange(category.value)}
                    className="mb-2"
                  />
                ))}
              </div>

              {data?.data && (
                <div className="text-muted small">
                  Знайдено: {data.data.pagination.total} ресурсів
                </div>
              )}
            </div>
          </Col>

          {/* Main Content */}
          <Col lg={9}>
            {isLoading ? (
              <div className="loading-spinner">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Завантаження...</span>
                </Spinner>
              </div>
            ) : (
              <>
                {data?.data?.resources?.length === 0 ? (
                  <div className="text-center py-5">
                    <h4>Ресурси не знайдені</h4>
                    <p className="text-muted">Спробуйте змінити критерії пошуку</p>
                  </div>
                ) : (
                  <>
                    <Row className="g-4">
                      {data?.data?.resources?.map((resource) => (
                        <Col md={6} xl={4} key={resource._id}>
                          <Link 
                            to={`/resources/${resource._id}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <Card 
                              className="h-100 resource-card card-hover"
                              style={{
                                backgroundColor: '#16213e',
                                border: '1px solid #2d3748',
                                borderRadius: '12px',
                                transition: 'border-color 0.2s, transform 0.2s',
                                cursor: 'pointer'
                              }}
                            >
                              <Card.Body className="d-flex flex-column">
                                <div className="mb-2 d-flex gap-2 flex-wrap">
                                  <Badge 
                                    bg={getCategoryBadgeVariant(resource.category)}
                                    className="category-badge"
                                    style={{
                                      fontSize: '11px',
                                      padding: '4px 10px',
                                      borderRadius: '20px'
                                    }}
                                  >
                                    {categories.find(c => c.value === resource.category)?.label || resource.category}
                                  </Badge>
                                  {activeTab === 'my' && !resource.isApproved && (
                                    <Badge 
                                      bg="warning"
                                      style={{
                                        fontSize: '11px',
                                        padding: '4px 10px',
                                        borderRadius: '20px'
                                      }}
                                    >
                                      На модерації
                                    </Badge>
                                  )}
                                  {activeTab === 'my' && resource.isApproved && (
                                    <Badge 
                                      bg="success"
                                      style={{
                                        fontSize: '11px',
                                        padding: '4px 10px',
                                        borderRadius: '20px'
                                      }}
                                    >
                                      Схвалено
                                    </Badge>
                                  )}
                                </div>
                                
                                <Card.Title 
                                  className="mb-2"
                                  style={{
                                    color: '#e2e8f0',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    lineHeight: 1.4
                                  }}
                                >
                                  {resource.title}
                                </Card.Title>
                              
                              <Card.Text className="text-muted small flex-grow-1">
                                {resource.description.length > 100 
                                  ? `${resource.description.substring(0, 100)}...`
                                  : resource.description
                                }
                              </Card.Text>

                              {resource.tags && resource.tags.length > 0 && (
                                <div className="mb-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {resource.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      style={{
                                        backgroundColor: 'rgba(124,58,237,0.15)',
                                        color: '#a78bfa',
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {resource.tags.length > 3 && (
                                    <span style={{ color: '#475569', fontSize: '11px' }}>
                                      +{resource.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="mt-auto">
                                <div className="d-flex justify-content-between align-items-center text-muted small">
                                  <span>
                                    <FiUser className="me-1" />
                                    {resource.author?.firstName} {resource.author?.lastName}
                                  </span>
                                  <span>
                                    <FiEye className="me-1" />
                                    {resource.views}
                                  </span>
                                </div>
                                <div className="text-muted small mt-1">
                                  <FiCalendar className="me-1" />
                                  {formatDate(resource.createdAt)}
                                </div>
                                
                                {activeTab === 'my' && (
                                  <div className="d-flex gap-2 mt-3">
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.location.href = `/resources/${resource._id}`;
                                      }}
                                      className="flex-grow-1"
                                    >
                                      <FiEdit className="me-1" />
                                      Редагувати
                                    </Button>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteResource(resource._id);
                                      }}
                                    >
                                      <FiTrash2 />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                          </Link>
                        </Col>
                      ))}
                    </Row>

                    {/* Pagination */}
                    {data?.data?.pagination?.pages > 1 && (
                      <div className="pagination-container">
                        <Button
                          variant="outline-primary"
                          disabled={!data.data.pagination.hasPrev}
                          onClick={() => setCurrentPage(prev => prev - 1)}
                          className="me-2"
                        >
                          Попередня
                        </Button>
                        <span className="mx-3">
                          Сторінка {data.data.pagination.current} з {data.data.pagination.pages}
                        </span>
                        <Button
                          variant="outline-primary"
                          disabled={!data.data.pagination.hasNext}
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          className="ms-2"
                        >
                          Наступна
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Resources
