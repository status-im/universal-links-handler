var express = require('express');
var assetLinks = require('../resources/assetlinks.json');
var appleSiteAssociation = require('../resources/apple-app-site-association.json');
var { makeQrCodeDataUri } = require('../utils/qrcodeUtils');

var router = express.Router();

router.get('/',  function (req, res, next) {
  function isAndroid(userAgent) {
    return userAgent.toLowerCase().indexOf("android") > -1;
  }

  function isIOS(userAgent) {
    return userAgent.toLowerCase().indexOf("iphone") > -1;
  }

  if (req.query.redirect) {
    return next();
  }

  var userAgent = req.headers['user-agent'];

  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');

  if (isAndroid(userAgent)) {
    return res.redirect("https://play.google.com/store/apps/details?id=im.status.ethereum");
  } else if (isIOS(userAgent)) {
    return res.redirect("https://testflight.apple.com/join/J8EuJmey");
  }

  return res.redirect("https://status.im");
});

router.get('/health', function(req, res) {
  res.send('OK');
});

router.get('/.well-known/assetlinks.json', function(req, res) {
  res.json(assetLinks);
});

router.get('/.well-known/apple-app-site-association', function(req, res) {
  res.json(appleSiteAssociation);
});

router.get('/chat/:chatType/:chatId', function(req, res, next) {
  const { chatId, chatType } = req.params;
  res.render('index', {
    title: `Join the ${chatType} chat: #${chatId} in Status`,
    path: req.originalUrl
  });
});

router.get('/user/:userId', function(req, res, next) {
  const { userId } = req.params;
  const options = {
    title: `View user ${userId} profile in Status`,
    path: req.originalUrl,
  };
  makeQrCodeDataUri(userId).then(
    qrCodeDataUri => res.render('index', { ...options, qrCodeDataUri }),
    error => res.render('index', options)
  );
});

router.get('/extension/:extensionEndpoint', function(req, res, next) {
  const { extensionEndpoint } = req.params;
  const options = {
    title: `Open extension ${extensionEndpoint} in Status`,
    path: req.originalUrl,
  };
  makeQrCodeDataUri('https://get.status.im/extension/' + extensionEndpoint).then(
    qrCodeDataUri => res.render('index', { ...options, qrCodeDataUri }),
    error => res.render('index', options)
  );
});

router.get('/browse/:url(*)', function(req, res, next) {
  res.render('index', {
    title: `Browse to ${req.params.url} in Status`,
    path: req.originalUrl
  });
});

module.exports = router;
