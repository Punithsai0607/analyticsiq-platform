(function () {
  "use strict";

  var API_ENDPOINT = "/api/events";
  var SESSION_KEY = "ag_session_id";

  function generateId() {
    return "sess_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now().toString(36);
  }

  function getSessionId() {
    try {
      var id = localStorage.getItem(SESSION_KEY);
      if (!id) {
        id = generateId();
        localStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch (e) {
      return generateId();
    }
  }

  function sendEvent(payload) {
    var data = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      var blob = new Blob([data], { type: "application/json" });
      navigator.sendBeacon(API_ENDPOINT, blob);
    } else {
      fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
        keepalive: true,
      }).catch(function () {});
    }
  }

  function trackEvent(type, extra) {
    var payload = Object.assign(
      {
        sessionId: getSessionId(),
        type: type,
        pageUrl: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      },
      extra || {}
    );
    sendEvent(payload);
  }

  // Track page view on load
  trackEvent("page_view");

  // Track clicks
  document.addEventListener(
    "click",
    function (e) {
      trackEvent("click", {
        clickX: e.clientX,
        clickY: e.clientY,
      });
    },
    true
  );

  // Track page views on SPA navigation (popstate / pushState)
  var pushState = history.pushState;
  history.pushState = function () {
    pushState.apply(history, arguments);
    trackEvent("page_view");
  };

  window.addEventListener("popstate", function () {
    trackEvent("page_view");
  });
})();
