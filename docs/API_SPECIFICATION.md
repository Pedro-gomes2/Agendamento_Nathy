# API Specification - Salão Nathy v1.0.0

**Base URL:** `http://localhost:3001` (dev) | `https://api.salao-nathy.com` (prod)  
**API Version:** 1.0.0  
**Auth:** JWT Bearer Token  
**Response Format:** JSON  

---

## 📋 Quick Reference

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/login` | ❌ | - | Login |
| POST | `/auth/register-employee` | ✅ | admin | Create employee |
| GET | `/auth/profile` | ✅ | - | Get user profile |
| GET | `/appointments` | ✅ | admin | List all appointments |
| GET | `/appointments/my-appointments` | ✅ | employee | My appointments |
| POST | `/appointments` | ❌ | - | Create appointment |
| GET | `/appointments/:id` | ✅ | - | Get appointment |
| PATCH | `/appointments/:id/confirm` | ✅ | admin/employee | Confirm |
| PATCH | `/appointments/:id/complete` | ✅ | admin/employee | Complete |
| PATCH | `/appointments/:id/cancel` | ✅ | - | Cancel |
| PUT | `/appointments/:id` | ✅ | admin | Edit appointment |
| DELETE | `/appointments/:id` | ✅ | admin | Delete appointment |
| GET | `/services` | ❌ | - | List services |
| GET | `/services/:id` | ❌ | - | Get service |
| POST | `/services` | ✅ | admin | Create service |
| PUT | `/services/:id` | ✅ | admin | Edit service |
| DELETE | `/services/:id` | ✅ | admin | Delete service |
| GET | `/users/employees` | ✅ | admin | List employees |
| GET | `/users/profile` | ✅ | - | My profile |
| GET | `/users/:id` | ✅ | admin | Get user |
| PUT | `/users/:id` | ✅ | admin | Edit user |
| PATCH | `/users/:id/deactivate` | ✅ | admin | Deactivate |
| PATCH | `/users/:id/activate` | ✅ | admin | Activate |
| DELETE | `/users/:id` | ✅ | admin | Delete user |
| GET | `/financial/transactions` | ✅ | admin | List transactions |
| POST | `/financial/transactions` | ✅ | admin | Create transaction |
| GET | `/financial/transactions/:id` | ✅ | admin | Get transaction |
| DELETE | `/financial/transactions/:id` | ✅ | admin | Delete transaction |
| GET | `/financial/report/all` | ✅ | admin | Financial report |
| GET | `/financial/commissions/all` | ✅ | admin | Commission report |
| GET | `/financial/my-financials` | ✅ | employee | My financials |

---

## 🔐 Authentication

### **1. Login**

```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@salao.com",
  "password": "admin123456"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "00a50900-931c-4816-871d-c566a921a3eb",
    "email": "admin@salao.com",
    "name": "Admin Nathy",
    "role": "admin"
  }
}
```

**Usage:**
```javascript
// Store token
localStorage.setItem('token', response.access_token);

