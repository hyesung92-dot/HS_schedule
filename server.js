const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;
const port = process.env.PORT || 3000;

// JSON 데이터 파싱 및 정적 파일(HTML 등) 서빙을 위한 미들웨어 설정
app.use(express.json());
app.use(express.static(__dirname));

// SQLite DB 연결 (파일 기반 DB)
const db = new sqlite3.Database(path.join(__dirname, 'leave_data.db'), (err) => {
    if (err) console.error('DB 연결 실패:', err.message);
    else console.log('SQLite 데이터베이스에 성공적으로 연결되었습니다.');
});

// 휴가 테이블 생성
db.run(`CREATE TABLE IF NOT EXISTS leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    type TEXT,
    hours INTEGER,
    approval TEXT,
    remarks TEXT
)`);

// API: 전체 휴가 데이터 조회 (GET)
app.get('/api/leaves', (req, res) => {
    db.all('SELECT * FROM leaves ORDER BY date ASC', [], (err, rows) => {
        if (err) {
            console.error('DB 조회 에러:', err.message);
            return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
        }
        res.json(rows);
    });
});

// API: 휴가 데이터 추가 (POST)
app.post('/api/leaves', (req, res) => {
    const { date, type, hours, approval, remarks } = req.body;
    
    // 서버 단 데이터 유효성 검사 (빈 값 방지)
    if (!date || !type || typeof hours !== 'number' || !approval) {
        return res.status(400).json({ error: '잘못된 요청입니다. 필수 데이터가 누락되었습니다.' });
    }

    db.run(
        `INSERT INTO leaves (date, type, hours, approval, remarks) VALUES (?, ?, ?, ?, ?)`,
        [date, type, hours, approval, remarks],
        function (err) {
            if (err) {
                console.error('DB 저장 에러:', err.message);
                return res.status(500).json({ error: '데이터 저장 중 오류가 발생했습니다.' });
            }
            res.json({ id: this.lastID });
        }
    );
});

// API: 휴가 데이터 삭제 (DELETE)
app.delete('/api/leaves/:id', (req, res) => {
    db.run(`DELETE FROM leaves WHERE id = ?`, req.params.id, function (err) {
        if (err) {
            console.error('DB 삭제 에러:', err.message);
            return res.status(500).json({ error: '데이터 삭제 중 오류가 발생했습니다.' });
        }
        res.json({ deleted: this.changes });
    });
});

app.listen(port, () => {
    console.log(`서버가 실행되었습니다: http://localhost:${port}/leave_management.html`);
});