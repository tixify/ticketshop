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
    iframe.style.height = '800px'; // initial
