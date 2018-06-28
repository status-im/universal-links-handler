var express = require('express');
var router = express.Router();
var assetLinks = require('../resources/assetlinks.json');


router.get('/.well-known/assetlinks.json', function(req, res) {
  res.json(assetLinks);
});

router.get('/chat/:chatType/:chatId', function(req, res, next) {
  res.render('index', {
    title: 'Status.im join ' + req.params.chatId + ' chat',
    chatId: req.params.chatId,
    path: req.originalUrl
  });
});

router.get('/user/:userId', function(req, res, next) {
  res.render('index', {
    title: 'Status.im view ' + req.params.userId + ' profile',
    chatId: req.params.userId,
    path: req.originalUrl
  });
});

module.exports = router;
