# Universal links handler

App to handle universal links

## Getting Started

### Prerequisites

You need to have `docker` & `docker-compose` installed

### Development

Start `docker-compose` with:

```
docker-compose -p whatever up
```

It will listen on port `8080` and mount the correct volumes so any change
is then reflected.

`node_modules` are mounted as a volume so in case you change `package-lock.json` 
will need to be re-installed in the docker container.

### Production locally

Start `docker-compose` with:

```
docker-compose -p whatever -f docker-compose.yml up
```

Don't forget to rebuild the image if you made any changes

```
docker-compose -p whatever -f docker-compose.yml build
```

It will build the image and start the container listening on port `8080`

## Running the tests

To run the tests, first start the container, either in `production` or `development` mode.

Then you can run `bash tests/run.sh -u localhost:8080` or to run against against the live server
`bash tests/run.sh -u http://get.status.im`

Uses the awesome `https://github.com/robwhitby/shakedown`

The pipeline is at:

`https://jenkins.status.im/job/misc/job/universal-links-handler/`

## Deployment

The code is automatically deployed when pushed to master
