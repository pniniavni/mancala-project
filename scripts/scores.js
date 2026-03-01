/**
 * ניהול דף השיאים - שימוש ב-DOM ו-HOF
 */
document.addEventListener('DOMContentLoaded', () => {
    const scoresBody = document.querySelector('#scores-body');
    const results = JSON.parse(localStorage.getItem('mancala_results') || "[]");

    // יצירת טבלה דינמית (דרישה 18)
    results.forEach(res => {
        const row = document.createElement('tr');
        
        // שימוש ב-map ליצירת התאים (HOF) (דרישה 9)
        const cells = [res.player, res.score, res.date].map(text => {
            const td = document.createElement('td');
            td.textContent = text;
            return td;
        });

        cells.forEach(td => row.appendChild(td));
        scoresBody.appendChild(row);
    });
});