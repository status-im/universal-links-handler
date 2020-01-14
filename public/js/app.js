(function() {
  function buildPlayStoreUrl() {
    var androidId = $('meta[property="al:android:package"]').attr("content");
    return "https://play.google.com/store/apps/details?id=" + androidId;
  }

  function buildItunesUrl() {
    var iosId = $('meta[property="al:ios:app_store_id"]').attr("content");
    return "https://itunes.apple.com/app/status-ethereum-anywhere/id" + iosId;
  }

  function isAndroid(userAgent) {
    return userAgent.toLowerCase().indexOf("android") > -1;
  }

  function isIOS(userAgent) {
    return userAgent.toLowerCase().indexOf("iphone") > -1;
  }

  function testFlightURL() {
    return "https://testflight.apple.com/join/J8EuJmey";
  }

  function webURL() {
    return "https://status.im/";
  }

  $(document).ready(function () {
    var appStoreLink = $('.app-store-link');
    if (isAndroid(navigator.userAgent)) {
      appStoreLink.attr('href', buildPlayStoreUrl());
    } else if (isIOS(navigator.userAgent)) {
      appStoreLink.attr('href', testFlightURL());
    } else {
      appStoreLink.attr('href', webURL());
    }
  });

  var clipboard = new ClipboardJS('.copy a');

  clipboard.on('success', function(e) {
    $('.copy a').text('Copied');
    setTimeout(function() {
      $('.copy a').text('Copy');
    }, 5000);
  });

}());
