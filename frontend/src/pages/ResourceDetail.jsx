import React from 'react'
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiArrowLeft, FiExternalLink, FiUser, FiCalendar, FiEye, FiTag } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useApi } from '../contexts/ApiContext.jsx'
import { fetchResource } from '../services/apiService'

const ResourceDetail = () => {
  const { id } = useParams()
  const { user, token } = useAuth()
  const { apiMode } = useApi()

  const fetchSimilarResources = async () => {
    const axios = (await import('axios')).default
    const response = await axios.get(`/api/resources/${id}/similar`)
    return response.data
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['resource', id, apiMode],
    queryFn: () => fetchResource(id, apiMode, token),
    enabled: !!id,
  })

  const { data: similarData, isLoading: similarLoading } = useQuery({
    queryKey: ['similar-resources', id],
    queryFn: fetchSimilarResources,
    enabled: !!id,
  })

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

  const formatDate = (dateValue) => {
    if (!dateValue) return ''
    const numericValue = Number(dateValue)
    const date = (!isNaN(numericValue) && numericValue > 0)
      ? new Date(numericValue)
      : new Date(dateValue)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="loading-spinner">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Завантаження...</span>
          </Spinner>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Помилка завантаження</Alert.Heading>
          <p>Не вдалося завантажити ресурс. Можливо, він не існує або був видалений.</p>
          <Link to="/resources">
            <Button variant="outline-danger">
              <FiArrowLeft className="me-2" />
              Повернутися до ресурсів
            </Button>
          </Link>
        </Alert>
      </Container>
    )
  }

  const resource = data?.data

  if (!resource) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Ресурс не знайдено</Alert.Heading>
          <p>Запитуваний ресурс не існує.</p>
          <Link to="/resources">
            <Button variant="outline-warning">
              <FiArrowLeft className="me-2" />
              Повернутися до ресурсів
            </Button>
          </Link>
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          {/* Back Button */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Link to="/resources">
              <Button variant="outline-light" size="sm">
                <FiArrowLeft className="me-2" />
                Назад до ресурсів
              </Button>
            </Link>
          </div>

          <Card className="resource-detail-card">
            <Card.Body className="p-4 p-md-5">
              {/* Header */}
              <div className="mb-4">
                <div className="mb-3">
                  <Badge 
                    bg={getCategoryBadgeVariant(resource.category)}
                    className="category-badge"
                  >
                    {categories[resource.category] || resource.category}
                  </Badge>
                </div>
                
                <h1 className="h2 mb-3">{resource.title}</h1>
                
                {/* Meta Information */}
                <Row className="text-muted small mb-3">
                  <Col md={6}>
                    <div className="mb-2">
                      <FiUser className="me-2" />
                      Автор: {resource.author?.firstName} {resource.author?.lastName}
                    </div>
                    <div className="mb-2">
                      <FiCalendar className="me-2" />
                      Опубліковано: {formatDate(resource.createdAt)}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <FiEye className="me-2" />
                      Переглядів: {resource.views}
                    </div>
                    {resource.updatedAt !== resource.createdAt && (
                      <div className="mb-2">
                        <FiCalendar className="me-2" />
                        Оновлено: {formatDate(resource.updatedAt)}
                      </div>
                    )}
                  </Col>
                </Row>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h5>Опис</h5>
                <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                  {resource.description}
                </p>
              </div>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="mb-4">
                  <h6>
                    <FiTag className="me-2" />
                    Теги
                  </h6>
                  <div>
                    {resource.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        bg="light" 
                        text="dark" 
                        className="me-2 mb-2"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* External Link */}
              {resource.url && (
                <div className="mb-4">
                  <h6>Посилання</h6>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <FiExternalLink className="me-2" />
                    Перейти до ресурсу
                  </a>
                </div>
              )}

              {/* Status Information for Authors/Admins */}
              {(!resource.isApproved || !resource.isActive) && (
                <Alert variant="warning" className="mt-4">
                  <Alert.Heading>Статус ресурсу</Alert.Heading>
                  {!resource.isApproved && (
                    <p className="mb-1">
                      <strong>Очікує модерації:</strong> Ресурс ще не схвалений адміністратором.
                    </p>
                  )}
                  {!resource.isActive && (
                    <p className="mb-0">
                      <strong>Деактивований:</strong> Ресурс тимчасово недоступний.
                    </p>
                  )}
                </Alert>
              )}

              {/* Approval Information */}
              {resource.isApproved && resource.approvedBy && (
                <div className="mt-4 pt-4 border-top">
                  <small className="text-muted">
                    Схвалено {resource.approvedBy.firstName} {resource.approvedBy.lastName} 
                    {resource.approvedAt && ` ${formatDate(resource.approvedAt)}`}
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Related Resources Section */}
          <div className="mt-5">
            <h4 className="mb-4">Схожі ресурси</h4>
            {similarLoading ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" />
              </div>
            ) : similarData?.data?.resources?.length > 0 ? (
              <Row>
                {similarData.data.resources.map((similarResource) => (
                  <Col key={similarResource._id} md={6} lg={4} className="mb-4">
                    <Card className="h-100 shadow-sm hover-shadow">
                      <Card.Body>
                        <Badge 
                          bg={getCategoryBadgeVariant(similarResource.category)}
                          className="mb-2"
                        >
                          {categories[similarResource.category] || similarResource.category}
                        </Badge>
                        <Card.Title className="h6">
                          <Link 
                            to={`/resources/${similarResource._id}`}
                            className="text-decoration-none"
                            style={{ color: '#e2e8f0' }}
                          >
                            {similarResource.title}
                          </Link>
                        </Card.Title>
                        <Card.Text className="text-muted small">
                          {similarResource.description?.substring(0, 100)}
                          {similarResource.description?.length > 100 ? '...' : ''}
                        </Card.Text>
                        <div className="text-muted small">
                          <FiUser className="me-1" />
                          {similarResource.author?.firstName} {similarResource.author?.lastName}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-muted">
                Схожих ресурсів не знайдено.
              </p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default ResourceDetail
