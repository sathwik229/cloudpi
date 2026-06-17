/* ============================================================
   CloudPi — Request a Demo form -> backend API (/api/leads)
   Progressive enhancement: posts JSON, shows inline status,
   protects the button, and degrades gracefully if the API
   isn't reachable (e.g. site opened as a static file).
   Override the API origin with: window.CLOUDPI_API_BASE = 'https://api.cloudpi.ai'
   ============================================================ */
(function () {
    'use strict';

    var form = document.querySelector('.demo-form');
    if (!form) return;

    var btn = form.querySelector('.demo-submit');
    var status = form.querySelector('.demo-status');
    var API = (window.CLOUDPI_API_BASE || '') + '/api/leads';

    function setStatus(msg, ok) {
        if (!status) return;
        status.textContent = msg;
        status.className = 'demo-status ' + (ok ? 'is-ok' : 'is-err');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        setStatus('', true);

        var data = {};
        new FormData(form).forEach(function (v, k) { data[k] = typeof v === 'string' ? v.trim() : v; });

        if (!data.fullName || !data.email || !data.company) {
            setStatus('Please fill in your name, work email and company.', false);
            return;
        }

        var original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Sending…';

        fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); })
            .then(function (res) {
                if (res.status >= 200 && res.status < 300 && res.body && res.body.ok) {
                    form.reset();
                    setStatus(res.body.message || 'Thanks! Your demo slot is reserved.', true);
                } else if (res.status === 422 && res.body && res.body.fields) {
                    setStatus(Object.values(res.body.fields)[0] || res.body.error || 'Please check the form.', false);
                } else if (res.status === 429) {
                    setStatus((res.body && res.body.error) || 'Too many submissions — please try again shortly.', false);
                } else {
                    setStatus((res.body && res.body.error) || 'Something went wrong. Please try again.', false);
                }
            })
            .catch(function () {
                setStatus('Could not reach the server. Make sure the backend is running (cd backend && npm start).', false);
            })
            .finally(function () {
                btn.disabled = false;
                btn.innerHTML = original;
            });
    });
})();
