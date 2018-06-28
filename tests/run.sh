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
