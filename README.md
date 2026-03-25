# POS HRM API

A comprehensive multi-purpose Point-of-Sale and Human Resource Management platform API. Designed to support restaurants, retail, hospitals, logistics, and other industries with a complete suite of operational and HR management features.

## 🌟 Overview

This is a full-stack REST API built with Node.js and Express that combines Point-of-Sale (POS) functionality with complete Human Resource Management (HRM) capabilities. The system supports multi-organization architecture with role-based access control, making it suitable for various business types.

## 🎯 Key Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (RBAC) with custom permissions
- System roles: Superadmin, Admin, and Custom Roles
- Email verification with OTP
- Account security with login attempt tracking and lockout
- Multi-device support with refresh token management

### Human Resource Management (HRM)
- **Employee Management**: Complete employee lifecycle from onboarding to exit
- **Attendance Tracking**: Check-in/check-out with break time management
- **Leave Management**: Leave request workflow with approval system
- **Payroll**: Salary records and advance payment requests
- **Document Management**: Employee document storage and organization
- **Asset Allocation**: Track items assigned to employees
- **Performance**: Task assignment and tracking
- **Rewards System**: Coin-based employee rewards and vouchers

### Point-of-Sale (POS)
- **Menu Management**: Create and manage menu items with categories
- **Table Management**: Restaurant table and seating management
- **Order Management**: Complete order lifecycle from creation to completion
- **Inventory**: Stock and inventory request management
- **Sales Reports**: Comprehensive sales analytics and reporting
- **Organization Settings**: POS-specific configuration per organization

### Core Features
- **Multi-Organization**: Platform supports multiple organizations with isolated data
- **Notifications**: Real-time in-app notification system
- **AI Reviews**: AI-assisted review generation using Google Gemini
- **Dashboard**: Summary endpoints for quick insights
- **SOPs**: Standard Operating Procedures management
- **Request Management**: General staff request and approval workflow

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (>=16.20.1)
- **Framework**: Express.js 4.19.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), Passport.js
- **File Upload**: Multer with Cloudinary storage
- **API Documentation**: Swagger UI Express
- **Real-time**: Socket.IO 4.7.5
- **AI Integration**: Google Generative AI (Gemini)

### Key Dependencies
- `bcrypt`: Password hashing
- `express-validator`: Request validation
- `express-rate-limit`: API rate limiting
- `nodemailer`: Email service
- `cookie-parser`: Cookie parsing
- `express-session`: Session management
- `dotenv`: Environment configuration

## 📁 Project Structure

```
├── src/
│   ├── Controller/          # Route controllers
│   │   ├── Auth/           # Authentication controllers
│   │   ├── core/           # Core feature controllers
│   │   ├── hrm/            # HRM feature controllers
│   │   ├── pos/            # POS feature controllers
│   │   └── finance/        # Finance controllers
│   ├── Db/                 # Database configuration
│   ├── Middlewares/        # Custom middleware
│   │   └── Auth.middleware.js  # Authentication & authorization
│   ├── Models/             # Mongoose models
│   │   ├── core/          # Core models (User, Organization, Role)
│   │   ├── hrm/           # HRM models
│   │   └── pos/           # POS models
│   ├── Routes/            # API route definitions
│   ├── Utils/             # Utility functions
│   ├── app.js             # Express app setup
│   ├── index.js           # Entry point
│   ├── swagger.yaml       # Complete API documentation
│   ├── swagger-core.yaml  # Core endpoints documentation
│   └── swagger-hrm.yaml   # HRM endpoints documentation
├── package.json
└── .env.example
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.20.1
- MongoDB (local or cloud instance)
- Cloudinary account (for file storage)
- SMTP credentials (for email)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd <repository-name>
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=8080

# Database
MONGODB_URI=mongodb://localhost:27017/your-database-name

# JWT Secrets
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google AI (Optional - for AI reviews)
GEMINI_API_KEY=your-gemini-api-key

# Other
NODE_ENV=development
```

4. **Start the server**

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:8080`

### API Documentation

Once the server is running, access the interactive API documentation at:

```
http://localhost:8080/api-docs
```

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality for testing endpoints
- Authentication flow testing

## 🔑 Authentication Flow

### Registration & Login

1. **Register**: `POST /api/auth/register`
   - Creates new user account
   - Sends verification email with OTP

2. **Verify Email**: `POST /api/auth/verify-email`
   - Verifies email using OTP code
   - Activates the account

3. **Login**: `POST /api/auth/login`
   - Returns access token (15m expiry) and refresh token (7d expiry)
   - Sets HTTP-only cookies for web clients

4. **Refresh Token**: `POST /api/auth/refresh-token`
   - Issues new access token using refresh token
   - Automatic token rotation

### Authorization Levels

- **Superadmin**: Platform-level access, can manage all organizations
- **Admin**: Organization-level admin access
- **Custom Roles**: Configurable permissions per organization

### Protected Routes

Routes use middleware for authentication and authorization:

```javascript
// Requires authentication
protect

