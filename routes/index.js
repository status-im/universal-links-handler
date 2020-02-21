var path = require('path');
var express = require('express')
var StatusIm = require('js-status-chat-name')
var links = require('../resources/links.json')
var assetLinks = require('../resources/assetlinks.json')
var appleSiteAssociation = require('../resources/apple-app-site-association.json')
var utils = require('../utils')

var router = express.Router()

/* Helper for generating pages */
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

/* Open Website/Dapp in Status */
const handleSite = (req, res) => {
  let { url } = req.params
  url = url.replace(/https?:\/\//, '')
  genPage(res, {
    title: `Browse to ${url} in Status`,
    info: `Browse to ${url} in Status`,
    copyTarget: url,
    headerName: `<a href="https://${url}">${url}</a>`,
    path: fullUrl(req, `/b/${url}`),
  })
}

/* Open User Profile from Chat Key in Status */
const handleChatKey = (req, res) => {
  const chatKey = req.params[0]
  chatName = StatusIm.chatKeyToChatName(chatKey)
  genPage(res, {
    title: `Join ${chatName} in Status`,
    info: `Chat and transact with <span>${chatKey}</span> in Status.`,
    copyTarget: chatKey,
    headerName: chatName,
    path: fullUrl(req),
  })
}

/* Open User Profile from ENS Name in Status */
const handleEnsName = (req, res) => {
  let username
  try {
    username = utils.normalizeEns(req.params[0])
  } catch(error) { /* ENS names have the widest regex: .+ */
    console.error(`Failed to parse: "${req.params[0]}", Error:`, error.message)
    res.render('index', { title: 'Invalid Username Format!', error })
    return
  }
  genPage(res, {
    title: `Join @${username} in Status`,
    info: `Chat and transact with <span>@${username}</span> in Status.`,
    copyTarget: username,
    headerName: `@${utils.showSpecialChars(username)}`,
    path: fullUrl(req, `/@${username}`),
  })
}

/* Open Public Channel in Status */
const handlePublicChannel = (req, res) => {
  const chatName = req.params[0]
  genPage(res, {
    title: `Join #${chatName} in Status`,
    info: `Join public channel <span>#${chatName}</span> on Status.`,
    headerName: `#${chatName}`,
    copyTarget: chatName, 
    path: fullUrl(req),
  })
}

router.get('/.well-known/assetlinks.json', (req, res) => {
  res.json(assetLinks)
})

router.get('/.well-known/apple-app-site-association', (req, res) => {
  res.json(appleSiteAssociation)
})

router.get('/health', (req, res) => res.send('OK'))

router.get('/b/:url(*)', handleSite)      
router.get('/browse/:url(*)', handleSite) /* Legacy */

router.get(/^\/(0[xX]04[0-9a-fA-F]{128})$/, handleChatKey)
router.get(/^\/user\/(0[xX]04[0-9a-fA-F]{128})$/, handleChatKey) /* Legacy */

router.get(/^\/@(.+)$/, handleEnsName)
router.get(/^\/user\/(.+)$/, handleEnsName) /* Legacy */

router.get(/^\/([a-z0-9-]+)$/, handlePublicChannel)
router.get(/^\/chat\/public\/([a-z0-9-]+)$/, handlePublicChannel)

/* Catchall for everything else */
router.get('*',  (req, res, next) => {
  if (req.query.redirect) {
    return next()
  }
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.header('Expires', '-1')
  res.header('Pragma', 'no-cache')

  let userAgent = req.headers['user-agent']
  let redirect = links.getStatus
  if (utils.isAndroid(userAgent)) {
    redirect = links.playStore
  } else if (utils.isIOS(userAgent)) {
    redirect = links.appleStore
  }

  return res.redirect(redirect)
})

module.exports = router
