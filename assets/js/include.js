// assets/js/include.js
document.addEventListener('DOMContentLoaded', () => {
    const includeTargets = document.querySelectorAll('[data-include]');
    const total = includeTargets.length;

    // If there are no includes, still fire the event so main.js can run.
    if (!total) {
        document.dispatchEvent(new Event('includesLoaded'));
        return;
    }

    let loaded = 0;

    includeTargets.forEach(el => {
        const url = el.getAttribute('data-include');
        if (!url) {
            checkDone();
            return;
        }

        fetch(url)
            .then(resp => {
                if (!resp.ok) throw new Error(`Failed to load ${url}`);
                return resp.text();
            })
            .then(html => {
                el.innerHTML = html;
                checkDone();
            })
            .catch(err => {
                console.error(err);
                el.innerHTML = '<!-- include failed -->';
                checkDone();
            });
    });

    function checkDone() {
        loaded++;
        if (loaded === total) {
            document.dispatchEvent(new Event('includesLoaded'));
        }
    }
});
