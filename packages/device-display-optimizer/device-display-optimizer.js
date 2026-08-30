(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) root.TGAppsDeviceOptimizer = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  var document = root.document;
  var resizeTimer;
  var listenersInstalled = false;

  function clean(value) {
    return String(value || '').trim();
  }

  function identify(userAgent, platform, model) {
    var ua = clean(userAgent);
    var reportedModel = clean(model);
    var result = { manufacturer: 'Unknown', model: reportedModel || 'Unknown', platform: clean(platform) || 'Unknown' };
    var match;

    if (/iPhone|iPad|iPod/i.test(ua) || /Mac/i.test(platform) && /Mobile/i.test(ua)) {
      result.manufacturer = 'Apple';
      result.model = /iPad/i.test(ua) ? 'iPad' : /iPod/i.test(ua) ? 'iPod touch' : 'iPhone';
      result.platform = 'iOS';
    } else if (/Android/i.test(ua)) {
      result.platform = 'Android';
      match = ua.match(/Android[^;]*;\s*(?:[a-z]{2}[-_]\w+;\s*)?([^;)]+?)(?:\s+Build\/|;|\))/i);
      if (!reportedModel && match) result.model = clean(match[1]);
      if (/Samsung|SM-|GT-|SCH-|SGH-/i.test(result.model + ' ' + ua)) result.manufacturer = 'Samsung';
      else if (/Pixel|Nexus/i.test(result.model + ' ' + ua)) result.manufacturer = 'Google';
      else if (/Motorola|moto\s|XT\d/i.test(result.model + ' ' + ua)) result.manufacturer = 'Motorola';
      else if (/OnePlus|CPH\d/i.test(result.model + ' ' + ua)) result.manufacturer = 'OnePlus';
      else if (/Huawei|HUAWEI|Honor/i.test(result.model + ' ' + ua)) result.manufacturer = /Honor/i.test(result.model + ' ' + ua) ? 'Honor' : 'Huawei';
      else if (/Xiaomi|Redmi|POCO/i.test(result.model + ' ' + ua)) result.manufacturer = 'Xiaomi';
      else if (/Sony|Xperia/i.test(result.model + ' ' + ua)) result.manufacturer = 'Sony';
      else if (/Nokia/i.test(result.model + ' ' + ua)) result.manufacturer = 'Nokia';
      else if (/LG-|LGE/i.test(result.model + ' ' + ua)) result.manufacturer = 'LG';
      else if (/Android/i.test(ua)) result.manufacturer = 'Android';
    }
    return result;
  }

  function screenClass(width) {
    if (width < 360) return 'compact';
    if (width < 600) return 'phone';
    if (width < 1024) return 'tablet';
    return 'large';
  }

  function collect(model) {
    var navigator = root.navigator || {};
    var viewport = root.visualViewport;
    var width = Math.round(viewport ? viewport.width : root.innerWidth || 0);
    var height = Math.round(viewport ? viewport.height : root.innerHeight || 0);
    var identity = identify(navigator.userAgent, navigator.userAgentData && navigator.userAgentData.platform || navigator.platform, model);
    return Object.assign(identity, {
      width: width,
      height: height,
      orientation: width > height ? 'landscape' : 'portrait',
      screenClass: screenClass(width),
      pixelRatio: root.devicePixelRatio || 1,
      touch: Number(navigator.maxTouchPoints || 0) > 0
    });
  }

  function apply(profile) {
    if (!document || !document.documentElement) return profile;
    var element = document.documentElement;
    var prefix = 'tg-device-';
    Array.prototype.slice.call(element.classList).forEach(function (name) {
      if (name.indexOf(prefix) === 0) element.classList.remove(name);
    });
    element.classList.add(prefix + profile.screenClass, prefix + profile.orientation);
    if (profile.touch) element.classList.add(prefix + 'touch');
    element.dataset.tgManufacturer = profile.manufacturer;
    element.dataset.tgModel = profile.model;
    element.dataset.tgPlatform = profile.platform;
    element.style.setProperty('--tg-viewport-width', profile.width + 'px');
    element.style.setProperty('--tg-viewport-height', profile.height + 'px');
    element.style.setProperty('--tg-pixel-ratio', profile.pixelRatio);
    root.dispatchEvent(new root.CustomEvent('tgapps:devicechange', { detail: profile }));
    api.profile = profile;
    return profile;
  }

  function refresh() { return apply(collect(api.profile && api.profile.model !== 'Unknown' ? api.profile.model : '')); }
  function scheduleRefresh() {
    root.clearTimeout(resizeTimer);
    resizeTimer = root.setTimeout(refresh, 80);
  }
  function installListeners() {
    if (listenersInstalled || !root.addEventListener) return;
    listenersInstalled = true;
    root.addEventListener('resize', scheduleRefresh, { passive: true });
    root.addEventListener('orientationchange', scheduleRefresh, { passive: true });
    if (root.visualViewport) root.visualViewport.addEventListener('resize', scheduleRefresh, { passive: true });
  }
  function start() {
    var initial = refresh();
    installListeners();
    var data = root.navigator && root.navigator.userAgentData;
    if (data && data.getHighEntropyValues) {
      return data.getHighEntropyValues(['model', 'platform']).then(function (values) {
        return apply(collect(values.model));
      }).catch(function () { return initial; });
    }
    return Promise.resolve(initial);
  }
  function destroy() {
    root.removeEventListener('resize', scheduleRefresh);
    root.removeEventListener('orientationchange', scheduleRefresh);
    if (root.visualViewport) root.visualViewport.removeEventListener('resize', scheduleRefresh);
    listenersInstalled = false;
  }

  var api = { identify: identify, refresh: refresh, destroy: destroy, profile: null, ready: null };
  if (document) api.ready = start();
  return api;
});
