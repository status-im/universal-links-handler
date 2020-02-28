const QRCode = require('qrcode')
const uts46 = require('idna-uts46-hx')
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

const normalizeEns = (name) => (
  name ? uts46.toUnicode(name, {useStd3ASCII: true, transitional: false}) : name
)

const showSpecialChars = (str) => univeil(str)

module.exports = {
  isAndroid,
  isIOS,
  makeQrCodeDataUri,
  normalizeEns,
  showSpecialChars,
}
