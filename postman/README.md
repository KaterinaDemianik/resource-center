# 📮 Postman Колекція - Resource Center API

## 📥 Імпорт колекції

1. Відкрийте Postman
2. Натисніть **Import** у верхньому лівому куті
3. Перетягніть файл `Resource-Center-API.postman_collection.json` або виберіть його
4. Натисніть **Import**

## 🔧 Налаштування

### Змінні колекції

Колекція використовує дві змінні:
- `{{token}}` - JWT токен звичайного користувача
- `{{admin_token}}` - JWT токен адміністратора

### Як отримати токени:

1. **Для звичайного користувача:**
   - Виконайте запит `Auth > Login`
   - Скопіюйте `token` з відповіді
   - Встановіть змінну `token` в колекції

2. **Для адміністратора:**
   - Виконайте запит `Auth > Login` з credentials:
     ```json
     {
       "email": "admin@example.com",
       "password": "password123"
     }
     ```
   - Скопіюйте `token` з відповіді
   - Встановіть змінну `admin_token` в колекції

## 📁 Структура колекції

### 1️⃣ **Auth** - Авторизація та реєстрація
- `Register` - Реєстрація нового користувача
- `Login` - Авторизація (отримання JWT токену)
- `Verify Email` - Підтвердження email адреси
- `Get Current User` - Інформація про поточного користувача
- `Upload Avatar` - Завантаження аватара
- `Change Password` - Зміна паролю

### 2️⃣ **Resources** - Управління ресурсами
- `Get All Resources` - Список всіх ресурсів (публічний)
  - Підтримує пагінацію: `?page=1&limit=10`
  - Фільтрація: `?category=education`
  - Пошук: `?search=навчання`
- `Get Resource by ID` - Деталі ресурсу
- `Create Resource` - Створення ресурсу (потребує авторизації)
- `Update Resource` - Оновлення ресурсу (тільки автор)
- `Delete Resource` - Видалення ресурсу (тільки автор)
- `Get My Resources` - Ресурси поточного користувача

### 3️⃣ **Admin** - Адміністративні функції
- `Get Admin Stats` - Статистика системи
- `Get Admin Resources` - Ресурси для модерації
  - `?status=pending` - на модерації
  - `?status=approved` - схвалені
  - `?status=rejected` - відхилені
  - `?status=all` - всі
- `Approve Resource` - Схвалити ресурс
- `Reject Resource` - Відхилити ресурс
- `Toggle Resource Active` - Активувати/деактивувати
- `Delete Resource (Admin)` - Видалити ресурс
- `Get Admin Users` - Список користувачів
- `Toggle User Active` - Активувати/деактивувати користувача

### 4️⃣ **GraphQL** - GraphQL API
- `GraphQL - Get Resources` - Отримання ресурсів через GraphQL
- `GraphQL - Register` - Реєстрація через GraphQL
- `GraphQL - Login` - Авторизація через GraphQL
- `GraphQL - Create Resource` - Створення ресурсу через GraphQL
- `GraphQL - Admin Stats` - Статистика через GraphQL

## 🚀 Швидкий старт

### Крок 1: Реєстрація
```
POST /api/auth/register
{
  "firstName": "Іван",
  "lastName": "Петренко",
  "email": "ivan@gmail.com",
  "password": "password123"
}
```

### Крок 2: Авторизація
```
POST /api/auth/login
{
  "email": "ivan@gmail.com",
  "password": "password123"
}
```

### Крок 3: Збережіть токен
Скопіюйте `token` з відповіді та встановіть змінну `{{token}}`

### Крок 4: Створіть ресурс
```
POST /api/resources
Authorization: Bearer {{token}}
{
  "title": "Мій ресурс",
  "description": "Опис ресурсу",
  "category": "education",
  "tags": ["навчання"],
  "url": "https://example.com"
}
```

## 📊 Категорії ресурсів

- `education` - Освіта
- `technology` - Технології
- `health` - Здоров'я
- `business` - Бізнес
- `entertainment` - Розваги
- `other` - Інше

## 🔐 Авторизація

Більшість endpoints потребують JWT токен в заголовку:
```
Authorization: Bearer your-jwt-token-here
```

## 🎯 GraphQL Playground

Для тестування GraphQL запитів відкрийте:
```
http://localhost:5001/graphql
```

### Приклад GraphQL запиту:
```graphql
query GetResources {
  resources(filter: { category: "education", page: 1, limit: 10 }) {
    success
    resources {
      id
      title
      description
      category
      author {
        firstName
        lastName
      }
    }
    total
  }
}
```

### Приклад GraphQL мутації:
```graphql
mutation CreateResource {
  createResource(input: {
    title: "Новий ресурс"
    description: "Опис"
    category: "education"
    tags: ["навчання"]
  }) {
    success
    message
    resource {
      id
      title
    }
  }
}
```

## ⚠️ Важливо

1. **Базова URL**: `http://localhost:5001`
2. **Порт бекенду**: `5001`
3. **Адмін credentials**:
   - Email: `admin@example.com`
   - Password: `password123`

## 🐛 Troubleshooting

### Помилка 401 Unauthorized
- Перевірте чи токен встановлено в змінних колекції
- Перевірте чи токен не застарів (виконайте login знову)

### Помилка 403 Forbidden
- Endpoint потребує прав адміністратора
- Використайте `{{admin_token}}` замість `{{token}}`

### Помилка 404 Not Found
- Перевірте чи сервер запущено на порту 5001
- Перевірте правильність URL

### Помилка 500 Internal Server Error
- Перевірте логи сервера
- Перевірте чи MongoDB підключено

## 📝 Додаткова інформація

- REST API документація: `/api/*`
- GraphQL endpoint: `/graphql`
- GraphQL Playground: `http://localhost:5001/graphql`
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`

## 🎓 Тестування

Рекомендований порядок тестування:

1. ✅ Auth endpoints (Register → Login)
2. ✅ Resources endpoints (Get All → Create → Update → Delete)
3. ✅ Admin endpoints (Stats → Approve/Reject)
4. ✅ GraphQL queries та mutations

---

**Проєкт**: Ресурсний Центр  
**Версія API**: 1.0  
**Дата**: 2026
