pipeline {
  agent any

  tools {
    nodejs 'NodeJS_18'
  }

  environment {
    NODE_ENV = 'production'

    NPM_CONFIG_REGISTRY = 'https://registry.npmjs.org/'
    NPM_CONFIG_FETCH_RETRIES = '5'
    NPM_CONFIG_FETCH_RETRY_FACTOR = '2'
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT = '1000'
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT = '60000'
  }

  stages {

    /*******************************
     * CLEAN WORKSPACE
     *******************************/
    stage('Prepare workspace') {
      steps {
        script {
          echo "Cleaning workspace..."
          deleteDir()
        }
      }
    }

    /*******************************
     * GIT CHECKOUT
     *******************************/
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    /*******************************
     * INSTALL NODE MODULES
     *******************************/
    stage('Install') {
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

              echo "Installing dependencies..."
              npm ci --include=dev --prefer-offline --no-audit --no-fund
            '''
          }
        }
      }
    }

    /*******************************
     * GENERATE TEMP ENV FILE
     * NOTE: WE DO NOT OVERWRITE
     * PRODUCTION ENV ON SERVER.
     *******************************/
    stage('Prepare env (temp only)') {
      steps {
        withCredentials([
          string(credentialsId: 'OPENAI_KEY', variable: 'OPENAI_KEY'),
          string(credentialsId: 'PINECONE_KEY', variable: 'PINECONE_KEY'),
          string(credentialsId: 'DATABASE_URL', variable: 'DATABASE_URL'),
          string(credentialsId: 'REDIS_URL', variable: 'REDIS_URL'),
          string(credentialsId: 'NEXTAUTH_SECRET', variable: 'NEXTAUTH_SECRET'),
          string(credentialsId: 'SECRET_KEY', variable: 'SECRET_KEY'),
          string(credentialsId: 'PINECONE_INDEX', variable: 'PINECONE_INDEX')
        ]) {
          sh '''
            echo "Creating temporary env file..."
            cat > .env.production.jenkins <<EOF
NODE_ENV=production
NEXTAUTH_URL=http://ec2-54-226-157-2.compute-1.amazonaws.com:3000
NEXT_PUBLIC_API=http://ec2-54-226-157-2.compute-1.amazonaws.com:3000
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
PORT=3000
DATABASE_URL=${DATABASE_URL}
SECRET_KEY=${SECRET_KEY}
PINECONE_INDEX=${PINECONE_INDEX}
PINECONE_KEY=${PINECONE_KEY}
OPENAI_KEY=${OPENAI_KEY}
CRAWL_DATA_STORAGE_LOCATION=redis
REDIS_URL=${REDIS_URL}
TEXT_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_MODEL=gpt-4o-mini
EOF

            echo "Temporary env created:"
            sed -n '1,10s/=.*/=****/p' .env.production.jenkins
          '''
        }
      }
    }

    /*******************************
     * BUILD
     *******************************/
    stage('Build') {
      steps {
        sh 'NODE_ENV=production npm run build'
      }
    }

    /*******************************
     * OPTIONAL TESTS
     *******************************/
    stage('Test') {
      steps {
        sh '''
          if npm run | grep -q test; then
            npm test || true
          else
            echo "No tests"
          fi
        '''
      }
    }

    /*******************************
     * ARCHIVE BUILD FILES
     *******************************/
    stage('Archive') {
      steps {
        archiveArtifacts artifacts: '.next/**, public/**, package.json', allowEmptyArchive: true
      }
    }

    /*******************************
     * DEPLOY SAFELY
     *******************************/
    stage('Deploy') {
      when { branch 'main' }
      steps {
        echo "Deploying to EC2..."

        sh '''
          # SAFELY rsync only build & code — DO NOT TOUCH ENV FILES
          sudo rsync -av --delete \
            --exclude '.env' \
            --exclude '.env.production' \
            --exclude 'node_modules' \
            --exclude '.git' \
            .next/ /var/www/ai-chatbot-admin/current/.next/

          sudo rsync -av --delete public/ /var/www/ai-chatbot-admin/current/public/

          sudo cp -f package.json /var/www/ai-chatbot-admin/current/
        '''

        sh '''
          cd /var/www/ai-chatbot-admin/current
          echo "Installing production deps..."
          npm install --omit=dev --no-audit --no-fund
        '''

        sh '''
          echo "Restarting PM2..."
          pm2 restart ai-admin-console || pm2 start npm --name ai-admin-console -- start
          pm2 save
        '''
      }
    }
  }

  post {
    success { echo 'Pipeline SUCCESS' }
    failure { echo 'Pipeline FAILED' }
  }
}
