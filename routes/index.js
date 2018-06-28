var express = require('express');
var router = express.Router();
var assetLinks = require('../resources/assetlinks.json');
var appleSiteAssociation = require('../resources/apple-app-site-association.json');

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
  res.render('index', {
    title: 'Status.im join ' + req.params.chatId + ' chat',
    path: req.originalUrl
  });
});

router.get('/user/:userId', function(req, res, next) {
  res.render('index', {
    title: 'Status.im view ' + req.params.userId + ' profile',
    path: req.originalUrl
  });
});

router.get('/browse/:url', function(req, res, next) {
  res.render('index', {
    title: 'Status.im browse ' + req.params.url + ' dapp',
    path: req.originalUrl
  });
});

module.exports = router;
