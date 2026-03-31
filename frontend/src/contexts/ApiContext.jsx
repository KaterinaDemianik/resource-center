import React, { createContext, useContext, useState, useEffect } from 'react'

const ApiContext = createContext()

export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within ApiProvider')
  }
  return context
}

export const ApiProvider = ({ children }) => {
  const [apiMode, setApiMode] = useState(() => {
    return localStorage.getItem('apiMode') || 'rest'
  })

  useEffect(() => {
    localStorage.setItem('apiMode', apiMode)
  }, [apiMode])

  const toggleApiMode = () => {
    setApiMode(prev => prev === 'rest' ? 'graphql' : 'rest')
  }

  const isRest = apiMode === 'rest'
  const isGraphQL = apiMode === 'graphql'

  return (
    <ApiContext.Provider value={{ apiMode, toggleApiMode, isRest, isGraphQL }}>
      {children}
    </ApiContext.Provider>
  )
}
