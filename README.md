#  SRS Travel Desk

A complete travel request management system built with **Angular**, **.NET Core**, and **SQL Server**.

##  Features

- **Employee Dashboard**: Create and track travel requests
- **Manager Dashboard**: Approve/reject employee requests  
- **Travel Admin Dashboard**: Final approval and booking management
- **Role-based Authentication**: Secure login with different user roles
- **Responsive UI**: Modern Angular frontend with Bootstrap styling

##  Tech Stack

- **Frontend**: Angular 18+ with TypeScript
- **Backend**: .NET Core 8 Web API
- **Database**: SQL Server 2022
- **Authentication**: JWT-based authentication

##  Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **.NET Core 8 SDK**
- **SQL Server 2022** (or SQL Server Express)
- **Git** for cloning the repository

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SRS_Travel_Desk
   ```

2. **Setup Database**
   - Install SQL Server locally
   - Create database `TravelDeskDB`
   - Run the SQL scripts in the database folder

3. **Start Backend**
   ```bash
   cd Travel_desk_backend/Travel_desk_backend/TravelDesk_Api
   dotnet restore
   dotnet run
   ```

4. **Start Frontend**
   ```bash
   cd traveldesk/traveldesk/frontend
   npm install
   ng serve
   ```

5. **Access the application**
   - **Frontend**: http://localhost:4200
   - **Backend API**: http://localhost:5000

###  Test Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Employee | `employee1@cgi.com` | `password123` | `/employee` |
| Manager | `manager1@cgi.com` | `password123` | `/manager` |
| Travel Admin | `admin1@cgi.com` | `password123` | `/travel-admin` |

##  Verification Commands

### Test Authentication
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee1@cgi.com","password":"password123"}'
```

### Test Frontend
```bash
curl http://localhost:4200
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular UI    │    │  .NET Core API  │    │  SQL Server     │
│   Port: 4200    │◄──►│   Port: 5000    │◄──►│   Port: 1433    │
│    (Frontend)   │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Project Structure

```
SRS_Travel_Desk/
├── Travel_desk_backend/             # .NET Core API
│   └── Travel_desk_backend/
│       └── TravelDesk_Api/
├── traveldesk/traveldesk/
│   ├── frontend/                    # Angular application
│   └── backend-server.js            # Mock backend for development
└── README.md
```

## Setup Instructions

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

## Troubleshooting

### Port Conflicts
```bash
# Check what's using the ports
netstat -an | findstr ":4200 :5000 :1433"
```

### Database Connection
- Ensure SQL Server is running
- Verify connection string in appsettings.json
- Check if database `TravelDeskDB` exists

## API Endpoints

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Ensure SQL Server is running locally
3. Verify ports 4200, 5000, 1433 are available

---

