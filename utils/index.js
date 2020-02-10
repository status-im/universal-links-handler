var QRCode = require('qrcode')

function isChatKey(str) {
  if (typeof str != "string") {
    throw TypeError("Expected chat key to be a string.")
  }
  /* Chat keys are prefixed with 0x04 and follwed by
   * two 32 byte hexadecimal digits. */
  return /^0[xX]04[0-9a-fA-F]{128}$/.test(str.trim())
}

function makeQrCodeDataUri(x) {
  return QRCode.toDataURL(x, {width: 300})
}

function isAndroid(userAgent) {
  return userAgent.toLowerCase().indexOf("android") > -1;
}

function isIOS(userAgent) {
  return userAgent.toLowerCase().indexOf("iphone") > -1;
}

module.exports = {
  isChatKey,
  isAndroid,
  isIOS,
  makeQrCodeDataUri,
}
