# CodeSync Backend

A secure Node.js backend application with authentication, user management, and session handling.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with Google OAuth and local strategy
- **Session Management**: MongoDB-based session storage with express-session
- **Security Middleware**: Helmet.js, rate limiting, and CORS protection
- **User Management**: User profiles and session tracking
- **Input Validation**: Email and password validation
- **Environment Configuration**: Secure environment variable management

## 🔒 Security Features

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Session Security**: HttpOnly cookies with secure flags
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Helmet.js for comprehensive security
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configurable cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CodeSync-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/codesync

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

   # Session Configuration
   SESSION_SECRET=your_super_secret_session_key_here_make_it_long_and_random

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here

   # Frontend URL
   FRONTEND_URL=http://localhost:5173

   # Cloudinary Configuration (if using)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email Configuration (if using)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔐 Security Configuration

### JWT Configuration
- **JWT_SECRET**: Must be a long, random string (at least 32 characters)
- **Token Expiration**: 24 hours for Google OAuth, 7 days for local login
- **HttpOnly Cookies**: Tokens are stored in secure, HttpOnly cookies

### Session Configuration
- **SESSION_SECRET**: Must be a long, random string (at least 32 characters)
- **MongoDB Store**: Sessions are stored in MongoDB for persistence
- **Secure Cookies**: Production sessions use secure flags

### Rate Limiting
- **General**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP for auth routes

## 🚨 Important Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for JWT and session keys
3. **Enable HTTPS** in production environments
4. **Regularly update dependencies** to patch security vulnerabilities
5. **Monitor logs** for suspicious activity
6. **Use environment-specific configurations** for different deployment stages

## 📁 Project Structure

```
CodeSync-Backend/
├── config/           # Configuration files
├── controller/       # Route controllers
├── middleware/       # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── index.js         # Main application file
└── package.json     # Dependencies and scripts
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/google` - Google OAuth initiation
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/logout` - User logout
- `GET /auth/current_user` - Get current user info
- `GET /auth/me` - Protected user info

### User Profile
- `GET /user/*` - User profile routes (protected)

## 🧪 Testing

```bash
npm test
```

## 📝 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## ⚠️ Security Issues

If you discover a security vulnerability, please email [security@example.com] instead of using the issue tracker.
