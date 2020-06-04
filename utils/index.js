const QRCode = require('qrcode')
const uts46 = require('idna-uts46-hx')
const isHtml = require('is-html')
const univeil = require('univeil')

const isAndroid = (req) => (
  req.headers['user-agent'].toLowerCase().indexOf("android") > -1
)

const isIOS = (req) => (
  req.headers['user-agent'].toLowerCase().indexOf("iphone") > -1
)

const makeQrCodeDataUri = (x) => (
  QRCode.toDataURL(x, {width: 300})
)

const isValidUrl = (text) => {
  /* Remove protocol prefix */
  noPrefix = text.replace(/(^\w+:|^)\/\//, '');
  tokens = noPrefix.split('/')
  try {
    uts46.toUnicode(tokens[0], {useStd3ASCII: true})
  } catch(ex) {
    return false
  }
  /* Check if any of the URL tokens contains HTMLs elements */
  for (tokenRaw of tokens) {
    let token = decodeURI(tokenRaw)
    /* We check for < and > characters to cover all bases */
    if (token.match(/[<>]+/) || isHtml(token)) {
      return false
    }
  }
  /* Most probably a valid URL */
  return true
}

const normalizeEns = (name) => (
  name ? uts46.toUnicode(name, {useStd3ASCII: true}) : name
)

const showSpecialChars = (str) => univeil(str)

module.exports = {
  isAndroid,
  isIOS,
  makeQrCodeDataUri,
  isValidUrl,
  normalizeEns,
  showSpecialChars,
}