// Use in requests
fetch('http://localhost:3001/users', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

### **2. Register Employee**

```
POST /auth/register-employee
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Maria Silva",
  "email": "maria@salao.com",
  "password": "senha123456",
  "specialty": "Manicure",
  "commission_rate": 25.5,
  "image_url": "https://example.com/maria.jpg"
}
```

**Response (201 Created):**
```json
{
  "id": "new-employee-uuid",
  "name": "Maria Silva",
  "email": "maria@salao.com",
  "role": "employee",
  "specialty": "Manicure",
  "commission_rate": 25.5,
  "is_active": true,
  "image_url": "https://example.com/maria.jpg",
  "created_at": "2026-06-18T12:00:00Z"
}
```

### **3. Get Current User Profile**

```
GET /auth/profile
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": "user-uuid",
  "email": "maria@salao.com",
  "name": "Maria Silva",
  "role": "employee",
  "specialty": "Manicure",
  "commission_rate": 25.5,
  "is_active": true,
  "image_url": "https://example.com/maria.jpg"
}
```

---

## 📅 Appointments

### **Create Appointment (Public)**

```
POST /appointments
Content-Type: application/json

{
  "client_name": "João Silva",
  "client_phone": "+5583999999999",
  "date_time": "2026-06-25T14:30:00Z",
  "employee_id": "employee-uuid",
  "service_id": "service-uuid",
  "notes": "Cliente VIP"
}
```

**Response (201 Created):**
```json
{
  "id": "appointment-uuid",
  "client_name": "João Silva",
  "client_phone": "+5583999999999",
  "date_time": "2026-06-25T14:30:00Z",
  "status": "pending",
  "employee_id": "employee-uuid",
  "service_id": "service-uuid",
  "notes": "Cliente VIP",
  "employee": {
    "id": "employee-uuid",
    "name": "Funcionária 1",
    "specialty": "Manicure"
  },
  "service": {
    "id": "service-uuid",
    "name": "Manicure",
    "price": 50,
    "duration_minutes": 30
  },
  "created_at": "2026-06-18T12:00:00Z"
}
```

**Error (409 Conflict - Double Booking):**
```json
{
  "message": "Employee already has appointment at this time",
  "statusCode": 409
}
```

### **Get All Appointments (Admin + Pagination)**

```
GET /appointments?page=1&limit=20&sortBy=date_time&sortOrder=DESC
Authorization: Bearer {admin-token}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "appointment-uuid",
      "client_name": "João Silva",
      "date_time": "2026-06-25T14:30:00Z",
      "status": "confirmed",
      "employee": { "id": "...", "name": "..." },
      "service": { "id": "...", "name": "...", "price": 50 }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "pages": 8
}
```

### **Get Employee's Appointments**

```
GET /appointments/my-appointments
Authorization: Bearer {employee-token}
```

**Response (200 OK):**
```json
[
  {
    "id": "appointment-uuid",
    "client_name": "João Silva",
    "date_time": "2026-06-25T14:30:00Z",
    "status": "confirmed",
    "service": { "id": "...", "name": "Manicure", "price": 50 }
  }
]
```

### **Confirm Appointment**

```
PATCH /appointments/{id}/confirm
Authorization: Bearer {admin-or-employee-token}
```

**Response (200 OK):**
```json
{
  "id": "appointment-uuid",
  "status": "confirmed",
  "...": "..."
}
```

### **Complete Appointment**

```
PATCH /appointments/{id}/complete
Authorization: Bearer {admin-or-employee-token}
```

**Response (200 OK):**
```json
{
  "id": "appointment-uuid",
  "status": "completed",
  "...": "..."
}
```

### **Cancel Appointment**

```
PATCH /appointments/{id}/cancel
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": "appointment-uuid",
  "status": "cancelled",
  "...": "..."
}
```

---

## 🛠️ Services

### **List Services (Public)**

```
GET /services?page=1&limit=20
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "service-uuid",
      "name": "Manicure",
      "description": "Manicure profissional",
      "price": 50.00,
      "duration_minutes": 30,
      "image_url": "https://example.com/manicure.jpg",
      "is_active": true
    }
  ],
  "total": 6,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

### **Create Service (Admin)**

```
POST /services
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Manicure Gelada",
  "description": "Manicure com gel durável",
  "price": 75.00,
  "duration": 45,
  "image_url": "https://example.com/manicure-gelada.jpg"
}
```

**Response (201 Created):**
```json
{
  "id": "new-service-uuid",
  "name": "Manicure Gelada",
  "description": "Manicure com gel durável",
  "price": 75.00,
  "duration_minutes": 45,
  "image_url": "https://example.com/manicure-gelada.jpg",
  "is_active": true,
  "created_at": "2026-06-18T12:00:00Z"
}
```

### **Update Service (Admin)**

```
PUT /services/{id}
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "price": 85.00,
  "duration": 60
}
```

**Response (200 OK):**
```json
{
  "id": "service-uuid",
  "price": 85.00,
  "duration_minutes": 60,
  "...": "..."
}
```

### **Delete Service (Admin)**

```
DELETE /services/{id}
Authorization: Bearer {admin-token}
```

**Response (200 OK):**
```json
{
  "message": "Service deleted successfully"
}
```

---

## 👥 Users (Employees)

### **List Employees (Admin)**

```
GET /users/employees?page=1&limit=20
Authorization: Bearer {admin-token}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "employee-uuid",
      "name": "Maria Silva",
      "email": "maria@salao.com",
      "role": "employee",
      "specialty": "Manicure",
      "commission_rate": 25.5,
      "is_active": true,
      "image_url": "https://example.com/maria.jpg"
    }
  ],
  "total": 6,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

### **Update Employee (Admin)**

```
PUT /users/{employee-id}
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "commission_rate": 30.0,
  "specialty": "Manicure & Pedicure"
}
```

**Response (200 OK):**
```json
{
  "id": "employee-uuid",
  "commission_rate": 30.0,
  "specialty": "Manicure & Pedicure",
  "...": "..."
}
```

