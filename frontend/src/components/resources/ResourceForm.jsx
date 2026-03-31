import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Badge, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { FiPlus, FiX, FiSave } from 'react-icons/fi'

const ResourceForm = ({
  initialData = null,
  onSubmit,
  isLoading = false,
  submitLabel = 'Зберегти',
  mode = 'create',
  /** Якщо true — не показувати інфо про модерацію (наприклад, створення адміном з авто-схваленням). */
  hideModerationNotice = false
}) => {
  const [tags, setTags] = useState(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || 'other',
      url: initialData?.url || ''
    }
  })

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'other',
        url: initialData.url || ''
      })
      setTags(Array.isArray(initialData.tags) ? initialData.tags : [])
    }
  }, [initialData, reset])

  const categories = [
    { value: 'education', label: 'Освіта' },
    { value: 'technology', label: 'Технології' },
    { value: 'health', label: 'Здоров\'я' },
    { value: 'business', label: 'Бізнес' },
    { value: 'entertainment', label: 'Розваги' },
    { value: 'other', label: 'Інше' }
  ]

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const onFormSubmit = (data) => {
    onSubmit({ ...data, tags })
  }

  return (
    <Form onSubmit={handleSubmit(onFormSubmit)}>
      {/* Title */}
      <Form.Group className="mb-3">
        <Form.Label>Назва ресурсу *</Form.Label>
        <Form.Control
          type="text"
          placeholder="Введіть назву ресурсу"
          {...register('title', {
            required: 'Назва обов\'язкова',
            maxLength: {
              value: 200,
              message: 'Назва не може перевищувати 200 символів'
            }
          })}
          isInvalid={!!errors.title}
        />
        <Form.Control.Feedback type="invalid">
          {errors.title?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Description */}
      <Form.Group className="mb-3">
        <Form.Label>Опис *</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Детальний опис ресурсу"
          {...register('description', {
            required: 'Опис обов\'язковий',
            maxLength: {
              value: 1000,
              message: 'Опис не може перевищувати 1000 символів'
            }
          })}
          isInvalid={!!errors.description}
        />
        <Form.Control.Feedback type="invalid">
          {errors.description?.message}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Максимум 1000 символів
        </Form.Text>
      </Form.Group>

      {/* Category */}
      <Form.Group className="mb-3">
        <Form.Label>Категорія *</Form.Label>
        <Form.Select
          {...register('category', {
            required: 'Оберіть категорію'
          })}
          isInvalid={!!errors.category}
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.category?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* URL */}
      <Form.Group className="mb-3">
        <Form.Label>Посилання (URL)</Form.Label>
        <Form.Control
          type="url"
          placeholder="https://example.com"
          {...register('url', {
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'Введіть коректний URL (починається з http:// або https://)'
            }
          })}
          isInvalid={!!errors.url}
        />
        <Form.Control.Feedback type="invalid">
          {errors.url?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Tags */}
      <Form.Group className="mb-4">
        <Form.Label>Теги</Form.Label>
        <Row className="g-2">
          <Col>
            <Form.Control
              type="text"
              placeholder="Додати тег"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={30}
            />
          </Col>
          <Col xs="auto">
            <Button 
              variant="outline-primary" 
              onClick={handleAddTag}
              disabled={!tagInput.trim() || tags.length >= 10}
            >
              <FiPlus />
            </Button>
          </Col>
        </Row>
        <Form.Text className="text-muted">
          Натисніть Enter або кнопку + для додавання тегу (максимум 10)
        </Form.Text>
        
        {tags.length > 0 && (
          <div className="mt-2">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                bg="primary" 
                className="me-2 mb-2 d-inline-flex align-items-center"
              >
                #{tag}
                <FiX 
                  className="ms-1" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </Form.Group>

      {/* Info Alert — лише для створення */}
      {mode === 'create' && !hideModerationNotice && (
        <Alert variant="info" className="mb-4">
          <small>
            Після створення ресурс буде надіслано на модерацію.
            Він стане видимим для інших користувачів після схвалення адміністратором.
          </small>
        </Alert>
      )}
      {mode === 'edit' && (
        <Alert variant="warning" className="mb-4">
          <small>
            Після зміни назви, опису або посилання ресурс знову потрапить на модерацію.
          </small>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="d-grid gap-2">
        <Button 
          variant="primary" 
          type="submit" 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>Збереження...</>
          ) : (
            <>
              <FiSave className="me-2" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </Form>
  )
}

export default ResourceForm
