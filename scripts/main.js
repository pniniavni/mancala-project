const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.querySelector('#username').value;
    localStorage.setItem('currentPlayer', username);
    window.location.href = "pages/game.html";
});