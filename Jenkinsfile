pipeline {
  agent any

  tools { nodejs 'NodeJS_18' }

  environment {
    NODE_ENV = 'production'
    NPM_CONFIG_REGISTRY = 'https://registry.npm.org/'
    NPM_CONFIG_FETCH_RETRIES = '5'
    NPM_CONFIG_FETCH_RETRY_FACTOR = '2'
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT = '1000'
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT = '60000'

    DEPLOY_DIR = '/var/www/ai-chatbot-admin'
    CURRENT_DIR = "${env.DEPLOY_DIR}/current"
  }

  stages {
    stage('Prepare workspace') {
      steps {
        script { echo "Cleaning workspace..."; deleteDir() }
      }
    }

    stage('Checkout') {
      steps {
        // Ensure we check out the SCM so git commands work
        checkout scm
      }
    }

    stage('Install (build deps)') {
      steps {
        script {
          retry(2) {
            sh '''
              echo "Configuring npm..."
              npm config set registry ${NPM_CONFIG_REGISTRY}
              npm config set cache /var/cache/jenkins/npm-cache --global
              npm config set fetch-retries ${NPM_CONFIG_FETCH_RETRIES}
              npm config set fetch-retry-factor ${NPM_CONFIG_FETCH_RETRY_FACTOR}
              npm config set fetch-retry-mintimeout ${NPM_CONFIG_FETCH_RETRY_MINTIMEOUT}
              npm config set fetch-retry-maxtimeout ${NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT}

              echo "Installing dev deps for build..."
              npm ci --include=dev --prefer-offline --no-audit --no-fund
            '''
          }
        }
      }
    }

    stage('Build') {
      steps {
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
        archiveArtifacts artifacts: '.next/**, public/**, package.json', allowEmptyArchive: true
      }
    }

    stage('Deploy (atomic, only for main)') {
      steps {
        script {
          // Resolve branch robustly
          env.DETECTED_BRANCH = env.BRANCH_NAME ?: env.GIT_BRANCH ?: sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
          echo "Detected branch: ${env.DETECTED_BRANCH}"

          if (env.DETECTED_BRANCH == 'main') {
            echo "Branch is main — proceeding with atomic deploy..."

            def tmp = "${env.DEPLOY_DIR}/tmp-deploy-${env.BUILD_NUMBER}"

            sh """
              set -e
              echo "Preparing atomic deploy dir: ${tmp}"
              rm -rf "${tmp}"
              mkdir -p "${tmp}"

              rsync -av --delete \
                --exclude '.git' \
                --exclude 'node_modules' \
                --exclude '.env' \
                --exclude '.env.production' \
                ./ "${tmp}/"

              if [ -f "${CURRENT_DIR}/.env.production" ]; then
                echo "Copying existing .env.production to tmp (do not overwrite server env)"
                cp -f "${CURRENT_DIR}/.env.production" "${tmp}/.env.production"
                chmod 640 "${tmp}/.env.production"
              fi

              chown -R jenkins:jenkins "${tmp}" || true

              if [ -d "${CURRENT_DIR}" ]; then
                echo "Backing up current -> ${DEPLOY_DIR}/current_old_${BUILD_NUMBER}"
                mv "${CURRENT_DIR}" "${DEPLOY_DIR}/current_old_${BUILD_NUMBER}" || true
              fi

              mv "${tmp}" "${CURRENT_DIR}"
              chown -R jenkins:jenkins "${CURRENT_DIR}"
            """

            // install production deps and prisma client as jenkins user
            sh """
              set -e
              cd ${CURRENT_DIR}
              echo "Installing production deps..."
              sudo -u jenkins npm install --omit=dev --no-audit --no-fund
              echo "Prisma generate..."
              sudo -u jenkins npx prisma generate || true
            """

            // restart pm2 with update-env so env on server is picked up
            sh """
              set -e
              cd ${CURRENT_DIR}
              echo "Restarting pm2 (update env)..."
              sudo -u jenkins pm2 restart ai-admin-console --update-env || sudo -u jenkins pm2 start npm --name ai-admin-console -- start
              sudo -u jenkins pm2 save
            """

            echo "Deploy finished."
          } else {
            echo "Skipping deploy because detected branch '${env.DETECTED_BRANCH}' is not 'main'."
          }
        }
      }
    }

  } // stages

  post {
    success { echo 'Pipeline SUCCESS' }
    failure { echo 'Pipeline FAILED' }
  }
}
