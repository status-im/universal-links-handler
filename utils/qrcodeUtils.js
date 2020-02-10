var QRCode = require('qrcode');

function makeQrCodeDataUri(x) {
  return QRCode.toDataURL(x, {width: 300});
}

module.exports = { makeQrCodeDataUri };
