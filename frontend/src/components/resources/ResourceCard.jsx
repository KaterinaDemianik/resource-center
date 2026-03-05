import React from 'react'
import { Card, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FiEye, FiCalendar, FiUser, FiExternalLink } from 'react-icons/fi'

const ResourceCard = ({ resource }) => {
  const categories = {
    education: { label: 'Освіта', variant: 'primary' },
    technology: { label: 'Технології', variant: 'info' },
    health: { label: 'Здоров\'я', variant: 'success' },
    business: { label: 'Бізнес', variant: 'warning' },
    entertainment: { label: 'Розваги', variant: 'danger' },
    other: { label: 'Інше', variant: 'secondary' }
  }

  const categoryInfo = categories[resource.category] || categories.other

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Card className="h-100 resource-card card-hover shadow-sm">
      <Card.Body className="d-flex flex-column">
        {/* Category Badge */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Badge bg={categoryInfo.variant} className="category-badge">
            {categoryInfo.label}
          </Badge>
          {resource.url && (
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted"
              title="Відкрити посилання"
            >
              <FiExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Title */}
        <Card.Title className="h6 mb-2">
          <Link 
            to={`/resources/${resource._id || resource.id}`}
            className="text-decoration-none text-dark stretched-link"
          >
            {truncateText(resource.title, 60)}
          </Link>
        </Card.Title>

        {/* Description */}
        <Card.Text className="text-muted small flex-grow-1 mb-3">
          {truncateText(resource.description, 120)}
        </Card.Text>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="mb-3">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                bg="light" 
                text="dark" 
                className="me-1 mb-1 border"
              >
                #{tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge bg="light" text="muted" className="border">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-auto pt-2 border-top">
          <div className="d-flex justify-content-between align-items-center text-muted small">
            <span className="d-flex align-items-center">
              <FiUser className="me-1" size={14} />
              {resource.author?.firstName} {resource.author?.lastName}
            </span>
            <span className="d-flex align-items-center">
              <FiEye className="me-1" size={14} />
              {resource.views || 0}
            </span>
          </div>
          <div className="text-muted small mt-1">
            <FiCalendar className="me-1" size={12} />
            {formatDate(resource.createdAt)}
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ResourceCard
