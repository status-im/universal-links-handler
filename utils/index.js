const uts46 = require('idna-uts46-hx')
const isHtml = require('is-html')
const univeil = require('univeil')
const { Buffer } = require('buffer')
const multibase = require('multibase')
const secp256k1 = require('secp256k1')

const isAndroid = (req) => (
  req.headers['user-agent'].toLowerCase().indexOf("android") > -1
)

const isIOS = (req) => (
  req.headers['user-agent'].toLowerCase().indexOf("iphone") > -1
)

const isValidUrl = (text, useStd3ASCII=true) => {
  /* Remove protocol prefix */
  noPrefix = text.replace(/(^\w+:|^)\/\//, '');
  tokens = noPrefix.split('/')
  try {
    /* useStd3ASCII=true accepts only DNS domain complaint urls */
    uts46.toUnicode(tokens[0], {useStd3ASCII})
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

/* check for multiformat variant encoding of the
 * multicodec secp256k1 key identifier e7 */
const isMultiFormatSecp256k1 = (bytes) => (
  Buffer.from([231, 1]).compare(bytes.slice(0, 2)) == 0
)

/* decodes base58btc encoding and decompresses a serialized secp256k1 */
const decompressKey = (key) => {
  let cBytes = multibase.decode(key)
  if (isMultiFormatSecp256k1(cBytes)) {
    cBytes = cBytes.slice(2)
  }
  let pubKey = secp256k1.publicKeyConvert(cBytes, compressed=false)
  let multibaseHex = multibase.encode('base16', pubKey).toString()
  return '0x' + multibaseHex.substr(1)
}

module.exports = {
  isAndroid,
  isIOS,
  isValidUrl,
  normalizeEns,
  showSpecialChars,
  decompressKey,
}
