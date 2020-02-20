var express = require('express');
var StatusIm = require('js-status-chat-name')
var assetLinks = require('../resources/assetlinks.json');
var appleSiteAssociation = require('../resources/apple-app-site-association.json');
var utils = require('../utils');

var router = express.Router();

router.get('/',  function (req, res, next) {
  if (req.query.redirect) {
    return next();
  }

  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');

  var userAgent = req.headers['user-agent'];
  if (utils.isAndroid(userAgent)) {
    return res.redirect("https://play.google.com/store/apps/details?id=im.status.ethereum");
  } else if (utils.isIOS(userAgent)) {
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
  /* Make button open chat if on Android */
  let buttonTitle = 'Download Status'
  let buttonUrl = 'https://status.im/get/'
  if (utils.isAndroid(req.headers['user-agent'])) {
    buttonTitle = 'Open in Status'
    buttonUrl = `status-im://chat/${chatType}/${chatId}`
  }
  chatName = `#${chatId}`;
  const options = {
    title: `Join ${chatType} channel #${chatId} on Status`,
    info: `Join public channel <span>#${chatId}</span> on Status.`,
    path: req.originalUrl,
    chatId, chatName, buttonTitle, buttonUrl
  };
  utils.makeQrCodeDataUri(chatName).then(
    qrCodeDataUri => res.render('index', { ...options, qrCodeDataUri }),
    error => res.render('index', options)
  );
});

router.get('/user/:userId', function(req, res, next) {
  const { userId } = req.params;
  /* Make button open user profile if on Android */
  let buttonTitle = 'Download Status'
  let buttonUrl = 'https://status.im/get/'
  if (utils.isAndroid(req.headers['user-agent'])) {
    buttonTitle = 'Open in Status'
    buttonUrl = `status-im://user/${userId}`
  }
  /* chat keys can be resolved to chat names */
  chatName = userId
  if (utils.isChatKey(userId)) {
    chatName = StatusIm.chatKeyToChatName(userId)
  }
  const options = {
    title: `Join ${chatName} in Status`,
    info: `Chat and transact with <span>${userId}</span> in Status.`,
    path: req.originalUrl,
    chatId: userId,
    chatName, buttonTitle, buttonUrl
  };
  utils.makeQrCodeDataUri(userId).then(
    qrCodeDataUri => res.render('index', { ...options, qrCodeDataUri }),
    error => res.render('index', options)
  );
});

router.get('/browse/:url(*)', function(req, res, next) {
  res.render('index', {
    title: `Browse to ${req.params.url} in Status`,
    path: req.originalUrl,
    id: `${req.params.url}`
  });
});

module.exports = router;
