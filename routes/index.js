var path = require('path');
var express = require('express')
var StatusIm = require('js-status-chat-name')
var links = require('../resources/links.json')
var assetLinks = require('../resources/assetlinks.json')
var appleSiteAssociation = require('../resources/apple-app-site-association.json')
var utils = require('../utils')

var router = express.Router()

/* Helper for generating pages */
const genPage = (req, res, options) => {
  let qrUrl = genUrl(req, options.path)
  utils.makeQrCodeDataUri(qrUrl).then(
    qrUri => res.render('index', { ...options, qrUri }),
    error => res.render('index', options)
  )
}

/* Helper for full URLs, can specify optional path */
const genUrl = (req, path) => (
  /* Make button open user profile if on Android */
  utils.isAndroid(req) ? `status-im:/${path}` :
    `${req.protocol}://${req.hostname}${path}`
)

/* Helper for returning syntax errors */
const handleError = (msg) => (
  (req, res, next) => {
    res.status(400)
    res.render('index', { error: new Error(msg) })
  }
)

/* Open Website/Dapp in Status */
const handleSite = (req, res) => {
  let { url } = req.params
  url = url.replace(/https?:\/\//, '')
  genPage(req, res, {
    title: `Browse to ${url} in Status`,
    info: `Browse to ${url} in Status`,
    mainTarget: url,
    headerName: `<a href="https://${url}">${url}</a>`,
    path: `/b/${url}`
  })
}

/* Open User Profile from Chat Key in Status */
const handleChatKey = (req, res) => {
  /* We accept upper case for chat keys */
  const chatKey = req.params[0].toLowerCase()
  try {
    chatName = StatusIm.chatKeyToChatName(chatKey)
  } catch(error) {
    console.error(`Failed to parse: "${req.params[0]}", Error:`, error.message)
    res.render('index', { title: 'Invalid chat key format!', error })
    return
  }
  genPage(req, res, {
    title: `Join ${chatName} in Status`,
    info: `Chat and transact with <span>${chatKey}</span> in Status.`,
    mainTarget: chatKey,
    headerName: chatName,
    path: `/${chatKey}`,
  })
}

/* Open User Profile from ENS Name in Status */
const handleEnsName = (req, res) => {
  let username
  try {
    username = utils.normalizeEns(req.params[0])
  } catch(error) { /* ENS names have the widest regex: .+ */
    console.error(`Failed to parse: "${req.params[0]}", Error:`, error.message)
    res.render('index', { title: 'Invalid username format!', error })
    return
  }
  genPage(req, res, {
    title: `Join @${username} in Status`,
    info: `Chat and transact with <span>@${username}</span> in Status.`,
    mainTarget: username,
    headerName: `@${utils.showSpecialChars(username)}`,
    path: req.originalUrl,
  })
}

/* Open Public Channel in Status */
const handlePublicChannel = (req, res) => {
  const chatName = req.params[0]
  genPage(req, res, {
    title: `Join #${chatName} in Status`,
    info: `Join public channel <span>#${chatName}</span> on Status.`,
    mainTarget: chatName, 
    headerName: `#${chatName}`,
    path: req.originalUrl,
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
router.get(/^\/(0[xX]04[0-9a-fA-F]{1,127})$/, handleError('Incorrect length of chat key'))
router.get(/^\/(0[xX]04[0-9a-fA-F]{129,})$/, handleError('Incorrect length of chat key'))

router.get(/^\/@.*[A-Z]+.*$/, handleError('Upper case ENS names are invalid'))
router.get(/^\/@(.+)$/, handleEnsName)
router.get(/^\/user\/(.+)$/, handleEnsName) /* Legacy */

router.get(/^\/([a-z0-9-]+)$/, handlePublicChannel)
router.get(/^\/chat\/public\/([a-z0-9-]+)$/, handlePublicChannel) /* Legacy */
router.get(/^\/([a-zA-Z0-9-]+)$/, (req, res) => res.redirect(req.originalUrl.toLowerCase()))

/* Catchall for everything else */
router.get('*',  (req, res, next) => {
  if (req.query.redirect) {
    return next()
  }
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.header('Expires', '-1')
  res.header('Pragma', 'no-cache')

  let redirect = links.getStatus
  if (utils.isAndroid(req)) {
    redirect = links.playStore
  } else if (utils.isIOS(req)) {
    redirect = links.appleStore
  }

  return res.redirect(redirect)
})

module.exports = router
