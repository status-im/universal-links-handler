var express = require('express')
var StatusIm = require('js-status-chat-name')
var assetLinks = require('../resources/assetlinks.json')
var appleSiteAssociation = require('../resources/apple-app-site-association.json')
var utils = require('../utils')

var router = express.Router()

router.get('/',  function (req, res, next) {
  if (req.query.redirect) {
    return next()
  }

  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.header('Expires', '-1')
  res.header('Pragma', 'no-cache')

  var userAgent = req.headers['user-agent']
  if (utils.isAndroid(userAgent)) {
    return res.redirect("https://play.google.com/store/apps/details?id=im.status.ethereum")
  } else if (utils.isIOS(userAgent)) {
    return res.redirect("https://testflight.apple.com/join/J8EuJmey")
  }

  return res.redirect("https://status.im")
})

router.get('/health', function(req, res) {
  res.send('OK')
})

router.get('/.well-known/assetlinks.json', function(req, res) {
  res.json(assetLinks)
})

router.get('/.well-known/apple-app-site-association', function(req, res) {
  res.json(appleSiteAssociation)
})

router.get('/chat/:chatType/:chatId', function(req, res, next) {
  const { chatId, chatType } = req.params
  const statusUri = `status-im://chat/${chatType}/${chatId}`
  const options = {
    title: `Join ${chatType} channel #${chatId} on Status`,
    info: `Join public channel <span>#${chatId}</span> on Status.`,
    headerName: `#${chatId}`,
    copyTarget: chatId, 
    path: req.originalUrl,
  }
  /* Make button open chat if on Android */
  if (utils.isAndroid(req.headers['user-agent'])) {
    options.buttonTitle = 'Open in Status'
    options.buttonUrl = statusUri
  }
  utils.makeQrCodeDataUri(statusUri).then(
    qrUri => res.render('index', { ...options, qrUri }),
    error => res.render('index', options)
  )
})

router.get('/user/:userId', function(req, res, next) {
  const { userId } = req.params
  const statusUri = `status-im://user/${userId}`
  /* chat keys can be resolved to chat names */
  let chatName = userId
  if (utils.isChatKey(userId)) {
    chatName = StatusIm.chatKeyToChatName(userId)
  }
  const options = {
    title: `Join ${chatName} in Status`,
    info: `Chat and transact with <span>${userId}</span> in Status.`,
    copyTarget: userId,
    headerName: chatName,
    path: req.originalUrl,
  }
  /* Make button open user profile if on Android */
  if (utils.isAndroid(req.headers['user-agent'])) {
    options.buttonTitle = 'Open in Status'
    options.buttonUrl = statusUri
  }
  utils.makeQrCodeDataUri(statusUri).then(
    qrUri => res.render('index', { ...options, qrUri }),
    error => res.render('index', options)
  )
})

router.get('/browse/:url(*)', function(req, res, next) {
  let { url } = req.params
  url = url.replace(/https?:\/\//, '')
  const statusUri = `status-im://browse/${url}`
  const options = {
    title: `Browse to ${url} in Status`,
    info: `Browse to ${url} in Status`,
    copyTarget: url,
    headerName: `<a href="https://${url}">${url}</a>`,
    path: req.originalUrl,
  }
  utils.makeQrCodeDataUri(statusUri).then(
    qrUri => res.render('index', { ...options, qrUri }),
    error => res.render('index', options),
  )
})

module.exports = router
