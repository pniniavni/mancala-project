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
    
    // שליפת הערכים מהשדות
    const p1Input = document.getElementById('p1-name').value.trim();
    const p2Input = document.getElementById('p2-name').value.trim();
    const level = document.getElementById('level-select').value;

    // כאן הקסם: אם המשתמש לא הקליד כלום (שדה ריק), נשתמש בשם ברירת מחדל
    const p1Name = p1Input || "שחקן 1";
    
    let p2Name;
    if (level === 'human') {
        p2Name = p2Input || "שחקן 2"; // אם זה נגד חבר והשדה ריק
    } else {
        p2Name = "מחשב"; // אם זה נגד המחשב
    }

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