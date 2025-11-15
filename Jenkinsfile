pipeline {
  agent any

  tools {
    nodejs 'NodeJS_18'
  }

  environment {
    NODE_ENV = 'production'
    NPM_CONFIG_REGISTRY = 'https://registry.npm.org/'
    NPM_CONFIG_FETCH_RETRIES = '5'
    NPM_CONFIG_FETCH_RETRY_FACTOR = '2'
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT = '1000'
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT = '60000'

    // server deploy path (adjust if needed)
    DEPLOY_DIR = '/var/www/ai-chatbot-admin'
    // directory inside DEPLOY_DIR that will host the live app
    CURRENT_DIR = "${env.DEPLOY_DIR}/current"
  }

  stages {

    stage('Prepare workspace') {
      steps {
        script { 
          echo "Cleaning workspace..."
          deleteDir()
        }
      }
    }

    stage('Checkout') {
      steps {
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

    stage('Deploy (atomic)') {
      when { branch 'main' }
      steps {
        script {
          // Variables
          def tmp = "${env.DEPLOY_DIR}/tmp-deploy-${env.BUILD_NUMBER}"
          sh """
            set -e
            echo "Preparing atomic deploy workspace: ${tmp}"
            rm -rf "${tmp}"
            mkdir -p "${tmp}"

            # rsync workspace -> tmp (exclude env files and node_modules and git)
            rsync -av --delete \
              --exclude '.git' \
              --exclude 'node_modules' \
              --exclude '.env' \
              --exclude '.env.production' \
              ./ "${tmp}/"

            # If the server already has a .env.production, copy it to tmp (do not overwrite server envs)
            if [ -f "${CURRENT_DIR}/.env.production" ]; then
              echo "Copying existing production env into tmp (will not overwrite server .env.production)"
              cp -f "${CURRENT_DIR}/.env.production" "${tmp}/.env.production"
              chmod 640 "${tmp}/.env.production"
            fi

            # Ensure ownership (jenkins should own deploy dirs)
            chown -R jenkins:jenkins "${tmp}" || true

            # Optional: keep a backup of current
            if [ -d "${CURRENT_DIR}" ]; then
              mv "${CURRENT_DIR}" "${DEPLOY_DIR}/current_old_${BUILD_NUMBER}" || true
            fi

            # Atomic move
            mv "${tmp}" "${CURRENT_DIR}"

            # Make sure jenkins owns the final dir
            chown -R jenkins:jenkins "${CURRENT_DIR}"
          """
          // Install production dependencies & prepare runtime (run as jenkins)
          sh """
            set -e
            cd ${CURRENT_DIR}
            echo "Installing production dependencies..."
            npm install --omit=dev --no-audit --no-fund

            echo "Generating Prisma client..."
            npx prisma generate || true

            # If you use migrations in future: npx prisma migrate deploy
          """
          // Restart PM2 using --update-env so any env changes in server are picked up
          sh """
            set -e
            cd ${CURRENT_DIR}
            echo "Restarting app (pm2)..."
            pm2 restart ai-admin-console --update-env || pm2 start npm --name ai-admin-console -- start
            pm2 save
          """
        }
      }
    }
  }

  post {
    success { echo 'Pipeline SUCCESS' }
    failure { echo 'Pipeline FAILED' }
  }
}
