// integrate.js - Tixify Embed v5
// Multiple shops | 700px container | Scrollable iframe | Custom border color

(function () {
  'use strict';

  var PARENT_CDN = 'https://cdn.jsdelivr.net/npm/@iframe-resizer/parent@5.5.7';

  // iframe-resizer settings (v5)
  var DEFAULT_OPTIONS = {
    checkOrigin: false,
    direction: 'none', // don't auto-resize; iframe scrolls
    log: false,
    scrolling: true,
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

    // Avoid duplicates
    if (container.querySelector('iframe')) return container.querySelector('iframe');

    // Apply 700px fixed container styling
    container.style.maxWidth = '700px';
    container.style.margin = '0 auto';
    container.style.width = '100%';
    container.style.position = 'relative';

    // Border color (customizable)
    var borderColor = container.getAttribute('data-border-color') || '#cec1cf';

    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.id = 'tixify-shop-' + Math.random().toString(36).slice(2, 9);
    iframe.title = 'Tixify Shop';
    iframe.style.width = '100%';
    iframe.style.height = '800px'; // visible area
    iframe.style.border = '1px solid ' + borderColor;
    iframe.style.borderRadius = '0.75rem';
    iframe.style.display = 'block';
    iframe.setAttribute('scrolling', 'yes');
    iframe.setAttribute('allowfullscreen', '');

    container.appendChild(iframe);
    return iframe;
  }

  function loadParentLibOnce(cb) {
    if (typeof window.iframeResize === 'function') return cb();

    if (document.querySelector('script[data-tixify-iframes-resizer]')) {
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
