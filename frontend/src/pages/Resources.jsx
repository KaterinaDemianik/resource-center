import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { FiSearch, FiFilter, FiEye, FiCalendar, FiUser } from 'react-icons/fi'

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const categories = [
    { value: '', label: 'Всі категорії' },
    { value: 'education', label: 'Освіта' },
    { value: 'technology', label: 'Технології' },
    { value: 'health', label: 'Здоров\'я' },
    { value: 'business', label: 'Бізнес' },
    { value: 'entertainment', label: 'Розваги' },
    { value: 'other', label: 'Інше' }
  ]

  const fetchResources = async ({ queryKey }) => {
    const [, page, category, search] = queryKey
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '12'
    })
    
    if (category) params.append('category', category)
    if (search) params.append('search', search)

    const response = await axios.get(`/api/resources?${params}`)
    return response.data
  }

  const { data, isLoading, error, refetch } = useQuery(
    ['resources', currentPage, selectedCategory, searchTerm],
    fetchResources,
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    refetch()
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
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
      <section className="search-container">
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
                    />
                  </Col>
                  <Col md={4}>
                    <Button type="submit" variant="light" size="lg" className="w-100">
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

      <Container className="py-5">
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
                          <Card className="h-100 resource-card card-hover">
                            <Card.Body className="d-flex flex-column">
                              <div className="mb-2">
                                <Badge 
                                  bg={getCategoryBadgeVariant(resource.category)}
                                  className="category-badge"
                                >
                                  {categories.find(c => c.value === resource.category)?.label || resource.category}
                                </Badge>
                              </div>
                              
                              <Card.Title className="h6 mb-2">
                                <Link 
                                  to={`/resources/${resource._id}`}
                                  className="text-decoration-none text-dark"
                                >
                                  {resource.title}
                                </Link>
                              </Card.Title>
                              
                              <Card.Text className="text-muted small flex-grow-1">
                                {resource.description.length > 100 
                                  ? `${resource.description.substring(0, 100)}...`
                                  : resource.description
                                }
                              </Card.Text>

                              {resource.tags && resource.tags.length > 0 && (
                                <div className="mb-2">
                                  {resource.tags.slice(0, 3).map((tag, index) => (
                                    <Badge 
                                      key={index} 
                                      bg="light" 
                                      text="dark" 
                                      className="me-1 mb-1"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {resource.tags.length > 3 && (
                                    <Badge bg="light" text="dark">
                                      +{resource.tags.length - 3}
                                    </Badge>
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
                              </div>
                            </Card.Body>
                          </Card>
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
