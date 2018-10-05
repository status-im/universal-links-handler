var QRCode = require('qrcode');

function makeQrCodeDataUri(x) {
  return QRCode.toDataURL(x);
}

module.exports = { makeQrCodeDataUri };
