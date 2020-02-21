var express = require('express')
var StatusIm = require('js-status-chat-name')
var assetLinks = require('../resources/assetlinks.json')
var appleSiteAssociation = require('../resources/apple-app-site-association.json')
var utils = require('../utils')

var router = express.Router()

router.get('/health', (req, res) => {
  res.send('OK')
})

router.get('/.well-known/assetlinks.json', (req, res) => {
  res.json(assetLinks)
})

router.get('/.well-known/apple-app-site-association', (req, res) => {
  res.json(appleSiteAssociation)
})

const genPage = (res, options) => {
  let opts = {
    ...options,
    buttonTitle: 'Open in Status',
    buttonUrl: options.path,
  }
  utils.makeQrCodeDataUri(options.path).then(
    qrUri => res.render('index', { ...opts, qrUri }),
    error => res.render('index', opts)
  )
}

/* Helper for full URLs, can specify optional path */
const fullUrl = (req, path) => (
  `${req.protocol}://${req.hostname}${path ? path : req.originalUrl}`
)

/* Website/Dapp */
router.get('/b/:url(*)', (req, res) => {
  let { url } = req.params
  url = url.replace(/https?:\/\//, '')
  genPage(res, {
    title: `Browse to ${url} in Status`,
    info: `Browse to ${url} in Status`,
    copyTarget: url,
    headerName: `<a href="https://${url}">${url}</a>`,
    path: fullUrl(req, `/b/${url}`),
  })
})

/* Legacy Website/Dapp */
router.get('/browse/:url(*)', (req, res) => {
  res.redirect(`/b/${req.params.url}`)
})

/* User ENS Name */
router.get(/^\/@(.+)$/, (req, res) => {
  const username = req.params[0]
  genPage(res, {
    title: `Join @${username} in Status`,
    info: `Chat and transact with <span>@${username}</span> in Status.`,
    copyTarget: username,
    headerName: `@${username}`,
    path: fullUrl(req),
  })
})

/* Legacy User, key or name */
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params
  if (userId.startsWith('0x04')) {
    res.redirect(`/${userId}`) /* Chat key */
  } else {
    res.redirect(`/@${userId}`) /* ENS name */
  }
})

/* User Chat Key */
router.get(/^\/(0x04[a-f0-9]{128})$/, (req, res) => {
  const chatKey = req.params[0]
  chatName = StatusIm.chatKeyToChatName(chatKey)
  genPage(res, {
    title: `Join ${chatName} in Status`,
    info: `Chat and transact with <span>@${chatKey}</span> in Status.`,
    copyTarget: chatKey,
    headerName: chatName,
    path: fullUrl(req),
  })
})

/* Public Channel */
router.get(/^\/([a-z0-9-]+)$/, (req, res) => {
  const chatName = req.params[0]
  genPage(res, {
    title: `Join #${chatName} in Status`,
    info: `Join public channel <span>#${chatName}</span> on Status.`,
    headerName: `#${chatName}`,
    copyTarget: chatName, 
    path: fullUrl(req),
  })
})

/* Legacy Public Channel */
router.get('/chat/public/:chatId', (req, res) => {
  res.redirect(`/${req.params.chatId}`)
})

router.get('/',  (req, res, next) => {
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

  return res.redirect("https://status.im/get/")
})

module.exports = router
