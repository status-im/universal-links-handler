#!/bin/bash

source tests/shakedown.sh

until $(curl --output /dev/null --silent --head --fail $BASE_URL/health); do
    printf '.'
    sleep 1
done

shakedown GET /.well-known/assetlinks.json
  status 200
  content_type 'application/json'
  contains 'sha256_cert_fingerprints'

shakedown GET /.well-known/apple-app-site-association
  status 200
  content_type 'application/json'
  contains 'im.status.ethereum'

# Android test
shakedown GET / -H "User-Agent: Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/60.0.3112.107 Mobile Safari/537.36"
  header_contains 'Location' 'https://play.google.com/store/apps/details?id=im.status.ethereum'
  status 302

# IOS
shakedown GET / -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
  header_contains 'Location' 'https://status.im/success'
  status 302

# Anything else
shakedown GET / -H "User-Agent: Unknown"
  header_contains 'Location' 'https://status.im'
  status 302


shakedown GET /chat/public/abc
  status 200

shakedown GET /user/blah
  status 200

shakedown GET /browse/www.test.com
  status 200

shakedown GET /browse/www.test.com/blah/blah
  status 200

shakedown GET /health
  status 200
  contains 'OK'
