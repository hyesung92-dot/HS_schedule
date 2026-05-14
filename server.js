const express = require('express');
const path = require('path');
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

// 임시 데이터베이스 역할을 할 배열 (서버를 껐다 켜면 초기화됨)
let leaveData = [];
let nextId = 1;

// [API] 휴가 내역 조회
app.get('/api/leaves', (req, res) => {
    res.json(leaveData);
});

// [API] 휴가 등록
app.post('/api/leaves', (req, res) => {
    const newLeave = {
        _id: String(nextId++), // HTML에서 삭제 시 _id를 사용하므로 고유 ID 생성
        ...req.body
    };
    leaveData.push(newLeave);
    res.status(201).json(newLeave);
});

// [API] 휴가 내역 삭제
app.delete('/api/leaves/:id', (req, res) => {
    const id = req.params.id;
    leaveData = leaveData.filter(leave => leave._id !== id);
    res.status(200).send({ message: '삭제 완료' });
});

// [API] 휴가 내역 수정
app.put('/api/leaves/:id', (req, res) => {
    const id = req.params.id;
    const index = leaveData.findIndex(leave => leave._id === id);
    if (index !== -1) {
        leaveData[index] = { ...leaveData[index], ...req.body };
        res.json(leaveData[index]);
    } else {
        res.status(404).send({ message: '휴가를 찾을 수 없습니다.' });
    }
});

app.listen(port, () => {
    console.log(`서버가 정상적으로 실행되었습니다! http://localhost:${port}/leave_management.html 로 접속해보세요.`);
});