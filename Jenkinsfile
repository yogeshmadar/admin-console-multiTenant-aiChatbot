pipeline {
  agent any

  tools {
    // Make sure the tool name matches Manage Jenkins -> Global Tool Configuration
    nodejs 'NodeJS_18'
  }

  environment {
    // Keep NODE_ENV production for build/runtime; dev deps will be installed explicitly below
    NODE_ENV = 'production'

    // npm retry/configuration (tune if needed)
    NPM_CONFIG_REGISTRY = 'https://registry.npmjs.org/'
    NPM_CONFIG_FETCH_RETRIES = '5'
    NPM_CONFIG_FETCH_RETRY_FACTOR = '2'
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT = '1000'
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT = '60000'
  }

  stages {
    stage('Prepare workspace') {
      steps {
        script {
          echo "Cleaning workspace to avoid stale files / permission issues"
          deleteDir()
        }
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        script {
          // Retry wrapper to mitigate transient network issues during package fetch
          retry(2) {
            sh '''
              echo "Configuring npm registry and retries..."
              npm config set registry ${NPM_CONFIG_REGISTRY}
              npm config set fetch-retries ${NPM_CONFIG_FETCH_RETRIES}
              npm config set fetch-retry-factor ${NPM_CONFIG_FETCH_RETRY_FACTOR}
              npm config set fetch-retry-mintimeout ${NPM_CONFIG_FETCH_RETRY_MINTIMEOUT}
              npm config set fetch-retry-maxtimeout ${NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT}

              # Install including devDependencies (ensures webpack, build tools available)
              echo "Running npm ci (including devDependencies)..."
              npm ci --include=dev --prefer-offline --no-audit --no-fund
            '''
          }
        }
      }
    }

    // Optional: write .env.production from a Jenkins Secret Text credential.
    // Create a "Secret text" credential in Jenkins with ID 'PROD_ENV_VARS' containing
    // newline-separated KEY=VALUE lines. If you don't need it, remove this stage.
    stage('Prepare env (optional)') {
      when {
        expression { return params.WRITE_ENV == null ? true : params.WRITE_ENV } // default path, editable if you add params
      }
      steps {
        // WithCredentials block will fail the build if the credential ID doesn't exist.
        // If you don't want to use credentials, remove this stage entirely.
        withCredentials([string(credentialsId: 'PROD_ENV_VARS', variable: 'PROD_ENV')]) {
          sh '''
            echo "Writing .env.production from Jenkins secret"
            printf "%s\n" "$PROD_ENV" > .env.production
            echo ".env.production written (first 5 lines):"
            head -n 5 .env.production || true
          '''
        }
      }
    }

    stage('Build') {
      steps {
        // Force production when running build to generate optimized output
        sh 'NODE_ENV=production npm run build'
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
      // Clean workspace to keep disk tidy
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
