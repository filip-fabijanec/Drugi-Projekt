const commentsElement = document.querySelector('#comments');

async function loadComments() {
    try {
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
            text.textContent = comment.text;
            item.append(author, text);
            commentsElement.append(item);
        }
    } catch (error) {
        console.error('Greška pri učitavanju komentara:', error);
        commentsElement.textContent = 'Komentari se trenutno ne mogu učitati.';
    }
}

if (commentsElement) {
    loadComments();
}