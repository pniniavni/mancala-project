/**
 * @file main.js - ניהול דף הבית, טופס הכניסה ותצוגת טבלת השיאים.
 * הקובץ אחראי על קליטת שמות השחקנים, בחירת רמת הקושי והצגת הנתונים מה-localStorage.
 * עונה על דרישות: DOM, אירועים, localStorage ומיון (sort)[cite: 8, 14, 29].
 */

/**
 * מאזין לאירוע טעינת ה-DOM כדי לאתחל את תצוגת השיאים בדף הבית.
 * עונה על דרישה: הוספת אירועים דרך הקוד[cite: 22].
 */
document.addEventListener('DOMContentLoaded', () => {
    /** @type {HTMLElement} אלמנט גוף הטבלה בו יוצגו השיאים */
    const scoresBody = document.querySelector('#scores-body');
    
    /** * שליפת נתוני השיאים מהאחסון המקומי.
     * עונה על דרישה: שמירת מידע מורכב (מערך אובייקטים).
     * @type {Array<{player: string, score: number, date: string}>} 
     */
    const results = JSON.parse(localStorage.getItem('mancala_results') || "[]");
    
    /** * מיון השיאים מהגבוה לנמוך לפני התצוגה.
     * עונה על דרישה: מיון מותאם אישית של מערך אובייקטים[cite: 8].
     */
    results.sort((a, b) => b.score - a.score);
    
    /** * יצירה דינמית של שורות הטבלה והזרקתן ל-DOM.
     * עונה על דרישה: יצירת אלמנטים דינאמית ועבודה עם textContent[cite: 18, 20].
     */
    results.slice(0, 5).forEach(res => {
        const row = document.createElement('tr');
        
        /** שימוש במערך זמני וב-forEach כדי למנוע קוד כפול (DRY) [cite: 42] */
        [res.player, res.score, res.date].forEach(text => {
            const td = document.createElement('td');
            td.textContent = text; // מניעת innerHTML מטעמי אבטחה [cite: 46]
            row.appendChild(td);
        });
        
        scoresBody.appendChild(row);
    });

    /** * ניהול שליחת טופס הכניסה למשחק.
     * עונה על דרישות: אירוע submit ושימוש ב-preventDefault[cite: 23, 24].
     */
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // מניעת רענון הדף כברירת מחדל [cite: 24]
            
            /** @type {string} שם שחקן 1 */
            const p1Name = document.getElementById('p1-name').value;
            /** @type {string} שם שחקן 2 או "מחשב" */
            const p2Name = document.getElementById('p2-name')?.value || "מחשב";
            /** @type {string} רמת הקושי שנבחרה (human/ai) */
            const mode = document.getElementById('level-select').value;
            
            /** * שמירת פרטי המשתתפים לשימוש בדף המשחק.
             * עונה על דרישה: שמירת פרטי שחקן והעברת מידע[cite: 81].
             */
            localStorage.setItem('mancala_players', JSON.stringify({
                p1: p1Name,
                p2: p2Name,
                mode: mode
            }));
            
            /** * מעבר לדף המשחק תוך שימוש ב-BOM.
             * עונה על דרישה: שימוש ב-location להעברת מידע[cite: 25, 30].
             */
            window.location.href = `pages/game.html?mode=${mode}`;
        });
    }
});