var express = require('express');
var router = express.Router();
var assetLinks = require('../resources/assetlinks.json');
var appleSiteAssociation = require('../resources/apple-app-site-association.json');

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
    return res.redirect("https://status.im/success");
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
  res.render('index', {
    title: `View user ${req.params.userId}'s profile in Status`,
    path: req.originalUrl
  });
});

router.get('/browse/:url(*)', function(req, res, next) {
  res.render('index', {
    title: `Browse to ${req.params.url} in Status`,
    path: req.originalUrl
  });
});

module.exports = router;
