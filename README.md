# 🚀 SRS Travel Desk - Dockerized Application

A complete travel request management system built with **Angular**, **.NET Core**, and **SQL Server**, fully containerized with **Docker**.

## 📋 Features

- **Employee Dashboard**: Create and track travel requests
- **Manager Dashboard**: Approve/reject employee requests  
- **Travel Admin Dashboard**: Final approval and booking management
- **Role-based Authentication**: Secure login with different user roles
- **Responsive UI**: Modern Angular frontend with Bootstrap styling

## 🛠️ Tech Stack

- **Frontend**: Angular 18+ with TypeScript
- **Backend**: .NET Core 8 Web API
- **Database**: SQL Server 2022
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT-based authentication

## 🐳 Docker Setup (Recommended)

### Prerequisites
- **Docker Desktop** installed on Windows/Mac/Linux
- **Git** for cloning the repository

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SRS_Travel_Desk
   ```

2. **Start the application**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access the application**
   - **Frontend**: http://localhost:4200
   - **Backend API**: http://localhost:5088
   - **Database**: localhost:1433

### 🔐 Test Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Employee | `employee1@cgi.com` | `password123` | `/employee` |
| Manager | `manager1@cgi.com` | `password123` | `/manager` |
| Travel Admin | `admin1@cgi.com` | `password123` | `/travel-admin` |

## 🧪 Verification Commands

### Check All Services
```bash
docker-compose -f docker-compose.dev.yml ps
```

### Test Authentication
```bash
curl -X POST http://localhost:5088/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee1@cgi.com","password":"password123"}'
```

### Test Frontend
```bash
curl http://localhost:4200
```

### View Logs
```bash
docker-compose -f docker-compose.dev.yml logs frontend-dev
docker-compose -f docker-compose.dev.yml logs mock-backend
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular UI    │    │  .NET Core API  │    │  SQL Server     │
│   Port: 4200    │◄──►│   Port: 5088    │◄──►│   Port: 1433    │
│  (frontend-dev) │    │ (mock-backend)  │    │   (database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
SRS_Travel_Desk/
├── docker-compose.yml              # Production setup
├── docker-compose.dev.yml          # Development setup
├── Travel_desk_backend/             # .NET Core API
│   └── Travel_desk_backend/
│       └── TravelDesk_Api/
├── traveldesk/traveldesk/
│   ├── frontend/                    # Angular application
│   └── backend-server.js            # Mock backend for development
└── README.md
```

## 🚀 Deployment Options

### Development Mode (Current)
```bash
docker-compose -f docker-compose.dev.yml up -d
```
- Uses mock backend with in-memory data
- Hot reload for frontend development
- Ports: 4200 (frontend), 5088 (backend), 1433 (database)

### Production Mode
```bash
docker-compose up -d
```
- Uses .NET Core API with SQL Server
- Optimized Angular build
- Ports: 80 (frontend), 5000 (backend), 1433 (database)

## 🔧 Manual Setup (Alternative)

If you prefer running without Docker:

### Frontend
```bash
cd traveldesk/traveldesk/frontend
npm install
ng serve
```

### Backend (.NET)
```bash
cd Travel_desk_backend/Travel_desk_backend/TravelDesk_Api
dotnet restore
dotnet run
```

### Database
- Install SQL Server locally
- Create database `TravelDeskDB`
- Run Entity Framework migrations

## 🐛 Troubleshooting

### Port Conflicts
```bash
# Check what's using the ports
netstat -an | findstr ":4200 :5088 :1433"

# Stop conflicting services
docker-compose -f docker-compose.dev.yml down
```

### Container Issues
```bash
# Rebuild containers
docker-compose -f docker-compose.dev.yml up --build

# View detailed logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Database Connection
```bash
# Test database connectivity
docker-compose -f docker-compose.dev.yml exec database \
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TravelDesk123!" -C -Q "SELECT @@VERSION"
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Employee
- `POST /api/employee/create-request` - Create travel request
- `GET /api/employee/my-requests` - Get user's requests

### Manager  
- `GET /api/manager/my-requests` - Get pending requests
- `POST /api/manager/approve/{id}` - Approve request

### Travel Admin
- `GET /api/admin/all-requests` - Get all approved requests
- `POST /api/admin/approve/{id}` - Final approval

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. View container logs: `docker-compose -f docker-compose.dev.yml logs`
3. Ensure Docker Desktop is running
4. Verify ports 4200, 5088, 1433 are available

---