// Requires specific system role
authorize("superadmin")
authorize("superadmin", "admin")

// Requires specific permission (for custom roles)
checkPermission("employee:read")
```

## 📊 API Endpoints Overview

### Core Module (`/api`)

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/verify-email` - Email verification
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

#### Organizations (Superadmin only)
- `GET /organizations` - List all organizations
- `POST /organizations` - Create organization
- `GET /organizations/:id` - Get organization details
- `PUT /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization

#### User Management
- `GET /users` - List users
- `POST /users` - Create user
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Roles & Permissions
- `GET /roles` - List roles
- `POST /roles` - Create custom role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

### HRM Module (`/api`)

#### Employees
- `GET /employees` - List employees with pagination
- `POST /employees` - Create employee profile
- `GET /employees/profile` - Get own profile
- `GET /employees/overview/:employeeId` - Get employee overview
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

#### Attendance
- `POST /attendance/check-in` - Check in
- `POST /attendance/check-out` - Check out
- `POST /attendance/break-start` - Start break
- `POST /attendance/break-end` - End break
- `GET /attendance` - Get attendance records

#### Leave Requests
- `GET /leave-requests` - List leave requests
- `POST /leave-requests` - Create leave request
- `PUT /leave-requests/:id` - Update leave status

#### Salary & Advances
- `GET /salary-records` - List salary records
- `POST /salary-records` - Create salary record
- `GET /advance-requests` - List advance requests
- `POST /advance-requests` - Create advance request

#### Tasks
- `GET /tasks` - List tasks
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

#### Documents
- `GET /documents` - List employee documents
- `POST /documents` - Upload document
- `DELETE /documents/:id` - Delete document

### POS Module (`/api/pos`)

#### Menu Management
- `GET /menu` - List menu items
- `POST /menu` - Create menu item
- `PUT /menu/:id` - Update menu item
- `DELETE /menu/:id` - Delete menu item

#### Table Management
- `GET /tables` - List tables
- `POST /tables` - Create table
- `PUT /tables/:id` - Update table status

#### Orders
- `GET /orders` - List orders
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order
- `GET /orders/:id` - Get order details

#### Inventory
- `GET /inventory` - List inventory items
- `POST /inventory/request` - Create stock request

#### Reports
- `GET /reports/sales` - Sales reports
- `GET /reports/revenue` - Revenue analytics

## 🔐 Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **Token Security**: JWT with short-lived access tokens and rotating refresh tokens
- **Rate Limiting**: Express rate limiter to prevent abuse
- **Input Validation**: Express validator for request validation
- **SQL Injection Protection**: MongoDB/Mongoose parameterized queries
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Controlled cross-origin requests
- **Account Lockout**: After multiple failed login attempts
- **HTTP-only Cookies**: Prevents XSS token theft

## 🧪 Testing

The API can be tested using:

1. **Swagger UI**: Built-in interactive documentation at `/api-docs`
2. **Postman**: Import the Swagger/OpenAPI spec
3. **cURL**: Command-line testing

Example cURL request:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginInput":"user@example.com","loginPassword":"password123"}'
```

## 📝 Development Guidelines

### Code Style
- ES6+ JavaScript with module syntax
- Async/await for asynchronous operations
- Descriptive variable and function names
- Comments for complex logic

### Error Handling
- Custom `ApiError` class for consistent error responses
- Global error handler middleware
- Async error wrapper (`asyncHandler`)

### Database
- Mongoose schemas with validation
- Indexes on frequently queried fields
- Timestamps enabled on all models
- Virtual fields for computed properties

## 🔄 Common Workflows

### Creating a New Employee

1. Admin creates employee account: `POST /api/employees`
2. System sends welcome email with temporary password
3. Employee logs in and verifies email
4. Employee completes profile setup

### Processing Leave Request

1. Employee submits leave request: `POST /api/leave-requests`
2. Manager receives notification
3. Manager approves/rejects: `PUT /api/leave-requests/:id`
4. Employee receives notification of decision

### Restaurant Order Flow

1. Waiter creates order: `POST /api/pos/orders`
2. Kitchen receives order notification
3. Kitchen updates order status
4. Waiter marks order as served
5. System generates bill and updates inventory

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Verify MongoDB is running
- Check MONGODB_URI in .env file
- Ensure network connectivity

**JWT Token Invalid**
- Check token expiration
- Verify secrets match between token generation and verification
- Ensure token is sent in Authorization header: `Bearer <token>`

**Cloudinary Upload Failed**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper file format

**Email Not Sending**
- Verify SMTP credentials
- Check email service provider settings
- Enable "Less secure app access" for Gmail or use App Password

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [MongoDB Best Practices](https://www.mongodb.com/docs/manual/)

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🤝 Support

For support, email support@yourcompany.com or open an issue in the repository.

---

**Built with ❤️ for modern businesses**
