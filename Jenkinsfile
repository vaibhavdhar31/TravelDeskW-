pipeline {
    agent any
    
    environment {
        FRONTEND_PATH = 'traveldesk/traveldesk/frontend'
        BACKEND_PATH = 'Travel_desk_backend/Travel_desk_backend'
        DOCKER_IMAGE_FRONTEND = 'srs-travel-desk-frontend'
        DOCKER_IMAGE_BACKEND = 'srs-travel-desk-backend'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo '📥 Code checked out successfully'
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        dir("${FRONTEND_PATH}") {
                            sh 'npm ci'
                            echo '📦 Frontend dependencies installed'
                        }
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        dir("${BACKEND_PATH}") {
                            sh 'dotnet restore'
                            echo '📦 Backend dependencies restored'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir("${FRONTEND_PATH}") {
                            sh 'npm test -- --watch=false --browsers=ChromeHeadless'
                            echo '✅ Frontend tests passed'
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        dir("${BACKEND_PATH}") {
                            sh 'dotnet test --configuration Release --logger trx'
                            echo '✅ Backend tests passed'
                        }
                    }
                }
            }
        }
        
        stage('Build Applications') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir("${FRONTEND_PATH}") {
                            sh 'npm run build'
                            echo '🔨 Frontend built successfully'
                        }
                    }
                }
                stage('Build Backend') {
                    steps {
                        dir("${BACKEND_PATH}") {
                            sh 'dotnet build --configuration Release'
                            echo '🔨 Backend built successfully'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            when {
                branch 'main'
            }
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        dir("${FRONTEND_PATH}") {
                            sh "docker build -t ${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER} ."
                            sh "docker tag ${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER} ${DOCKER_IMAGE_FRONTEND}:latest"
                            echo '🐳 Frontend Docker image built'
                        }
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        dir("${BACKEND_PATH}") {
                            sh "docker build -t ${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER} ."
                            sh "docker tag ${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER} ${DOCKER_IMAGE_BACKEND}:latest"
                            echo '🐳 Backend Docker image built'
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '🚀 Deploying SRS Travel Desk...'
                    sh 'docker-compose down || true'
                    sh 'docker-compose up -d'
                    echo '✅ Application deployed successfully!'
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up workspace'
            cleanWs()
        }
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
