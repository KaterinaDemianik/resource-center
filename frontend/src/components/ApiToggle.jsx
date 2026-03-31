import React from 'react'
import { ButtonGroup, Button } from 'react-bootstrap'
import { useApi } from '../contexts/ApiContext'

const ApiToggle = () => {
  const { apiMode, toggleApiMode } = useApi()

  return (
    <ButtonGroup size="sm" style={{ marginRight: '1rem' }}>
      <Button
        variant={apiMode === 'rest' ? 'light' : 'outline-light'}
        onClick={() => apiMode !== 'rest' && toggleApiMode()}
        style={{
          fontWeight: apiMode === 'rest' ? 600 : 400,
          color: apiMode === 'rest' ? '#0d0d1a' : '#94a3b8',
          borderColor: '#2d3748'
        }}
      >
        REST
      </Button>
      <Button
        variant={apiMode === 'graphql' ? 'success' : 'outline-light'}
        onClick={() => apiMode !== 'graphql' && toggleApiMode()}
        style={{
          fontWeight: apiMode === 'graphql' ? 600 : 400,
          color: apiMode === 'graphql' ? '#fff' : '#94a3b8',
          borderColor: '#2d3748',
          backgroundColor: apiMode === 'graphql' ? '#28a745' : 'transparent'
        }}
      >
        GraphQL
      </Button>
    </ButtonGroup>
  )
}

export default ApiToggle
