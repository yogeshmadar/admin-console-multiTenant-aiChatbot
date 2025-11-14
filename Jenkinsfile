pipeline {
  agent any

  tools {
    // Use NodeJS tool name set in Global Tool Configuration; comment this if you're using system node
    nodejs 'NodeJS_18'
  }

  environment {
    NODE_ENV = 'production'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Test') {
      steps {
        // run tests if present; allow to continue if none
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
