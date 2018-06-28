#!/bin/bash
source tests/shakedown.sh

shakedown GET /.well-known/assetlinks.json
  status 200
  content_type 'application/json'
  contains 'sha256_cert_fingerprints'

shakedown GET /chat/public/abc
  status 200

shakedown GET /user/blah
  status 200

shakedown GET /browse/www.test.com
  status 200

shakedown GET /health
  status 200
  contains 'OK'
