// from src/app.html src="https://plausible.coracle.social/js/script.manual.js"></script>
     
!function () {
    "use strict";
    var i = window.location,
        r = window.document,
        t = r.currentScript,
        o = t.getAttribute("data-api") || new URL(t.src).origin + "/api/event",
        l = t.getAttribute("data-domain");

    function s(t, e) {
        t && console.warn("Ignoring Event: " + t),
            e && e.callback && e.callback()
    }
    function e(t, e) {

        if (/^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(i.hostname) || "file:" === i.protocol)
            return s("localhost", e);

        if ((window._phantom || window.__nightmare || window.navigator.webdriver || window.Cypress) && !window.__plausible)
            return s(null, e);

        try {
            if ("true" === window.localStorage.plausible_ignore)
                return s("localStorage flag", e)
        }
        catch (t) { }

        var n = {},
            a = (n.n = t,
                n.u = e && e.u ? e.u : i.href,
                n.d = l,
                n.r = r.referrer || null,
                e && e.meta && (n.m = JSON.stringify(e.meta)),
                e && e.props && (n.p = e.props),
                new XMLHttpRequest);

        a.open("POST", o, !0),
        a.setRequestHeader("Content-Type", "text/plain"),
        a.send(JSON.stringify(n)),
        a.onreadystatechange = function () 
            {
                4 === a.readyState && e && e.callback && e.callback({ status: a.status })
            }
    }
    var n = window.plausible && window.plausible.q || [];
    window.plausible = e;
    for (var a = 0; a < n.length; a++)
        e.apply(this, n[a])
}();