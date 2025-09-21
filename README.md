# Extendable GraphQL & REST API Server

A professional, scalable, and maintainable API server built with Node.js, Express, and Apollo Server. This enterprise-grade solution provides both GraphQL and REST APIs with comprehensive authentication, error handling, and logging.

## Features

- **Dual API Support**: Both GraphQL and REST APIs in one server
- **JWT Authentication**: Secure token-based authentication with role-based access control
- **Modular Architecture**: Scalable folder structure for easy maintenance and expansion
- **Comprehensive Logging**: Professional logging with different levels and formats
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Performance Monitoring**: Built-in performance tracking and metrics
- **GraphQL Playground**: Interactive GraphQL development environment
- **Auto-generated Documentation**: Self-documenting API endpoints
- **High Performance**: Optimized for production use
- **Easy Configuration**: Environment-based configuration management

## 🏗️ Architecture

```
src/
├── core/                    # Core application modules
│   ├── auth/               # Authentication & authorization
│   ├── database/           # Data access layer
│   ├── middleware/         # Common middleware
│   └── logging/            # Logging system
├── graphql/                # GraphQL layer
│   ├── schemas/            # GraphQL type definitions
│   ├── resolvers/          # Modular resolvers
│   └── context/            # GraphQL context factory
├── rest/                   # REST API layer
│   ├── controllers/        # API controllers
│   └── routes/             # Route definitions
├── shared/                 # Shared utilities
│   ├── constants/          # Application constants
│   └── types/              # Type definitions
├── utils/                  # Utility functions
├── config/                 # Configuration management
├── app.js                  # Main application class
└── server.js               # Server entry point
```

## Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KhalidMimMuzahid/GraphQL_Assignment.git
   cd GraphQL_Assignment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm run start
   ```

4. **For development with auto-reload**
   ```bash
   npm run dev
   ```

### Generate Authentication Tokens

```bash
# Generate a user token (default)
npm run generate-token

# Generate tokens for different roles
npm run generate-token:admin
npm run generate-token:user
npm run generate-token:guest
npm run generate-token:all
```

## API Endpoints

### GraphQL API

- **Endpoint**: `http://localhost:4000/graphql`
- **Playground**: `http://localhost:4000/graphql` (in browser)
- **Authentication**: Bearer token required

### REST API

- **Base URL**: `http://localhost:4000/api`
- **Documentation**: `http://localhost:4000/api`
- **Health Check**: `http://localhost:4000/api/health`

#### Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | API information | No |
| GET | `/api/health` | Health status | No |
| GET | `/api/stats` | System statistics | Yes |
| GET | `/api/nodes` | Get all nodes | Yes |
| GET | `/api/nodes/:id` | Get node by ID | Yes |
| GET | `/api/nodes/:id/relations` | Get node with relations | Yes |
| GET | `/api/nodes/stats` | Get node statistics | Yes |

## 🔐 Authentication

### JWT Token Usage

Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **admin**: Full access to all resources
- **user**: Read/write access to most resources
- **guest**: Read-only access

## 📝 GraphQL Examples

### Basic Query

```graphql
query {
  health {
    status
    timestamp
    uptime
  }
}
```

### Get Node with Relations

```graphql
query {
  node(nodeId: "6296be3470a0c1052f89cccb") {
    _id
    name
    description
    trigger {
      _id
      name
      resourceTemplate {
        _id
        name
      }
    }
    responses {
      _id
      name
      platforms {
        integrationId
        build
      }
    }
    actions {
      _id
      name
      resourceTemplate {
        _id
        name
      }
    }
  }
}
```


```

## 📝 REST API Examples

### Get All Nodes

```bash
curl -X GET "http://localhost:4000/api/nodes" \
  -H "Authorization: Bearer <your-token>"
```

### Get Node by ID

```bash
curl -X GET "http://localhost:4000/api/nodes/6296be3470a0c1052f89cccb" \
  -H "Authorization: Bearer <your-token>"
```

### Get Node with Relations

```bash
curl -X GET "http://localhost:4000/api/nodes/6296be3470a0c1052f89cccb/relations" \
  -H "Authorization: Bearer <your-token>"
```

### Get System Statistics

```bash
curl -X GET "http://localhost:4000/api/stats" \
  -H "Authorization: Bearer <your-token>"
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4000 |
| `HOST` | Server host | localhost |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT secret key | your-secret-key-change-this-in-production |
| `JWT_EXPIRES_IN` | Token expiration | 24h |
| `LOG_LEVEL` | Logging level | info |

### Configuration Files

- `src/config/index.js` - Main configuration
- Environment-specific configs can be added

## Testing

### GraphQL Testing

1. Open `http://localhost:4000/graphql` in your browser
2. Add the Authorization header in the Headers section:
   ```json
   {
     "Authorization": "Bearer <your-token>"
   }
   ```
3. Write and execute queries

### REST API Testing

Use curl, Postman, or any HTTP client with the provided examples above.

## Monitoring & Logging

### Log Levels

- **error**: Error messages
- **warn**: Warning messages
- **info**: Informational messages
- **http**: HTTP request logs
- **debug**: Debug messages

### Performance Metrics

The application automatically tracks:
- Request/response times
- GraphQL operation performance
- Database query performance
- Memory usage
- System uptime

## 🔧 Development

### Adding New Resolvers

1. Create a new resolver file in `src/graphql/resolvers/`
2. Import and register in `src/graphql/resolvers/index.js`
3. Add corresponding schema definitions

### Adding New REST Endpoints

1. Create a controller in `src/rest/controllers/`
2. Create routes in `src/rest/routes/`
3. Register routes in `src/rest/routes/index.js`

### Adding New Modules

1. Create module folder in `src/modules/`
2. Follow the established patterns
3. Update documentation

## Production Deployment

### Environment Setup

1. Set production environment variables
2. Configure proper JWT secrets
3. Set up logging to files
4. Configure CORS for production domains

### Performance Optimization

- Enable caching where appropriate
- Use connection pooling for databases
- Implement rate limiting
- Set up monitoring and alerting

## API Documentation

### GraphQL Schema

Visit `http://localhost:4000/graphql` and explore the schema in the GraphQL Playground.

### REST API Documentation

Visit `http://localhost:4000/api` for REST API information and available endpoints.


## Support

For issues and questions:
1. Check the documentation
2. Review the logs
3. Create an issue in the repository

---