var express = require('express');
var router = express.Router();
var assetLinks = require('../resources/assetlinks.json');
var appleSiteAssociation = require('../resources/apple-app-site-association.json');

function serverSideRedirect(req, res, next) {
  function isAndroid(userAgent) {
    return userAgent.toLowerCase().indexOf("android") > -1;
  }

  function isIOS(userAgent) {
    return userAgent.toLowerCase().indexOf("iphone") > -1;
  }

  console.log(req.query);
  console.log(req.params);
  console.log(req.queryParams);

  if (req.query.redirect) {
    return next();
  }

  var userAgent = req.headers['user-agent'];

  if (isAndroid(userAgent)) {
    return res.redirect("https://play.google.com/store/apps/details?id=im.status.ethereum");
  } else if (isIOS(userAgent)) {
    return res.redirect("https://status.im/success")
  }

  return res.redirect("https://status.im")

}

router.get('/health', function(req, res) {
  res.send('OK');
});

router.get('/.well-known/assetlinks.json', function(req, res) {
  res.json(assetLinks);
});

router.get('/.well-known/apple-app-site-association', function(req, res) {
  res.json(appleSiteAssociation);
});

router.get('/chat/:chatType/:chatId', serverSideRedirect, function(req, res, next) {
  res.render('index', {
    title: 'Status.im join ' + req.params.chatId + ' chat',
    path: req.originalUrl
  });
});

router.get('/user/:userId', serverSideRedirect, function(req, res, next) {
  res.render('index', {
    title: 'Status.im view ' + req.params.userId + ' profile',
    path: req.originalUrl
  });
});

router.get('/browse/:url', serverSideRedirect, function(req, res, next) {
  res.render('index', {
    title: 'Status.im browse ' + req.params.url + ' dapp',
    path: req.originalUrl
  });
});

module.exports = router;
