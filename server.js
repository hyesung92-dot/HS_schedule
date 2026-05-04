require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// JSON 데이터 파싱 및 정적 파일(HTML 등) 서빙을 위한 미들웨어 설정
app.use(express.json());
app.use(express.static(__dirname));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leave_db';

// MongoDB 클라우드 연결
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB 클라우드 데이터베이스에 성공적으로 연결되었습니다.'))
    .catch(err => console.error('MongoDB 연결 실패:', err));

// 휴가 데이터 스키마 정의 (NoSQL)
const leaveSchema = new mongoose.Schema({
    date: String,
    type: String,
    hours: Number,
    approval: String,
    remarks: String
});
const Leave = mongoose.model('Leave', leaveSchema);

// API: 전체 휴가 데이터 조회 (GET)
app.get('/api/leaves', async (req, res) => {
    try {
        const leaves = await Leave.find().sort({ date: 1 });
        res.json(leaves);
    } catch (err) {
        console.error('DB 조회 에러:', err.message);
        res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
    }
});

// API: 휴가 데이터 추가 (POST)
app.post('/api/leaves', async (req, res) => {
    const { date, type, hours, approval, remarks } = req.body;
    
    // 서버 단 데이터 유효성 검사 (빈 값 방지)
    if (!date || !type || typeof hours !== 'number' || !approval) {
        return res.status(400).json({ error: '잘못된 요청입니다. 필수 데이터가 누락되었습니다.' });
    }

    try {
        const newLeave = await Leave.create({ date, type, hours, approval, remarks });
        res.json({ id: newLeave._id });
    } catch (err) {
        console.error('DB 저장 에러:', err.message);
        res.status(500).json({ error: '데이터 저장 중 오류가 발생했습니다.' });
    }
});

// API: 휴가 데이터 삭제 (DELETE)
app.delete('/api/leaves/:id', async (req, res) => {
    try {
        await Leave.findByIdAndDelete(req.params.id);
        res.json({ deleted: true });
    } catch (err) {
        console.error('DB 삭제 에러:', err.message);
        res.status(500).json({ error: '데이터 삭제 중 오류가 발생했습니다.' });
    }
});

app.listen(port, () => {
    console.log(`서버가 실행되었습니다: http://localhost:${port}/leave_management.html`);
});