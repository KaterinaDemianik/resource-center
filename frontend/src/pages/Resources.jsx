import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button, Tabs, Tab } from 'react-bootstrap'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { FiSearch, FiFilter } from 'react-icons/fi'
import broadcastSync, { SYNC_EVENTS } from '../utils/broadcastSync'
import ResourceList from '../components/resources/ResourceList'
import './Resources.css'
import { useAuth } from '../contexts/AuthContext.jsx'

const categories = [
  { value: '', label: 'Всі категорії' },
  { value: 'education', label: 'Освіта' },
  { value: 'technology', label: 'Технології' },
  { value: 'health', label: 'Здоров\'я' },
  { value: 'business', label: 'Бізнес' },
  { value: 'entertainment', label: 'Розваги' },
  { value: 'other', label: 'Інше' }
]

const Resources = () => {
  const { token } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const queryClient = useQueryClient()

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
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '12'
    })

    const response = await axios.get(`/api/resources/user/my-resources?${params}`)
    return response.data
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resources', currentPage, selectedCategory, searchTerm, activeTab],
    queryFn: activeTab === 'my' ? fetchMyResources : fetchResources,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: activeTab === 'all' || (activeTab === 'my' && !!token)
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
      return axios.delete(`/api/resources/${resourceId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      broadcastSync.broadcast(SYNC_EVENTS.RESOURCE_DELETED, {})
      alert('Ресурс успішно видалено!')
    },
    onError: (err) => {
      alert('Помилка видалення ресурсу: ' + (err.response?.data?.message || 'Невідома помилка'))
    }
  })

  const handleDeleteResource = (resourceId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей ресурс?')) {
      deleteMutation.mutate(resourceId)
    }
  }

  return (
    <>
      <section style={{
        background: 'linear-gradient(180deg, #1e1535 0%, #16213e 60%, #0d0d1a 100%)',
        padding: '3rem 0',
        marginBottom: '2rem'
      }}
      >
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
          <Tab eventKey="all" title="Усі ресурси" tabClassName="text-light" />
          <Tab eventKey="my" title="Мої ресурси" tabClassName="text-light" disabled={!token} />
        </Tabs>
      </Container>

      <Container className="py-3">
        <Row>
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

          <Col lg={9}>
            <ResourceList
              resources={data?.data?.resources}
              isLoading={isLoading}
              error={error}
              onRetry={() => refetch()}
              layout="grid"
              activeTab={activeTab}
              onDeleteResource={handleDeleteResource}
              categories={categories}
            />

            {data?.data?.pagination?.pages > 1 && !isLoading && !error && (
              <div className="pagination-container">
                <Button
                  variant="outline-primary"
                  disabled={!data.data.pagination.hasPrev}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
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
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="ms-2"
                >
                  Наступна
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Resources
