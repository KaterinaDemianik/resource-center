import React from 'react'
import { Card, Badge, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiCalendar, FiUser, FiEdit, FiTrash2 } from 'react-icons/fi'

const defaultCategories = [
  { value: '', label: 'Всі категорії' },
  { value: 'education', label: 'Освіта' },
  { value: 'technology', label: 'Технології' },
  { value: 'health', label: 'Здоров\'я' },
  { value: 'business', label: 'Бізнес' },
  { value: 'entertainment', label: 'Розваги' },
  { value: 'other', label: 'Інше' }
]

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

/**
 * @param {'grid'|'default'} layout - grid: dark themed card used on /resources
 */
const ResourceCard = ({
  resource,
  layout = 'default',
  activeTab = 'all',
  onDeleteResource,
  categories = defaultCategories
}) => {
  const navigate = useNavigate()

  const formatDate = (dateValue) => {
    if (!dateValue) return ''
    const numericValue = Number(dateValue)
    const date = (!isNaN(numericValue) && numericValue > 0)
      ? new Date(numericValue)
      : new Date(dateValue)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('uk-UA')
  }

  if (layout === 'grid') {
    const goDetail = (e) => {
      if (e.target.closest('button, a')) return
      navigate(`/resources/${resource._id || resource.id}`)
    }

    const statusBadge = activeTab === 'my'
      ? !resource.isApproved
        ? {
            text: 'На модерації',
            style: {
              backgroundColor: '#f59e0b',
              color: '#111827'
            }
          }
        : {
            text: 'Схвалено',
            style: {
              backgroundColor: '#8b5cf6',
              color: '#ffffff'
            }
          }
      : null

    const cardInner = (
      <Card
        className="h-100 resource-card card-hover"
        role="button"
        tabIndex={0}
        onClick={goDetail}
        onKeyDown={(e) => e.key === 'Enter' && goDetail(e)}
        style={{
          backgroundColor: '#16213e',
          border: '1px solid #2d3748',
          borderRadius: '12px',
          transition: 'border-color 0.2s, transform 0.2s',
          cursor: 'pointer'
        }}
      >
        <Card.Body className="d-flex flex-column" style={{ position: 'relative' }}>
          {statusBadge && (
            <Badge
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '20px',
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 1,
                ...statusBadge.style
              }}
            >
              {statusBadge.text}
            </Badge>
          )}
          <div className="mb-2 d-flex align-items-start gap-2" style={{ paddingRight: statusBadge ? '120px' : '0' }}>
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
              : resource.description}
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
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/edit-resource/${resource._id || resource.id}`)
                  }}
                  className="flex-grow-1"
                >
                  <FiEdit className="me-1" />
                  Редагувати
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteResource?.(resource._id || resource.id)
                  }}
                >
                  <FiTrash2 />
                </Button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    )

    return cardInner
  }

  // default (legacy) layout — light card with title link
  return (
    <Card className="h-100 resource-card card-hover shadow-sm">
      <Card.Body className="d-flex flex-column">
        <Badge bg={getCategoryBadgeVariant(resource.category)} className="mb-2 align-self-start">
          {categories.find(c => c.value === resource.category)?.label || resource.category}
        </Badge>
        <Card.Title className="h6 mb-2">
          <Link to={`/resources/${resource._id || resource.id}`} className="text-decoration-none">
            {resource.title}
          </Link>
        </Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {resource.description?.length > 120 ? `${resource.description.substring(0, 120)}...` : resource.description}
        </Card.Text>
        <div className="mt-auto text-muted small">
          <FiUser className="me-1" />
          {resource.author?.firstName} {resource.author?.lastName}
        </div>
      </Card.Body>
    </Card>
  )
}

export default ResourceCard
