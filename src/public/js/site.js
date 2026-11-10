const commentsElement = document.querySelector('#comments');
const protectionSwitch = document.querySelector('#switch');
const httponlySwitch = document.querySelector('#httponly');
const accessControlSwitch = document.querySelector('#broken-access');

let protectionEnabled = localStorage.getItem('xssProtection') === 'true';
if (protectionSwitch) {
    protectionSwitch.checked = protectionEnabled;
    protectionSwitch.addEventListener('change', () => {
        protectionEnabled = protectionSwitch.checked;
        localStorage.setItem('xssProtection', protectionEnabled);
        loadComments();
    });
}


async function loadComments() {
    const response = await fetch('/api/comments');
    if (!response.ok) {
        throw new Error(`Dohvaćanje komentara nije uspjelo: ${response.status}`);
    }

    const comments = await response.json();
    commentsElement.replaceChildren();

    if (comments.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Još nema komentara.';
        commentsElement.append(emptyMessage);
        return;
    }

    for (const comment of comments) {
        const item = document.createElement('article');
        const author = document.createElement('strong');
        const text = document.createElement('p');

        author.textContent = comment.username;
        if (protectionEnabled) {
            text.textContent = comment.text;
        } else {
            text.innerHTML = comment.text;
        }
        item.append(author, text);
        commentsElement.append(item);
    }
}

if (commentsElement) {
    loadComments();
}

httponlySwitch?.addEventListener('change', async () => {
    const response = await fetch('/security/cookie', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({httpOnly: httponlySwitch.checked})
    });

    accessControlSwitch?.addEventListener('change', async () => {
        const response = await fetch('/security/access-control', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({enabled: accessControlSwitch.checked})
        });

        if (!response.ok) {
            alert('Promjena kontrole pristupa nije uspjela.');
        }
    });

    if (!response.ok) {
        alert('Promjena HttpOnly postavke nije uspjela.');
    }
});