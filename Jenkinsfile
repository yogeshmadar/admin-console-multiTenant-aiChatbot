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
    NPM_USER_CONFIG = "${env.HOME}/.npmrc"
    NPM_CACHE_DIR = '/var/cache/jenkins/npm-cache'
  }

  stages {
    stage('Prepare workspace') {
      steps {
        script {
          echo "Cleaning workspace to avoid stale files..."
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
              set -e
              echo "Preparing npm config for this build (local user config to avoid /etc writes)..."
              export npm_config_userconfig="${NPM_USER_CONFIG}"
              export npm_config_cache="${NPM_CACHE_DIR}"

              npm config set registry ${NPM_CONFIG_REGISTRY}
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

    stage('Deploy (atomic, only main)') {
      steps {
        script {
          def rawBranch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: sh(script: "git rev-parse --abbrev-ref HEAD 2>/dev/null || git name-rev --name-only HEAD 2>/dev/null", returnStdout: true).trim()
          def normalized = sh(script: "echo '${rawBranch}' | sed -E 's#^(refs/heads/|remotes/|origin/|remotes/origin/)##g' | sed 's#^origin/##' | sed 's#^remotes/##' | sed 's#^refs/heads/##'", returnStdout: true).trim()
          env.DETECTED_BRANCH = normalized
          echo "Raw branch: ${rawBranch}"
          echo "Detected branch (normalized): ${env.DETECTED_BRANCH}"

          if (env.DETECTED_BRANCH == 'main') {
            echo "Branch is main — proceeding with atomic deploy..."

            sh '''
              set -e
              if [ ! -d "${DEPLOY_DIR}" ]; then
                echo "DEPLOY_DIR ${DEPLOY_DIR} does not exist; attempting to create..."
                mkdir -p "${DEPLOY_DIR}" || { echo "Failed to create ${DEPLOY_DIR} - ensure directory exists and is writable by jenkins"; exit 1; }
              fi
              if [ ! -w "${DEPLOY_DIR}" ]; then
                echo "ERROR: ${DEPLOY_DIR} is not writable by the pipeline user. Fix with:"
                echo "  sudo chown -R jenkins:jenkins ${DEPLOY_DIR}"
                echo "  sudo chmod -R 755 ${DEPLOY_DIR}"
                exit 2
              fi
            '''

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
              chown -R jenkins:jenkins "${CURRENT_DIR}" || true
            """

            sh """
              set -e
              cd ${CURRENT_DIR}
              export npm_config_userconfig="${NPM_USER_CONFIG}"
              export npm_config_cache="${NPM_CACHE_DIR}"

              echo "Installing production dependencies..."
              npm install --omit=dev --no-audit --no-fund

              echo "Generating Prisma client (if present)..."
              npx prisma generate || true
            """

            sh """
              set -e
              cd ${CURRENT_DIR}
              echo "Restarting pm2 (update env if changed)..."
              pm2 restart ai-admin-console --update-env || pm2 start npm --name ai-admin-console -- start
              pm2 save || true
            """

            echo "Deploy finished successfully."
          } else {
            echo "Skipping deploy because detected branch '${env.DETECTED_BRANCH}' is not 'main'."
          }
        }
      }
    }
  }

  post {
    success { echo 'Pipeline SUCCESS' }
    failure { echo 'Pipeline FAILED - see console output' }
  }
}
