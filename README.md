

git clone <repository-url>
cd inference-detective

npm install

cp .env.example .env
# .env 파일을 열어 필요한 값 설정

node server.js

http://localhost:3000

inference-detective/
├── server.js          # Express 서버 (백엔드)
├── index.html         # 메인 HTML 파일
├── styles.css         # 스타일시트
├── app.js             # 클라이언트 사이드 로직
├── package.json       # 의존성 관리
└── .env              # 환경 변수 (생성 필요)

// 예시: 문장 드래그 이벤트
statementDiv.addEventListener("dragstart", dragStart);
statementDiv.addEventListener("dragend", dragEnd);

// 슬롯에 드롭 이벤트
slot.addEventListener("dragover", allowDrop);
slot.addEventListener("drop", drop);

// 서버 측 CSRF 미들웨어
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// 클라이언트 측 토큰 전송
const csrfToken = getCsrfToken();
fetch('/api/subscribe', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
    }
});

// 세션 기반 인증 미들웨어
function authenticateUser(req, res, next) {
    if (req.session.user) {
        req.user = db.users[req.session.user.id];
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// 문장 유효성 검사
function isValidStatement(statement) {
    return currentPassage.statements.includes(statement);
}

// 결제 검증
async function verifyPayment(paymentId) {
    // 실제 결제 검증 로직 구현
    return paymentId === 'valid_payment_id';
}

function displayRewardOptions() {
    alert("오늘의 문제를 모두 소진했습니다! 친구를 초대하거나 광고를 시청하여 추가 문제를 풀 수 있습니다.");
}

GET /api/level-config/3

{
    "slots": 5
}

X-CSRF-Token: <csrf-token>
Content-Type: application/json

{
    "paymentId": "valid_payment_id"
}

{
    "success": true
}

:root {
    --color-brand-primary: #34495E;      /* 주요 액션 버튼 */
    --color-brand-secondary: #E67E22;    /* 힌트, 보조 액션 */
    --color-success: #27AE60;            /* 강한 연결 */
    --color-warning: #F39C12;            /* 약한 연결 */
    --color-error: #E74C3C;              /* 논리 단절 */
    --color-background-page: #F8F9FA;    /* 페이지 배경 */
}

# 의존성 설치
npm install --production

# 환경 변수 설정
export NODE_ENV=production
export SESSION_SECRET=<your-secret-key>
export PORT=3000

npm install -g pm2
pm2 start server.js --name "inference-detective"
pm2 save
pm2 startup

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 디버그 모드로 실행
DEBUG=* node server.js

# 특정 포트 사용
PORT=8080 node server.js