# Expense Management API

Node.js + Express + MySQL + Sequelize REST API for the technical assignment.

## Requirements
- Node.js 18+
- MySQL 8+

## Setup

### 1. Create database
```sql
CREATE DATABASE expense_management;
```

### 2. Install
```bash
npm install
```

### 3. Environment
Copy `.env.example` to `.env` and set your MySQL credentials.

### 4. Run
Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

Base URL:
`http://localhost:5000`

## APIs

### Create User
POST `/users`
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Create Expense
POST `/expenses`
```json
{
  "userId": 1,
  "title": "Lunch",
  "amount": 350,
  "category": "Food",
  "description": "Lunch with friends"
}
```

### Get Expenses
GET `/expenses?page=1&limit=10`

Filters:
- `userId=1`
- `category=Food`
- `fromDate=2026-08-01`
- `toDate=2026-08-21`

Example:
`GET /expenses?userId=1&category=Food&page=1&limit=10`

### Get Expense
GET `/expenses/1`

### Update Expense
PUT `/expenses/1`
```json
{
  "title": "Dinner",
  "amount": 500,
  "category": "Food"
}
```

### Delete Expense
DELETE `/expenses/1`

### Expense Summary
GET `/expenses/summary`
Optional:
`/expenses/summary?userId=1&fromDate=2026-08-01&toDate=2026-08-31`

## Project structure

src/
- app.js
- config/
- controllers/
- middleware/
- models/
- routes/

The project uses Sequelize `sync()` for the database schema, which is suitable for this small assignment. For a production application, migrations would be preferred.
