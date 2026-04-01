# Ресурсний центр

 Веб-застосунок для обміну освітніми та корисними ресурсами з підтримкою авторизації, управління контентом та адміністративною панеллю

## Особливості

- **Авторизація та реєстрація** з підтвердженням email
- **CRUD операції** для ресурсів з модерацією
- **Пошук та фільтрація** ресурсів за категоріями
- **Адміністративна панель** для управління контентом та користувачами
- **Responsive дизайн** з Bootstrap
- **Валідація даних** на клієнті та сервері
- **RESTful API** та **GraphQL API** (дві версії)

## Технології

### Backend
- **Node.js** + **Express.js**
- **MongoDB** з Mongoose
- **JWT** для авторизації
- **Bcrypt** для хешування паролів
- **Nodemailer** для відправки email
- **Express-validator** для валідації
- **GraphQL** + **express-graphql** для GraphQL API

### Frontend
- **React 18** з Hooks
- **React Router** для маршрутизації
- **React Query** для управління станом сервера
- **React Hook Form** для форм
- **Bootstrap 5** + **React Bootstrap**
- **Axios** для HTTP запитів
- **Vite** як збірник

## Передумови

Переконайтеся, що у вас встановлено:
- **Node.js** (версія 16 або новіша)
- **npm** або **yarn**
- **MongoDB** (локально або MongoDB Atlas)

## Встановлення та запуск

### 1. Клонування репозиторію
```bash
git clone <repository-url>
cd "Ресурсний центр"
```

### 2. Налаштування Backend

```bash
# Перейти до папки backend
cd backend

# Встановити залежності
npm install

# Створити .env файл
cp .env.example .env


```bash
# Запустити сервер в режимі розробки
npm run dev
```

### 3. Налаштування Frontend

```bash
# Перейти до папки frontend (в новому терміналі)
cd frontend

# Встановити залежності
npm install

# Запустити клієнт в режимі розробки
npm run dev
```

### 4. Доступ до застосунку

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **GraphQL Playground**: http://localhost:5001/graphql
- **API Health Check**: http://localhost:5001/api/health

## API Документація

### Авторизація
- `POST /api/auth/register` - Реєстрація користувача
- `POST /api/auth/login` - Вхід користувача
- `POST /api/auth/logout` - Вихід користувача
- `GET /api/auth/me` - Отримати поточного користувача
- `GET /api/auth/verify-email/:token` - Підтвердити email

### Ресурси
- `GET /api/resources` - Отримати список ресурсів (з пагінацією, пошуком, фільтрацією)
- `GET /api/resources/:id` - Отримати конкретний ресурс
- `POST /api/resources` - Створити новий ресурс (авторизовані користувачі)
- `PUT /api/resources/:id` - Оновити ресурс (автор або адмін)
- `DELETE /api/resources/:id` - Видалити ресурс (автор або адмін)
- `GET /api/resources/user/my-resources` - Отримати ресурси користувача

### Адміністрування
- `GET /api/admin/stats` - Статистика для адмін панелі
- `GET /api/admin/resources` - Всі ресурси для модерації
- `PATCH /api/admin/resources/:id/approve` - Схвалити ресурс
- `PATCH /api/admin/resources/:id/reject` - Відхилити ресурс
- `PATCH /api/admin/resources/:id/toggle-active` - Активувати/деактивувати ресурс
- `GET /api/admin/users` - Список користувачів
- `PATCH /api/admin/users/:id/toggle-active` - Активувати/деактивувати користувача

### GraphQL API
- **Endpoint**: `POST /graphql`
- **GraphiQL**: http://localhost:5001/graphql (в режимі розробки)

Приклади запитів:
```graphql
# Отримати ресурси
query {
  resources(filter: { page: 1, limit: 10, category: "education" }) {
    success
    resources { id title description category }
    total
  }
}

# Створити ресурс (для цього потрібна авторизація)
mutation {
  createResource(input: {
    title: "Новий ресурс"
    description: "Опис"
    category: "technology"
  }) {
    success
    resource { id title }
  }
}
```

## Тестування API (Postman)


Імпортуйте колекцію з `postman/Resource-Center-API.postman_collection.json` для тестування всіх endpoints.

## Структура проекту

```
Ресурсний центр/
├── backend/
│   ├── config/          # Конфігурація БД
│   ├── graphql/         # GraphQL схема та резолвери
│   ├── middleware/      # Middleware функції
│   ├── models/          # Mongoose моделі
│   ├── routes/          # Express маршрути (RESTful)
│   ├── utils/           # Допоміжні утиліти
│   ├── server.js        # Головний файл сервера
│   └── package.json
├── postman/             # Postman колекція для тестування
├── frontend/
│   ├── src/
│   │   ├── components/  # React компоненти
│   │   ├── contexts/    # React контексти
│   │   ├── pages/       # Сторінки застосунку
│   │   ├── services/    # API сервіси
│   │   ├── App.jsx      # Головний компонент
│   │   └── main.jsx     # Точка входу
│   ├── index.html
│   └── package.json
└── README.md
```

## Ролі користувачів

### Звичайний користувач
- Реєстрація та авторизація 
- Перегляд ресурсів
- Пошук та фільтрація
- Додавання власних ресурсів
- Редагування власних ресурсів

### Адміністратор
- Всі можливості користувача
- Модерація ресурсів (схвалення/відхилення)
- Управління користувачами
- Активація/деактивація ресурсів
- Перегляд статистики

##  Безпека

- Паролі хешуються за допомогою bcrypt
- JWT токени для авторизації
- Валідація даних на сервері
- Захищені маршрути
- CORS налаштування
- Helmet для безпеки заголовків