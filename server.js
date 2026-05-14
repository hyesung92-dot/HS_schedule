require('dotenv').config(); // .env 파일의 환경변수를 불러오는 모듈
const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // MongoDB 연동 모듈
const app = express();
const port = 8080; // 다른 프로젝트와 충돌하지 않도록 포트 번호 변경

// JSON 형태의 요청 데이터를 파싱하기 위한 설정
app.use(express.json());

// 중요: 현재 폴더(__dirname)의 파일들을 브라우저에서 접근할 수 있도록 정적 폴더로 설정합니다.
// 이 설정이 있어야 Cannot GET /leave_management.html 에러가 사라집니다.
app.use(express.static(__dirname));

// 기본 주소(http://localhost:3000)로 접속 시 자동으로 HTML 파일을 보여주도록 설정 추가
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'leave_management.html'));
});

const mongoURI = process.env.MONGODB_URI; // .env 또는 Render 환경변수에서 MongoDB 주소를 가져옴

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB에 성공적으로 연결되었습니다!'))
    .catch(err => console.error('MongoDB 연결 실패:', err));

// 휴가 데이터를 저장할 형태(스키마) 정의
const leaveSchema = new mongoose.Schema({
    date: String,
    type: String,
    hours: Number,
    approval: String,
    remarks: String
});
const Leave = mongoose.model('Leave', leaveSchema);

// [API] 휴가 내역 조회
app.get('/api/leaves', async (req, res) => {
    try {
        const leaves = await Leave.find();
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [API] 휴가 등록
app.post('/api/leaves', async (req, res) => {
    try {
        const newLeave = new Leave(req.body);
        await newLeave.save();
        res.status(201).json(newLeave);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [API] 휴가 내역 삭제
app.delete('/api/leaves/:id', async (req, res) => {
    try {
        await Leave.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: '삭제 완료' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [API] 휴가 내역 수정
app.put('/api/leaves/:id', async (req, res) => {
    try {
        const updatedLeave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedLeave) {
            res.json(updatedLeave);
        } else {
            res.status(404).send({ message: '휴가를 찾을 수 없습니다.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`서버가 정상적으로 실행되었습니다! http://localhost:${port}/leave_management.html 로 접속해보세요.`);
});