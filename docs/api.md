

// 예시: 토큰 획득
function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

// 예시: 요청 헤더 설정
fetch('/api/subscribe', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
    }
});

{
    "username": "student123",
    "password": "securepassword"
}

{
    "success": true,
    "user": {
        "id": "user_123",
        "username": "student123",
        "level": 3,
        "subscriptionStatus": false,
        "dailyLimit": 5,
        "problemsSolvedToday": 2
    }
}

{
    "error": "Invalid credentials",
    "code": "AUTH_001"
}

{
    "success": true
}

{
    "level": 3,
    "slots": 5,
    "hintType": "semi-direct",
    "maxHints": 3,
    "timeLimit": 600
}

{
    "error": "Level not found",
    "code": "GAME_001"
}

{
    "problemId": "prob_001_lvl3",
    "level": 3,
    "title": "기후 변화와 경제 성장",
    "passage": "문장A. 문장B. 문장C. 문장D. 문장E.",
    "statements": [
        "문장A",
        "문장B", 
        "문장C",
        "문장D",
        "문장E"
    ],
    "conclusion": "따라서 기후 변화 대응은 경제 성장과 조화를 이루어야 합니다.",
    "category": "사회",
    "difficulty": "medium"
}

X-CSRF-Token: <csrf-token>
Content-Type: application/json

{
    "problemId": "prob_001_lvl3",
    "path": ["문장A", "문장C", "문장E"],
    "userId": "user_123",
    "hintsUsed": 1
}

{
    "success": true,
    "correct": false,
    "connectionStrength": ["strong", "weak", "disconnected"],
    "feedback": [
        {
            "step": 1,
            "status": "correct",
            "explanation": "문장A는 문제의 원인을 올바르게 제시합니다."
        },
        {
            "step": 2,
            "status": "incorrect",
            "explanation": "문장C는 직접적인 결과가 아닌 배경 설명입니다.",
            "suggestion": "문장B를 시도해보세요."
        }
    ],
    "score": 65,
    "hintsEarned": 10,
    "levelProgress": 0.3
}

{
    "problemId": "prob_001_lvl3",
    "step": 2,
    "userId": "user_123"
}