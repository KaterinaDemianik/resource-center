import React from 'react'
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { FiArrowLeft, FiExternalLink, FiUser, FiCalendar, FiEye, FiTag, FiEdit } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext.jsx'

const ResourceDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()

  const fetchResource = async () => {
    const response = await axios.get(`/api/resources/${id}`)
    return response.data
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['resource', id],
    queryFn: fetchResource,
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
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

  const authorId = resource?.author?._id?.toString?.() || resource?.author?.toString?.()
  const canEdit =
    user &&
    authorId &&
    (user.id === authorId || user.role === 'admin')

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
          <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
            <Link to="/resources" className="text-decoration-none">
              <Button variant="outline-secondary" size="sm">
                <FiArrowLeft className="me-2" />
                Назад до ресурсів
              </Button>
            </Link>
            {canEdit && (
              <Link to={`/edit-resource/${resource._id}`} className="text-decoration-none">
                <Button variant="outline-primary" size="sm">
                  <FiEdit className="me-2" />
                  Редагувати
                </Button>
              </Link>
            )}
          </div>

          {/* Main Resource Card */}
          <Card className="shadow-sm">
            <Card.Body className="p-4">
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
            <h4>Схожі ресурси</h4>
            <p className="text-muted">
              Функція пошуку схожих ресурсів буде додана в наступних версіях.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default ResourceDetail
