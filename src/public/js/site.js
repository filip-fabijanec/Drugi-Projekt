const commentsElement = document.querySelector('#comments');

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
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Obriši';
        deleteButton.addEventListener('click', async () => {
            deleteButton.disabled = true;
            try {
                const deleteResponse = await fetch('/comment/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ index: String(comments.indexOf(comment)) })
                });
                if (!deleteResponse.ok) {
                    throw new Error(`Brisanje komentara nije uspjelo: ${deleteResponse.status}`);
                }
                await loadComments();
            } catch (error) {
                console.error(error);
                deleteButton.disabled = false;
                alert('Komentar nije obrisan. Provjerite jeste li prijavljeni.');
            }
        });

        author.textContent = comment.username;
        text.textContent = comment.text;
        item.append(author, text, deleteButton);
        commentsElement.append(item);
    }
}

if (commentsElement) {
    loadComments();
}