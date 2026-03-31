# Інструкція з інтеграції REST/GraphQL перемикача

## Що було додано

### 1. Контекст API (`src/contexts/ApiContext.jsx`)
- Глобальний стан для вибору між REST та GraphQL
- Зберігання вибору в localStorage
- Хуки `useApi()` для доступу до поточного режиму

### 2. Компонент перемикача (`src/components/ApiToggle.jsx`)
- Візуальний перемикач REST/GraphQL
- Вже додано в навігацію App.jsx

### 3. GraphQL клієнт (`src/services/graphqlClient.js`)
- Функція `graphqlRequest()` для виконання GraphQL запитів
- Готові queries та mutations для:
  - Ресурсів (resourceQueries)
  - Авторизації (authQueries)
  - Адміністрування (adminQueries)

### 4. Універсальний API сервіс (`src/services/apiService.js`)
- Єдиний інтерфейс для роботи з обома API
- Автоматичний вибір між REST та GraphQL на основі `apiMode`
- Функції:
  - `fetchResources()` - отримати ресурси
  - `createResource()` - створити ресурс
  - `updateResource()` - оновити ресурс
  - `deleteResource()` - видалити ресурс
  - `fetchAdminResources()` - адмін ресурси
  - `approveResource()` - схвалити ресурс
  - І багато інших...

## Як адаптувати існуючі компоненти

### Приклад 1: Сторінка Resources

**Було (тільки REST):**
```javascript
const { data } = useQuery({
  queryKey: ['resources'],
  queryFn: async () => {
    const response = await axios.get('/api/resources')
    return response.data
  }
})
```

**Стало (REST + GraphQL):**
```javascript
import { useApi } from '../contexts/ApiContext'
import { fetchResources } from '../services/apiService'

const { apiMode } = useApi()
const { token } = useAuth()

const { data } = useQuery({
  queryKey: ['resources', apiMode], // Додали apiMode в ключ
  queryFn: async () => {
    return await fetchResources(params, apiMode, token)
  }
})
```

### Приклад 2: Створення ресурсу

**Було:**
```javascript
const createMutation = useMutation({
  mutationFn: async (resourceData) => {
    return axios.post('/api/resources', resourceData)
  }
})
```

**Стало:**
```javascript
import { useApi } from '../contexts/ApiContext'
import { createResource } from '../services/apiService'

const { apiMode } = useApi()
const { token } = useAuth()

const createMutation = useMutation({
  mutationFn: async (resourceData) => {
    return await createResource(resourceData, apiMode, token)
  }
})
```

### Приклад 3: Адмін панель

**Було:**
```javascript
const { data } = useQuery({
  queryKey: ['admin-resources'],
  queryFn: async () => {
    const { data } = await axios.get('/api/admin/resources', { params })
    return data
  }
})
```

**Стало:**
```javascript
import { useApi } from '../contexts/ApiContext'
import { fetchAdminResources } from '../services/apiService'

const { apiMode } = useApi()
const { token } = useAuth()

const { data } = useQuery({
  queryKey: ['admin-resources', apiMode],
  queryFn: async () => {
    return await fetchAdminResources(params, apiMode, token)
  }
})
```

## Які файли потрібно оновити

### Обов'язкові:
1. ✅ `src/main.jsx` - додано ApiProvider (вже зроблено)
2. ✅ `src/App.jsx` - додано ApiToggle (вже зроблено)

### Рекомендовані для оновлення:
3. `src/pages/Resources.jsx` - замінити на ResourcesWithApi.jsx або адаптувати
4. `src/pages/CreateResource.jsx` - використати apiService
5. `src/pages/EditResource.jsx` - використати apiService
6. `src/pages/admin/AdminResources.jsx` - використати apiService
7. `src/pages/admin/AdminUsers.jsx` - використати apiService
8. `src/pages/admin/AdminDashboard.jsx` - використати apiService
9. `src/pages/Login.jsx` - використати apiService
10. `src/pages/Register.jsx` - використати apiService

## Швидкий старт

### Крок 1: Перевірте, що все працює
```bash
cd frontend
npm run dev
```

Перемикач REST/GraphQL має з'явитися в навігації.

### Крок 2: Протестуйте перемикання
1. Відкрийте DevTools → Network
2. Натисніть REST - побачите запити до `/api/resources`
3. Натисніть GraphQL - побачите запити до `/graphql`

### Крок 3: Адаптуйте компоненти
Використовуйте приклад `ResourcesWithApi.jsx` як шаблон.

## Важливі моменти

### 1. Query Keys
Завжди додавайте `apiMode` в queryKey:
```javascript
queryKey: ['resources', apiMode, page, category]
```

### 2. Токен авторизації
GraphQL потребує токен для захищених запитів:
```javascript
const { token } = useAuth()
await fetchResources(params, apiMode, token)
```

### 3. Обробка помилок
Обидва API повертають однаковий формат відповіді:
```javascript
{
  success: true/false,
  data: {...},
  message: "..."
}
```

### 4. Invalidation
При зміні apiMode автоматично інвалідуються всі запити:
```javascript
queryClient.invalidateQueries({ queryKey: ['resources'] })
```

## Тестування

### REST API
```bash
# Отримати ресурси
curl http://localhost:5001/api/resources

# Створити ресурс (з токеном)
curl -X POST http://localhost:5001/api/resources \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","category":"technology"}'
```

### GraphQL API
```bash
# Отримати ресурси
curl -X POST http://localhost:5001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { resources(filter: {page: 1, limit: 10}) { success resources { id title } } }"}'

# Створити ресурс (з токеном)
curl -X POST http://localhost:5001/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createResource(input: {title:\"Test\",description:\"Test\",category:\"technology\"}) { success resource { id } } }"}'
```

## Troubleshooting

### Проблема: GraphQL повертає помилку авторизації
**Рішення:** Переконайтеся, що передаєте токен:
```javascript
await fetchResources(params, apiMode, token)
```

### Проблема: Дані не оновлюються при перемиканні
**Рішення:** Додайте `apiMode` в queryKey:
```javascript
queryKey: ['resources', apiMode]
```

### Проблема: CORS помилка з GraphQL
**Рішення:** Перевірте, що backend дозволяє GraphQL запити (вже налаштовано в server.js)

## Наступні кроки

1. Замініть `Resources.jsx` на `ResourcesWithApi.jsx` в App.jsx
2. Адаптуйте інші компоненти за тим самим принципом
3. Протестуйте всі функції в обох режимах
4. Видаліть старі файли після успішного тестування

## Підтримка

Якщо виникають питання:
1. Перевірте консоль браузера на помилки
2. Перевірте Network tab на запити
3. Порівняйте з прикладом ResourcesWithApi.jsx
