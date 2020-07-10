/* this is to detect if the deep link has worked */
var siteLostFocus = false;
document.addEventListener("visibilitychange", (ev) => { siteLostFocus = true; });

/* helper for waiting */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/* helper for checking if site is in focus */
const isHidden = () => document.visibilityState == 'hidden'

/* parse URL for params and return an object */
const _getParams = (url) => {
  let params = {};
  let parser = document.createElement('a');
  parser.href = url;
  let query = parser.search.substring(1);
  let vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split('=');
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
};

/* convert key/values to formatted URL arguments */
const _formatArgs = (args) => encodeURIComponent(
  Object.entries(args).map((x) => `${x[0]}=${x[1]}`).join('&')
)

const _buildPlayStoreUrl = (referrer) => (
  'https://play.app.goo.gl/?link=' + encodeURIComponent(
  'https://play.google.com/store/apps/' +
  `details?id=${_getMetaProp('al:android:package')}` +
  (typeof referrer == 'undefined' ? '' : `&referrer=${referrer}`))
)

/* helper for querying meta properties */
const _getMetaProp = (prop) => $(`meta[property="${prop}"]`).attr("content")

/* helper to detect Android/iOS user agent */
const _userAgentHas = (str) => navigator.userAgent.toLowerCase().indexOf(str) > -1

/* redirect to Referral Service for referral bonus */
const getReferralUrl = (params) => {
  return `https://get.status.im/${params.invite}`
}

/* redirect to Play Store based on URL */
const getPlayStoreUrl = (params) => {
  /* action for app to take after installation */
  let args = { out: _getMetaProp('status-im:target') }
  return _buildPlayStoreUrl(_formatArgs(args))
}

const getAppStoreUrl = () => (
  'https://apps.apple.com/us/app/status-private-communication/id1178893006'
)

const redirectToStore = () => {
  /* to avoid showing store after app has been opened */
  if (siteLostFocus || isHidden()) { return }

  let params = _getParams(window.location.href)
  var url
  /* if invite is set redirect tor referral service */
  if (params.invite) {
    url = getReferralUrl(params)
  } else if (_userAgentHas('android')) {
    url = getPlayStoreUrl(params)
  } else if (_userAgentHas('iphone')) {
    url = getAppStoreUrl()
  } else { /* there's no desktop status app */
    url = 'https://status.im/'
  }
  console.log(`Redirecting to: ${url}`)
  window.location.replace(url);
}

/* Open in Status Button --------------------------------------------------*/

const redirectToAppOrStore = () => {
  if (_userAgentHas('android')) {
    /* First try to use the Android deep link */
    window.location.replace(_getMetaProp('al:android:url'));
  } else if (_userAgentHas('iphone')) {
    window.location.replace(_getMetaProp('al:ios:url'));
  }

  /* After a timeout redirect to PlayStore */
  setTimeout(redirectToStore, 3000);

  /* return false to prevent href from taking effect */
  sleep(500);
  return !siteLostFocus;
};

/* Click Button Support ---------------------------------------------------*/

/* disable default action on click */
$('.copy a').on('click', function(event) {
  event.preventDefault();
});

/* handle all buttons with copy class */
var clipboard = new ClipboardJS('.copy a');

/* change button text after success */
clipboard.on('success', function(e) {
  $('.copy a').text('Copied');
  setTimeout(function() {
    $('.copy a').text('Copy');
  }, 5000);
});
