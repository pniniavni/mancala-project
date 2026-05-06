/**
 * ניהול דף השיאים - שימוש ב-DOM ו-HOF
 */
document.addEventListener('DOMContentLoaded', () => {
    const scoresBody = document.querySelector('#scores-body');
    
    // הגנה: אם אין scoresBody ב-HTML, אל תמשיך כדי למנוע שגיאות
    if (!scoresBody) return;

    let results;
    try {
        // שליפה בטוחה מה-localStorage
        const storedData = localStorage.getItem('mancala_results');
        results = JSON.parse(storedData);
        
        // בדיקה קריטית: אם זה לא מערך, נהפוך אותו למערך ריק
        if (!Array.isArray(results)) {
            results = [];
        }
    } catch (e) {
        // אם ה-JSON שבור, נתחיל מהתחלה עם מערך ריק
        results = [];
    }

    // ניקוי הטבלה לפני הזרקה
    scoresBody.textContent = '';

    if (results.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 3;
        emptyCell.textContent = "אין עדיין שיאים להצגה";
        emptyRow.appendChild(emptyCell);
        scoresBody.appendChild(emptyRow);
        return;
    }

    // יצירת טבלה דינמית (דרישה 18)
    results.forEach(res => {
        const row = document.createElement('tr');
        
        // שימוש ב-map ליצירת התאים (HOF) (דרישה 9)
        const cells = [res.player, res.score, res.date].map(text => {
            const td = document.createElement('td');
            td.textContent = text || "-"; // הגנה מפני ערכים ריקים
            return td;
        });

        cells.forEach(td => row.appendChild(td));
        scoresBody.appendChild(row);
    });
});