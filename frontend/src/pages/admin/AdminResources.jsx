import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Container, Table, Badge, Button, Form, InputGroup, Pagination, Alert, Nav } from 'react-bootstrap';
import { FiSearch, FiToggleLeft, FiToggleRight, FiTrash2, FiBook, FiClock, FiCheckCircle } from 'react-icons/fi';

const fetchResources = async ({ page, search, status }) => {
  const token = localStorage.getItem('token');
  const { data } = await axios.get('/api/admin/resources', {
    params: { page, limit: 15, search, status },
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const AdminResources = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-resources', page, search],
    queryFn: () => fetchResources({ page, search, status: 'pending' }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      return axios.patch(`/api/admin/resources/${id}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      // Інвалідуємо всі пов'язані запити для автоматичного оновлення
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] }); // Оновити публічний список ресурсів
      queryClient.invalidateQueries({ queryKey: ['userResources'] }); // Оновити ресурси користувача
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      return axios.delete(`/api/admin/resources/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      // Інвалідуємо всі пов'язані запити для автоматичного оновлення
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] }); // Оновити публічний список ресурсів
      queryClient.invalidateQueries({ queryKey: ['userResources'] }); // Оновити ресурси користувача
    },
  });

  const cardStyle = { 
    backgroundColor: '#16213e', 
    border: '1px solid #2d3748', 
    borderRadius: '12px', 
    padding: '1.5rem'
  };

  const categoryMap = {
    education: 'Освіта',
    health: "Здоров'я",
    business: 'Бізнес',
    entertainment: 'Розваги',
    technology: 'Технології',
    other: 'Інше'
  };

  const getCategoryBadgeVariant = (category) => {
    const variants = {
      education: 'primary',
      technology: 'info',
      health: 'success',
      business: 'warning',
      entertainment: 'danger',
      other: 'secondary'
    };
    return variants[category] || 'secondary';
  };

  return (
    <Container style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem' 
      }}>
        <h2 style={{ color: '#e2e8f0', fontWeight: 600, margin: 0 }}>
          Управління ресурсами
        </h2>
        <Badge style={{ 
          backgroundColor: '#7c3aed',
          fontSize: '13px', 
          padding: '6px 12px' 
        }}>
          {data?.data?.pagination?.total || 0} всього
        </Badge>
      </div>

      {error && (
        <Alert variant="danger" style={{ marginBottom: '1rem' }}>
          Помилка завантаження: {error.message}
        </Alert>
      )}

      <div style={cardStyle}>
        <InputGroup style={{ marginBottom: '1.5rem' }}>
          <InputGroup.Text style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            border: '1px solid #2d3748', 
            borderRight: 'none',
            color: '#94a3b8' 
          }}>
            <FiSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Пошук ресурсів..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              border: '1px solid #2d3748', 
              color: '#e2e8f0',
              borderRadius: '8px'
            }}
          />
        </InputGroup>

        {isLoading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
            Завантаження...
          </p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <Table responsive style={{ color: '#e2e8f0', marginBottom: 0 }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#0d0d1a', 
                    color: '#94a3b8', 
                    fontSize: '13px', 
                    borderColor: '#2d3748' 
                  }}>
                    <th style={{ padding: '12px' }}>Назва</th>
                    <th style={{ padding: '12px' }}>Категорія</th>
                    <th style={{ padding: '12px' }}>Автор</th>
                    <th style={{ padding: '12px' }}>Схвалено</th>
                    <th style={{ padding: '12px' }}>Статус</th>
                    <th style={{ padding: '12px' }}>Дата</th>
                    <th style={{ padding: '12px' }}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.resources?.map(resource => (
                    <tr key={resource._id} style={{ borderColor: '#2d3748', backgroundColor: 'transparent' }}>
                      <td style={{ maxWidth: '250px', padding: '12px' }}>
                        <div style={{ 
                          color: '#e2e8f0', 
                          fontWeight: 500, 
                          fontSize: '14px',
                          marginBottom: '4px'
                        }}>
                          {resource.title}
                        </div>
                        <small style={{ color: '#64748b', fontSize: '12px' }}>
                          {resource.description?.substring(0, 60)}...
                        </small>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Badge bg={getCategoryBadgeVariant(resource.category)} style={{ fontWeight: 400 }}>
                          {categoryMap[resource.category] || resource.category}
                        </Badge>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '13px', padding: '12px' }}>
                        {resource.author?.firstName} {resource.author?.lastName}
                      </td>
                      <td>
                        <Badge bg={resource.isApproved ? 'success' : 'warning'}>
                          {resource.isApproved ? 'Так' : 'Ні'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={resource.isActive ? 'success' : 'danger'}>
                          {resource.isActive ? 'Активний' : 'Неактивний'}
                        </Badge>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '13px', padding: '12px' }}>
                        {new Date(resource.createdAt).toLocaleDateString('uk-UA')}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            size="sm"
                            variant={resource.isActive ? 'warning' : 'success'}
                            onClick={() => toggleMutation.mutate(resource._id)}
                            disabled={toggleMutation.isPending}
                          >
                            {resource.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => {
                              if (window.confirm('Видалити ресурс назавжди?')) {
                                deleteMutation.mutate(resource._id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {data?.data?.pagination && data.data.pagination.totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '1.5rem' 
              }}>
                <Pagination>
                  <Pagination.Prev 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  />
                  {[...Array(data.data.pagination.totalPages)].map((_, idx) => (
                    <Pagination.Item
                      key={idx + 1}
                      active={page === idx + 1}
                      onClick={() => setPage(idx + 1)}
                    >
                      {idx + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={page === data.data.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
};

export default AdminResources;
