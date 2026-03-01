const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.querySelector('#username').value;
    const level = document.querySelector('#level').value;

    localStorage.setItem('currentPlayer', username);
    localStorage.setItem('gameLevel', level);

    window.location.href = "pages/game.html";
});