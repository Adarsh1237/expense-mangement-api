# Expense Management API

A REST API for managing users and their expenses — user CRUD, expense CRUD, filtering, pagination, date-range filtering, and expense summaries.

## Tech Stack
- Node.js + Express.js
- MySQL + Sequelize ORM
- Joi (validation)
- dotenv (config)

Everything (config, models, validation, services, controllers, routes, error handling) lives in a single `server.js` file.

## Prerequisites
- Node.js installed
- MySQL installed and running

## Setup

### 1. Install dependencies
```bash
npm install express sequelize mysql2 dotenv joi
```

### 2. Create the database
Log into MySQL and create the database:
```bash
mysql -u root -p
```
```sql
CREATE DATABASE expense_management;
```

### 3. Configure environment variables
Create a `.env` file in the same folder as `server.js`:
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Adarsh@123
DB_NAME=expense_management
```

### 4. Run the server
```bash
node server.js
```

You should see:
```
Database connection established.
Models synchronized.
Server running on port 3000
```

Tables (`users`, `expenses`) are created automatically on first run via `sequelize.sync()` — no manual migration needed.

## API Reference

### Users

| Method | Endpoint     | Description     |
|--------|--------------|------------------|
| POST   | `/users`     | Create a user    |
| GET    | `/users`     | List all users   |
| GET    | `/users/:id` | Get user by ID   |

**Create user**
```
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Expenses

| Method | Endpoint            | Description                                |
|--------|---------------------|---------------------------------------------|
| POST   | `/expenses`          | Create an expense                           |
| GET    | `/expenses`          | List expenses (filter + paginate)           |
| GET    | `/expenses/summary`  | Get expense summary (total + by category)   |
| GET    | `/expenses/:id`      | Get expense by ID                           |
| PUT    | `/expenses/:id`      | Update an expense                           |
| DELETE | `/expenses/:id`      | Delete an expense                           |

**Create expense**
```
POST /expenses
Content-Type: application/json

{
  "userId": 1,
  "title": "Lunch",
  "amount": 350,
  "category": "Food",
  "description": "Lunch with friends"
}
```

**Filtering & pagination**
```
GET /expenses?page=1&limit=10
GET /expenses?userId=1&category=Food
GET /expenses?fromDate=2026-08-01&toDate=2026-08-21
GET /expenses/summary?userId=1&fromDate=2026-08-01&toDate=2026-08-21
```

**Update expense**
```
PUT /expenses/1
Content-Type: application/json

{
  "title": "Dinner",
  "amount": 500,
  "category": "Food"
}
```

## Response Formats

**Success**
```json
{ "success": true, "data": {} }
```

**Paginated list**
```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

**Error**
```json
{ "success": false, "message": "Error description" }
```

## Validation Rules
- **User**: `name` required; `email` required, valid, unique.
- **Expense**: `userId` required and must reference an existing user; `title` required; `amount` must be greater than 0; `category` required; `description` optional.

## Error Handling
Handled centrally with appropriate HTTP status codes:
- `400` — validation errors, invalid ID, invalid pagination
- `404` — user or expense not found
- `409` — duplicate email
- `500` — database / server errors

## Database Schema

**users**
| Column     | Type      |
|------------|-----------|
| id         | INTEGER (PK, auto-increment) |
| name       | STRING    |
| email      | STRING (unique) |
| createdAt  | DATETIME  |
| updatedAt  | DATETIME  |

**expenses**
| Column      | Type      |
|-------------|-----------|
| id          | INTEGER (PK, auto-increment) |
| userId      | INTEGER (FK → users.id) |
| title       | STRING    |
| amount      | DECIMAL(10,2) |
| category    | STRING    |
| description | STRING (nullable) |
| createdAt   | DATETIME  |
| updatedAt   | DATETIME  |

**Relationship:** One User → Many Expenses (`ON DELETE CASCADE`)

GitHub URL = 

## Testing Quickly with curl

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Create an expense
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"title":"Lunch","amount":350,"category":"Food"}'

# List expenses
curl "http://localhost:3000/expenses?page=1&limit=10"

# Get summary
curl "http://localhost:3000/expenses/summary?userId=1"
```
