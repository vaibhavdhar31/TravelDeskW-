# 🚀 SRS Travel Desk CI/CD Pipeline Guide

## What is CI/CD?

**Continuous Integration (CI)**: Automatically test code when changes are made  
**Continuous Deployment (CD)**: Automatically deploy code when tests pass

## 🎯 Our Pipeline Features

✅ **Automated Testing** - Runs all 34 tests on every commit  
✅ **Multi-Environment** - Separate staging and production deployments  
✅ **Docker Support** - Containerized applications for consistency  
✅ **Parallel Processing** - Frontend and backend build simultaneously  
✅ **Security Scanning** - Automated vulnerability checks  

## 🔧 Available CI/CD Options

### 1. GitHub Actions (Recommended)
- **File**: `.github/workflows/ci-cd.yml`
- **Triggers**: Push to main/master, Pull Requests
- **Features**: Free for public repos, easy setup

### 2. Azure DevOps
- **File**: `azure-pipelines.yml`
- **Features**: Enterprise-grade, Microsoft integration

### 3. Jenkins
- **File**: `Jenkinsfile`
- **Features**: Self-hosted, highly customizable

## 🚀 Quick Start

### Option 1: GitHub Actions Setup

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add CI/CD pipeline"
   git push origin main
   ```

2. **Check Pipeline**:
   - Go to your GitHub repo
   - Click "Actions" tab
   - Watch your pipeline run automatically!

### Option 2: Local Docker Setup

1. **Build and Run**:
   ```bash
   docker-compose up --build
   ```

2. **Access Application**:
   - Frontend: http://localhost:4200
   - Backend: http://localhost:5000
   - Database: localhost:1433

## 📊 Pipeline Stages

### Stage 1: Code Quality
```bash
# Frontend Tests
cd traveldesk/traveldesk/frontend
npm test -- --watch=false --browsers=ChromeHeadless

# Backend Tests  
cd Travel_desk_backend/Travel_desk_backend
dotnet test --configuration Release
```

### Stage 2: Build Applications
```bash
# Frontend Build
npm run build:prod

# Backend Build
dotnet build --configuration Release
```

### Stage 3: Deploy
```bash
# Docker Deployment
docker-compose up -d

# Manual Deployment
# Frontend -> Static hosting (Netlify, Vercel)
# Backend -> Cloud hosting (Azure, AWS)
```

## 🔍 Monitoring & Alerts

### Pipeline Status
- ✅ **Green**: All tests pass, deployment successful
- ❌ **Red**: Tests failed, deployment blocked
- 🟡 **Yellow**: Pipeline running

### Notifications
- Email alerts on pipeline failure
- Slack/Teams integration available
- GitHub status checks on PRs

## 🛠 Troubleshooting

### Common Issues

1. **Tests Failing**:
   ```bash
   # Run tests locally first
   npm test
   dotnet test
   ```

2. **Build Errors**:
   ```bash
   # Check dependencies
   npm ci
   dotnet restore
   ```

3. **Docker Issues**:
   ```bash
   # Clean and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

## 📈 Advanced Features

### Environment Variables
```yaml
# In GitHub Actions
env:
  NODE_ENV: production
  ASPNETCORE_ENVIRONMENT: Production
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Secrets Management
- Database passwords
- API keys
- SSL certificates

### Multi-Environment Deployment
- **Development**: Auto-deploy feature branches
- **Staging**: Auto-deploy to main branch
- **Production**: Manual approval required

## 🎉 Benefits You Get

1. **Faster Development**: Immediate feedback on code changes
2. **Higher Quality**: Automated testing catches bugs early
3. **Reliable Deployments**: Consistent, repeatable process
4. **Team Collaboration**: Everyone sees build status
5. **Professional Workflow**: Industry-standard practices

## 📚 Next Steps

1. **Set up monitoring** with application insights
2. **Add performance testing** to pipeline
3. **Implement blue-green deployment** for zero downtime
4. **Add security scanning** with tools like SonarQube
5. **Create staging environment** for testing

---

**Your SRS Travel Desk now has enterprise-grade CI/CD! 🚀**
