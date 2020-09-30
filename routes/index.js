const path = require('path')
const express = require('express')
const StatusIm = require('js-status-chat-name')
const links = require('../resources/links.json')
const assetLinks = require('../resources/assetlinks.json')
const appleSiteAssociation = require('../resources/apple-app-site-association.json')
const utils = require('../utils')

const router = express.Router()

/* Helper for generating pages */
const genPage = (req, res, options) => {
  /* Protection against XSS attacks */
  if (!utils.isValidUrl(options.mainTarget, useStd3ASCII=!options.whitespace)) {
    handleError(`Input contains HTML: ${options.mainTarget}`)(req, res)
    return
  }
  let qrUrl = genUrl(req, options.path)
  utils.makeQrCodeDataUri(qrUrl).then(
    qrUri => res.render('index', { ...options, qrUri }),
    error => res.render('index', options)
  )
}

/* Helper for full URLs, can specify optional path */
const genUrl = (req, path) => {
  /* Make button open user profile if on Android */
  if (utils.isAndroid(req)) {
    return `status-im:/${path}`
  }
  /* QR code doesn't work if localhost is used */
  if (process.env.NODE_ENV == 'development') {
    return `https://join.status.im${path}`
  }
  /* Otherwise just use current server endpoint */
  return `${req.protocol}://${req.hostname}${path}`
}

/* Helper for returning syntax errors */
const handleError = (msg) => (
  (req, res) => {
    res.status(400)
    res.render('index', { error: new Error(msg) })
  }
)

/* Helper for redirecting to upper case URLs */
const handleRedirect = (req, res) => {
  /* Protection against XSS attacks */
  if (!utils.isValidUrl(req.originalUrl)) {
    handleError(`Input contains HTML: ${req.originalUrl}`)(req, res)
    return
  }
  res.render('index', {
    title: 'Redirecting form upper case',
    redirect: {
      name: req.params[0].toLowerCase(),
      path: req.originalUrl.toLowerCase(),
    },
  })
}

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
  let chatKey = req.params[0]
  let uncompressedKey = chatKey
  try {
    if (!chatKey.startsWith('0x')) { /* decompress/deserialize key */
      uncompressedKey = utils.decompressKey(chatKey)
    } else { /* We accept upper case for hexadecimal public keys */
      chatKey = chatKey.toLowerCase()
    }
    chatName = StatusIm.chatKeyToChatName(uncompressedKey)
  } catch(error) {
    console.error(`Failed to parse: "${uncompressedKey}", Error:`, error.message)
    res.render('index', { title: 'Invalid chat key format!', error })
    return
  }
  genPage(req, res, {
    title: `Join ${chatName} in Status`,
    info: `Chat and transact with <span class="inline-block align-bottom w-32 truncate">${chatKey}</span> in Status.`,
    mainTarget: chatKey,
    headerName: chatName,
    path: req.originalUrl,
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
    info: `Chat and transact with <span class="inline-block align-bottom w-32 truncate">@${username}</span> in Status.`,
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
    info: `Join public channel <span class="inline-block align-bottom w-32 truncate">#${chatName}</span> in Status.`,
    mainTarget: chatName, 
    headerName: `#${chatName}`,
    path: req.originalUrl,
  })
}

/* This verifies all 3 required URL arguments are present */
const validateGroupChatArgs = (args) => {
  const requiredKeys = ['a', 'a1', 'a2']
  const argsHasKey = key => Object.keys(args).includes(key)
  if (!requiredKeys.every(argsHasKey)) {
    throw Error('Missing arguments!')
  }
  if (args.a == null || args.a.length != 132) {
    throw Error('Admin public key invalid!')
  }
  if (args.a2 == null || args.a2.length != 169) {
    throw Error('Group public key invalid!')
  }
}

/* Open Group Chat in Status */
const handleGroupChat = (req, res) => {
  try {
    validateGroupChatArgs(req.query)
  } catch(ex) {
    handleError(`Invalid group chat URL: ${ex.message}`)(req, res)
    return
  }
  let groupName = req.query.a1
  genPage(req, res, {
    title: `Join "${groupName}" group chat in Status`,
    info: `Join group chat <span class="inline-block align-bottom w-32 truncate">${groupName}</span> in Status.`,
    whitespace: true, /* Allow whitespace in group names */
    mainTarget: groupName, 
    headerName: groupName,
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

router.get(/^\/u\/(z[0-9a-zA-Z]{46,49})$/, handleChatKey)
router.get(/^\/u\/(z[0-9a-zA-Z]+)$/, handleError('Incorrect length of chat key'))
router.get(/^\/u\/(fe701[0-9a-fA-F]{66})$/, handleChatKey)
router.get(/^\/u\/(fe701[0-9a-fA-F]+)$/, handleError('Incorrect length of chat key'))
router.get(/^\/u\/(f[0-9a-fA-F]{66})$/, handleChatKey)
router.get(/^\/u\/(f[0-9a-fA-F]+)$/, handleError('Incorrect length of chat key'))
router.get(/^\/u\/(0[xX]04[0-9a-fA-F]{128})$/, handleChatKey)
router.get(/^\/u\/(0[xX]04[0-9a-fA-F]+)$/, handleError('Incorrect length of chat key'))
router.get(/^\/user\/(0[xX]04[0-9a-fA-F]{128})$/, handleChatKey) /* Legacy */

router.get(/^\/u\/([^><]*[A-Z]+[^><]*)$/, handleRedirect)
router.get(/^\/u\/([^<>]+)$/, handleEnsName)
router.get(/^\/user\/([^<>]+)$/, handleEnsName) /* Legacy */

router.get(/^\/([a-z0-9-]+)$/, handlePublicChannel)
router.get(/^\/([a-zA-Z0-9-]+)$/, handleRedirect)
router.get(/^\/chat\/public\/([a-z0-9-]+)$/, handlePublicChannel) /* Legacy */
router.get(/^\/chat\/public\/([a-zA-Z0-9-]+)$/, handleRedirect)
router.get(/^\/([a-zA-Z0-9-]+)$/, (req, res) => res.redirect(req.originalUrl.toLowerCase()))

router.get('/g/:group(*)', handleGroupChat)

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
