import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Container, Table, Badge, Button, Alert } from 'react-bootstrap';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const fetchUsers = async ({ page }) => {
  const token = localStorage.getItem('token');
  const { data } = await axios.get('/api/admin/users', {
    params: { page, limit: 20 },
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const AdminUsers = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => fetchUsers({ page }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      return axios.patch(`/api/admin/users/${id}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      // Інвалідуємо всі пов'язані запити для автоматичного оновлення
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] }); // Оновити ресурси (автор може бути деактивований)
    },
  });

  const cardStyle = { 
    backgroundColor: '#16213e', 
    border: '1px solid #2d3748', 
    borderRadius: '12px', 
    padding: '1.5rem' 
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
          Управління користувачами
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
        {isLoading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
            Завантаження...
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table responsive style={{ color: '#e2e8f0', marginBottom: 0 }}>
              <thead>
                <tr style={{ 
                  borderColor: '#2d3748', 
                  color: '#94a3b8', 
                  fontSize: '13px' 
                }}>
                  <th>Ім'я</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Email підтверджено</th>
                  <th>Статус</th>
                  <th>Дата реєстрації</th>
                  <th>Дія</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.users?.map(user => (
                  <tr key={user._id} style={{ borderColor: '#2d3748' }}>
                    <td style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '14px' }}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '13px' }}>
                      {user.email}
                    </td>
                    <td>
                      <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                        {user.role === 'admin' ? 'Адмін' : 'Користувач'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={user.emailVerified ? 'success' : 'warning'}>
                        {user.emailVerified ? 'Так' : 'Ні'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Активний' : 'Неактивний'}
                      </Badge>
                    </td>
                    <td style={{ color: '#475569', fontSize: '12px' }}>
                      {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={user.isActive ? 'outline-warning' : 'outline-success'}
                        onClick={() => toggleMutation.mutate(user._id)}
                        disabled={toggleMutation.isPending}
                        style={{ fontSize: '12px' }}
                      >
                        {user.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </Container>
  );
};

export default AdminUsers;
