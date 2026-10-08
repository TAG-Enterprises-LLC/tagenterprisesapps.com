// Loaded by every web game before Flutter starts. Package assets (music,
// exit-flow art, card faces, hints, catalog) are published once under
// /shared/packages/ instead of inside each game's folder, so this sends the
// game's requests for /<game>/assets/packages/... there instead.
(function () {
  'use strict';

  var packagePath = /^\/tag_[^\/]+\/assets\/packages\//;

  function sharedUrl(url) {
    try {
      var resolved = new URL(String(url), document.baseURI);
      if (resolved.origin !== location.origin || !packagePath.test(resolved.pathname)) {
        return null;
      }
      resolved.pathname = resolved.pathname.replace(packagePath, '/shared/packages/');
      return resolved.href;
    } catch (error) {
      return null;
    }
  }

  // Flutter's asset bundle (images, text, fonts) loads through fetch.
  var originalFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' || input instanceof URL ? input : input && input.url;
    var redirected = url ? sharedUrl(url) : null;
    if (redirected) {
      input = typeof input === 'string' || input instanceof URL ? redirected : new Request(redirected, input);
    }
    return originalFetch.call(this, input, init);
  };

  // Music and sound effects play through <audio> elements.
  var srcProperty = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
  Object.defineProperty(HTMLMediaElement.prototype, 'src', {
    configurable: true,
    enumerable: srcProperty.enumerable,
    get: srcProperty.get,
    set: function (value) {
      srcProperty.set.call(this, (value && sharedUrl(value)) || value);
    }
  });
})();
