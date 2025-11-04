// integrate.js - Tixify Embed v5
// Uses iframe-resizer@5 (parent) for cross-domain compatibility
// Each .shop-frame or #shop-frame -> iframe with scroll

(function () {
  'use strict';

  var PARENT_CDN = 'https://cdn.jsdelivr.net/npm/@iframe-resizer/parent@5.5.7';

  // Default iframe-resizer settings
  // Here we disable automatic height resizing and allow scrolling inside iframe
  var DEFAULT_OPTIONS = {
    checkOrigin: false,
    direction: 'none', // no automatic resizing, iframe handles its own scroll
    log: false,
    scrolling: true,
    // license: 'GPLv3' // uncomment if open-source; set license key for commercial usage
  };

  function findContainers() {
    return document.querySelectorAll('#shop-frame, .shop-frame');
  }

  function createIframeFor(container) {
    var url = container.getAttribute('data-url');
    if (!url) {
      console.warn('Tixify Integrate: missing data-url', container);
      return null;
    }

    // Skip duplicates
    if (container.querySelector('iframe')) return container.querySelector('iframe');

    // Apply 800px fixed width container
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';
    container.style.width = '100%';
    container.style.position = 'relative';

    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.id = 'tixify-shop-' + Math.random().toString(36).slice(2, 9);
    iframe.title = 'Tixify Shop';
    iframe.style.width = '100%';
    iframe.style.height = '800px'; // initial visible height
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.setAttribute('scrolling', 'yes'); // allow internal scrollbars
    iframe.setAttribute('allowfullscreen', '');

    container.appendChild(iframe);
    return iframe;
  }

  function loadParentLibOnce(cb) {
    if (typeof window.iframeResize === 'function') return cb();

    if (document.querySelector('script[data-tixify-iframes-resizer]')) {
      // Wait until available
      var wait = setInterval(function () {
        if (typeof window.iframeResize === 'function') {
          clearInterval(wait);
          cb();
        }
      }, 50);
      setTimeout(function () { clearInterval(wait); }, 10000);
      return;
    }

    var s = document.createElement('script');
    s.src = PARENT_CDN;
    s.async = true;
    s.defer = true;
    s.setAttribute('data-tixify-iframes-resizer', '1');
    s.onload = cb;
    s.onerror = function () {
      console.error('Tixify Integrate: failed to load iframe-resizer parent script');
      cb(new Error('iframe-resizer load failed'));
    };
    document.head.appendChild(s);
  }

  function init() {
    var containers = findContainers();
    if (!containers.length) return;

    var iframes = [];
    containers.forEach(function (container) {
      var iframe = createIframeFor(container);
      if (iframe) iframes.push(iframe);
    });

    if (!iframes.length) return;

    loadParentLibOnce(function () {
      try {
        var bindFn = window.iframeResize || (window.iframeResize && window.iframeResize.default);
        if (typeof bindFn !== 'function') {
          console.warn('Tixify Integrate: iframeResize() not found after loading.');
          return;
        }
        bindFn(DEFAULT_OPTIONS, iframes);
      } catch (e) {
        console.error('Tixify Integrate: iframe-resizer init error', e);
      }
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  window.TixifyShopEmbed = { init: init };
})();