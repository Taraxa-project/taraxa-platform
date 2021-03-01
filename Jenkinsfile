pipeline {
    agent any
    environment {
        GCP_REGISTRY = 'gcr.io/jovial-meridian-249123'
        IMAGE = 'taraxa-claim-backend'
        SLACK_CHANNEL = 'jenkins'
        SLACK_TEAM_DOMAIN = 'phragmites'
        START_TIME = sh(returnStdout: true, script: 'date +%Y%m%d_%Hh%Mm%Ss').trim()
    }
    options {
      ansiColor('xterm')
      disableConcurrentBuilds()
    }
    stages {
        stage('Docker GCP Registry Login') {
            when { anyOf { branch 'develop'; branch 'main' } }
            steps {
                withCredentials([string(credentialsId: 'gcp_container_registry_key_json', variable: 'GCP_KEY')]) {
                  sh 'echo ${GCP_KEY} | docker login -u _json_key --password-stdin https://gcr.io'
                }
            }
        }
        stage('Build Docker Image') {
            when { anyOf { branch 'develop'; branch 'main' } }
            steps {
                sh 'docker build -t ${IMAGE} -f Dockerfile .'
            }
        }
        stage('Push Docker Image') {
            when { anyOf { branch 'develop'; branch 'main' } }
            steps {
                sh 'docker tag ${IMAGE} ${GCP_REGISTRY}/${IMAGE}-${BRANCH_NAME}:${GIT_COMMIT}'
                sh 'docker push ${GCP_REGISTRY}/${IMAGE}-${BRANCH_NAME}'
            }
        }
    }
post {
    always {
        cleanWs()
    }
    success {
      slackSend (channel: "${SLACK_CHANNEL}", teamDomain: "${SLACK_TEAM_DOMAIN}", tokenCredentialId: 'SLACK_TOKEN_ID',
                color: '#00FF00', message: "SUCCESSFUL: Job '${JOB_NAME} [${BUILD_NUMBER}]' (${BUILD_URL})")
    }
    failure {
      slackSend (channel: "${SLACK_CHANNEL}", teamDomain: "${SLACK_TEAM_DOMAIN}", tokenCredentialId: 'SLACK_TOKEN_ID',
                color: '#FF0000', message: "FAILED: Job '${JOB_NAME} [${BUILD_NUMBER}]' (${BUILD_URL})")
    }
  }
}
