import React from 'react'
import { Row, Col, Spinner, Alert, Button } from 'react-bootstrap'
import ResourceCard from './ResourceCard'

const ResourceList = ({
  resources,
  isLoading,
  error,
  onRetry,
  emptyMessage = 'Ресурси не знайдені',
  layout = 'default',
  activeTab = 'all',
  onDeleteResource,
  categories
}) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Завантаження...</span>
        </Spinner>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        <Alert.Heading>Помилка завантаження</Alert.Heading>
        <p>Не вдалося завантажити ресурси. Спробуйте пізніше.</p>
        {onRetry && (
          <Button variant="outline-danger" onClick={onRetry}>
            Спробувати знову
          </Button>
        )}
      </Alert>
    )
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted">{emptyMessage}</h5>
        <p className="text-muted">Спробуйте змінити критерії пошуку</p>
      </div>
    )
  }

  return (
    <Row className="g-4">
      {resources.map((resource) => (
        <Col md={6} xl={4} key={resource._id || resource.id}>
          <ResourceCard
            resource={resource}
            layout={layout}
            activeTab={activeTab}
            onDeleteResource={onDeleteResource}
            categories={categories}
          />
        </Col>
      ))}
    </Row>
  )
}

export default ResourceList
