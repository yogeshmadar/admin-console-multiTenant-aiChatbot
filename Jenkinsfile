pipeline {
  agent any

  tools {
    // Ensure this tool name exists in Manage Jenkins → Global Tool Configuration
    nodejs 'NodeJS_18'
  }

  environment {
    NODE_ENV = 'production'
    // Configure npm retry behavior and registry (adjust if you use a proxy/internal registry)
    NPM_CONFIG_REGISTRY = 'https://registry.npmjs.org/'
    NPM_CONFIG_FETCH_RETRIES = '5'
    NPM_CONFIG_FETCH_RETRY_FACTOR = '2'
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT = '1000'
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT = '60000'
  }

  stages {
    // Clean workspace first (avoid stale files / permission issues)
    stage('Prepare workspace') {
      steps {
        script {
          echo "Cleaning workspace to avoid stale files / permission issues"
          deleteDir()
        }
      }
    }

    // Then checkout
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        script {
          // Retry wrapper to mitigate transient network issues
          retry(2) {
            sh '''
              npm config set registry ${NPM_CONFIG_REGISTRY}
              npm config set fetch-retries ${NPM_CONFIG_FETCH_RETRIES}
              npm config set fetch-retry-factor ${NPM_CONFIG_FETCH_RETRY_FACTOR}
              npm config set fetch-retry-mintimeout ${NPM_CONFIG_FETCH_RETRY_MINTIMEOUT}
              npm config set fetch-retry-maxtimeout ${NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT}
              npm ci --prefer-offline --no-audit --no-fund
            '''
          }
        }
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Test') {
      steps {
        sh 'if [ -f package.json ] && npm run | grep -q test; then npm test || true; else echo "No tests"; fi'
      }
    }

    stage('Archive') {
      steps {
        archiveArtifacts artifacts: '.next/**, package.json, public/**', allowEmptyArchive: true
      }
    }

    stage('Deploy (placeholder)') {
      when {
        branch 'main'
      }
      steps {
        echo 'Add deploy steps here (rsync/ssh/docker/etc.)'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo 'Success'
    }
    failure {
      echo 'Failed'
    }
  }
}
