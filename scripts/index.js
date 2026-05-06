/**
 * @fileoverview דף הבית - טיפול בטופס התחברות ובחירת רמה
 */

/**
 * פונקציה להצגת/הסתרת שם שחקן 2 לפי בחירת הרמה
 */
const handleLevelChange = () => {
    const levelSelect = document.getElementById('level-select');
    const p2Input = document.getElementById('p2-name');
    p2Input.style.display = levelSelect.value === 'human' ? 'block' : 'none';
    p2Input.required = levelSelect.value === 'human';
};

/**
 * פונקציה לטיפול בשליחת הטופס
 * @param {Event} e - אירוע השליחה
 */
const handleFormSubmit = (e) => {
    e.preventDefault();
    const p1Name = document.getElementById('p1-name').value;
    const level = document.getElementById('level-select').value;
    const p2Name = document.getElementById('p2-name').value || "מחשב";

    const data = { p1: p1Name, p2: p2Name, mode: level };
    localStorage.setItem('mancala_players', JSON.stringify(data));

    // שימוש ב-query parameters להעברת מידע
    const params = new URLSearchParams({ level });
    window.location.href = `pages/game.html?${params}`;
};



export const getSavedPlayers = () => JSON.parse(localStorage.getItem('mancala_players') || "{}");

document.addEventListener('DOMContentLoaded', () => {
    const levelSelect = document.getElementById('level-select');
    const loginForm = document.getElementById('login-form');

    if (levelSelect && loginForm) {
        levelSelect.addEventListener('change', handleLevelChange);
        loginForm.addEventListener('submit', handleFormSubmit);
    }
});