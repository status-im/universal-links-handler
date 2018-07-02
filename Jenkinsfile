properties([disableConcurrentBuilds()])

node('linux') {

  def image_name = 'statusteam/universal-links-handler'
  def commit
  def image

  stage('Git Prep') {
    checkout scm
  	commit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
  }

  stage('Build') {
    image = docker.build(image_name + ':' + commit)
  }

  stage('Tests') {
    image.withRun('-p 8080:8080') { c ->
      sh 'tests/run.sh -u localhost:8080'
    }
  }

  stage('Publish') {
    withDockerRegistry([
			credentialsId: "dockerhub-statusteam-auto", url: ""
    ]) {
      image.push()
      image.push('deploy')
    }
  }
}
