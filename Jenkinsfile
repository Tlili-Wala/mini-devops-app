pipeline {
  agent any

  environment {
    REGISTRY = credentials('dockerhub-credentials')
    DOCKERHUB_USERNAME = "${REGISTRY_USR}"
    DOCKERHUB_PASSWORD = "${REGISTRY_PSW}"
    IMAGE_PREFIX = "${REGISTRY_USR}/mini-devops-app"
    NODE_VERSION = "20.19.0"
  }

  options {
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      parallel {
        stage('Frontend') {
          steps {
            dir('frontend') {
              sh "docker run --rm -v ${env.WORKSPACE}/frontend:/workspace -w /workspace node:${NODE_VERSION} npm ci"
            }
          }
        }
        stage('Backend') {
          steps {
            dir('backend') {
              sh "docker run --rm -v ${env.WORKSPACE}/backend:/workspace -w /workspace node:${NODE_VERSION} npm ci"
            }
          }
        }
      }
    }

    stage('Lint & Test') {
      parallel {
        stage('Frontend Lint') {
          steps {
            dir('frontend') {
              sh "docker run --rm -v ${env.WORKSPACE}/frontend:/workspace -w /workspace node:${NODE_VERSION} npm run lint"
            }
          }
        }
        stage('Backend Lint') {
          steps {
            dir('backend') {
              sh "docker run --rm -v ${env.WORKSPACE}/backend:/workspace -w /workspace node:${NODE_VERSION} npm run lint"
            }
          }
        }
      }
    }

    stage('Build App') {
      parallel {
        stage('Frontend Build') {
          steps {
            dir('frontend') {
              sh "docker run --rm -v ${env.WORKSPACE}/frontend:/workspace -w /workspace -e VITE_API_URL=/api node:${NODE_VERSION} npm run build"
            }
          }
        }
        stage('Backend Build') {
          steps {
            dir('backend') {
              sh "docker run --rm -v ${env.WORKSPACE}/backend:/workspace -w /workspace node:${NODE_VERSION} npm run build"
            }
          }
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        script {
          sh """
            docker build --build-arg NODE_VERSION=${NODE_VERSION} -t ${IMAGE_PREFIX}-frontend:latest frontend
            docker build --build-arg NODE_VERSION=${NODE_VERSION} -t ${IMAGE_PREFIX}-backend:latest backend
          """
        }
      }
    }

    stage('Security Scan') {
      steps {
        script {
          sh """
            trivy image --exit-code 1 --severity HIGH,CRITICAL ${IMAGE_PREFIX}-frontend:latest
            trivy image --exit-code 1 --severity HIGH,CRITICAL ${IMAGE_PREFIX}-backend:latest
          """
        }
      }
    }

    stage('Publish Images') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          script {
            sh '''
              echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
              docker push ${IMAGE_PREFIX}-frontend:latest
              docker push ${IMAGE_PREFIX}-backend:latest
            '''
          }
        }
      }
    }
  }

}

