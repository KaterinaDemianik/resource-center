import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
  verifyEmail: (token) => api.get(`/api/auth/verify-email/${token}`)
}

// Resources API
export const resourcesAPI = {
  getAll: (params) => api.get('/api/resources', { params }),
  getById: (id) => api.get(`/api/resources/${id}`),
  create: (data) => api.post('/api/resources', data),
  update: (id, data) => api.put(`/api/resources/${id}`, data),
  delete: (id) => api.delete(`/api/resources/${id}`),
  getMyResources: (params) => api.get('/api/resources/user/my-resources', { params })
}

// Admin API
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getResources: (params) => api.get('/api/admin/resources', { params }),
  approveResource: (id) => api.patch(`/api/admin/resources/${id}/approve`),
  rejectResource: (id) => api.patch(`/api/admin/resources/${id}/reject`),
  toggleResourceActive: (id) => api.patch(`/api/admin/resources/${id}/toggle-active`),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  toggleUserActive: (id) => api.patch(`/api/admin/users/${id}/toggle-active`)
}

// GraphQL API
export const graphqlAPI = {
  query: (query, variables = {}) => 
    api.post('/graphql', { query, variables }),
  
  // Predefined queries
  getResources: (filter = {}) => 
    api.post('/graphql', {
      query: `
        query GetResources($filter: ResourceFilterInput) {
          resources(filter: $filter) {
            success
            resources {
              id
              title
              description
              category
              tags
              url
              views
              author { firstName lastName }
              createdAt
            }
            total
            pages
          }
        }
      `,
      variables: { filter }
    }),

  getResource: (id) =>
    api.post('/graphql', {
      query: `
        query GetResource($id: ID!) {
          resource(id: $id) {
            success
            message
            resource {
              id
              title
              description
              category
              tags
              url
              views
              author { firstName lastName }
              isApproved
              createdAt
              updatedAt
            }
          }
        }
      `,
      variables: { id }
    }),

  createResource: (input) =>
    api.post('/graphql', {
      query: `
        mutation CreateResource($input: ResourceInput!) {
          createResource(input: $input) {
            success
            message
            resource { id title }
          }
        }
      `,
      variables: { input }
    }),

  login: (input) =>
    api.post('/graphql', {
      query: `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            success
            message
            token
            user { id firstName lastName email role }
          }
        }
      `,
      variables: { input }
    })
}

export default api