### **Deactivate Employee (Admin)**

```
PATCH /users/{employee-id}/deactivate
Authorization: Bearer {admin-token}
```

**Response (200 OK):**
```json
{
  "id": "employee-uuid",
  "is_active": false,
  "...": "..."
}
```

### **Activate Employee (Admin)**

```
PATCH /users/{employee-id}/activate
Authorization: Bearer {admin-token}
```

**Response (200 OK):**
```json
{
  "id": "employee-uuid",
  "is_active": true,
  "...": "..."
}
```

---

## 💰 Financial

### **Get Financial Report (Admin)**

```
GET /financial/report/all?startDate=2026-06-01T00:00:00Z&endDate=2026-06-30T23:59:59Z
Authorization: Bearer {admin-token}
```

**Response (200 OK):**
```json
{
  "total_entries": 2800.00,
  "total_exits": 300.00,
  "net_revenue": 2500.00,
  "start_date": "2026-06-01T00:00:00Z",
  "end_date": "2026-06-30T23:59:59Z",
  "transactions": [
    {
      "id": "transaction-uuid",
      "type": "entry",
      "value": 50.00,
      "description": "Receita - Manicure (Cliente: João Silva)",
      "date": "2026-06-25T14:30:00Z",
      "employee": {
        "id": "employee-uuid",
        "name": "Maria Silva"
      }
    }
  ]
}
```

### **Get Commission Report (Admin)**

```
GET /financial/commissions/all
Authorization: Bearer {admin-token}
```

**Response (200 OK):**
```json
[
  {
    "employee_id": "employee-uuid",
    "employee_name": "Maria Silva",
    "commission_rate": 25.5,
    "total_revenue": 2000.00,
    "commission_value": 510.00
  },
  {
    "employee_id": "employee-uuid",
    "employee_name": "João Barbeiro",
    "commission_rate": 30.0,
    "total_revenue": 1500.00,
    "commission_value": 450.00
  }
]
```

### **Get My Financials (Employee)**

```
GET /financial/my-financials
Authorization: Bearer {employee-token}
```

**Response (200 OK):**
```json
[
  {
    "id": "transaction-uuid",
    "type": "entry",
    "value": 50.00,
    "description": "Receita - Manicure (Cliente: João Silva)",
    "date": "2026-06-25T14:30:00Z"
  }
]
```

### **Create Transaction (Admin)**

```
POST /financial/transactions
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "type": "exit",
  "value": 150.00,
  "description": "Compra de produtos de higiene",
  "employee_id": "optional-employee-uuid"
}
```

**Response (201 Created):**
```json
{
  "id": "new-transaction-uuid",
  "type": "exit",
  "value": 150.00,
  "description": "Compra de produtos de higiene",
  "date": "2026-06-18T12:00:00Z"
}
```

---

## ❌ Error Responses

### **401 Unauthorized (Missing/Invalid Token)**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### **403 Forbidden (Insufficient Permissions)**
```json
{
  "message": "Forbidden",
  "statusCode": 403
}
```

### **404 Not Found**
```json
{
  "message": "Resource not found",
  "statusCode": 404
}
```

### **409 Conflict (Double Booking)**
```json
{
  "message": "Employee already has appointment at this time",
  "statusCode": 409
}
```

### **422 Unprocessable Entity (Validation Error)**
```json
{
  "message": [
    "client_phone must be a valid E.164 phone number"
  ],
  "statusCode": 422
}
```

---

## 🔄 Pagination Query Parameters

All list endpoints support:

```
?page=1              // Page number (default: 1)
&limit=20            // Items per page (default: 20, max: 100)
&sortBy=created_at   // Sort field
&sortOrder=DESC      // ASC or DESC
```

**Example:**
```
GET /appointments?page=2&limit=50&sortBy=date_time&sortOrder=DESC
```

---

## 📌 Common Response Patterns

**Success (200 OK):**
```json
{
  "id": "...",
  "created_at": "2026-06-18T12:00:00Z",
  "updated_at": "2026-06-18T12:00:00Z"
}
```

**List with Pagination:**
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "pages": 8
}
```

---

## ⚡ Performance Notes

- **Appointments query:** Cached with indexes → 50-100ms
- **Services list:** Cached in Redis → <1ms (5-min TTL)
- **Financials:** Optimized with QueryBuilder → 150-250ms
- **Connection pooling:** 50 max connections (production)

---

**Last Updated:** 18 de Junho de 2026  
**Version:** 1.0.0
