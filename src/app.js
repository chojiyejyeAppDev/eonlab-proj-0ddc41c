let user = {
    type: 'free', // 'free' or 'paid'
    dailyLimit: 5,
    problemsSolvedToday: 0,
    level: 1,
    hints: 0,
    subscriptionStatus: false
};

const passages = [
    {
        text: "문장A. 문장B. 문장C. 결론 문장.",
        conclusion: "결론 문장",
        statements: ["문장A", "문장B", "문장C", "문장D"]
    },
    // Additional passages can be added here
];

let currentPassage = passages[0];
let inferencePath = [];

function populateTextArea() {
    const textArea = document.getElementById("text-area");
    textArea.innerHTML = `<p>${currentPassage.text}</p>`;
    currentPassage.statements.forEach(statement => {
        const statementDiv = document.createElement("div");
        statementDiv.innerText = statement;
        statementDiv.classList.add("draggable");
        statementDiv.setAttribute("draggable", true);
        statementDiv.addEventListener("dragstart", dragStart);
        statementDiv.addEventListener("dragend", dragEnd);
        textArea.appendChild(statementDiv);
    });
}

function dragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.innerText);
    event.target.classList.add("dragging");
}

function dragEnd(event) {
    event.target.classList.remove("dragging");
}

function setupSlots() {
    const slots = document.getElementById("slots");
    const numberOfSlots = getNumberOfSlotsForCurrentLevel();
    for (let i = 0; i < numberOfSlots; i++) {
        const slot = document.createElement("div");
        slot.classList.add("slot");
        slot.addEventListener("dragover", allowDrop);
        slot.addEventListener("drop", drop);
        slots.appendChild(slot);
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const statement = event.dataTransfer.getData("text/plain");
    if (isValidStatement(statement)) {
        inferencePath.push(statement);
        event.target.innerText = statement;
    } else {
        displayFeedback("유효하지 않은 문장입니다.");
    }
}

function isValidStatement(statement) {
    return currentPassage.statements.includes(statement);
}

async function submitPath() {
    const feedback = document.getElementById("feedback");
    if (inferencePath.length < 3) {
        feedback.innerText = "추론 경로를 3단계 이상 완성해야 합니다.";
        return;
    }

    // Call server-side to evaluate the inference path
    const response = await fetch('/api/evaluate-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: inferencePath })
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        displayFeedback(errorResponse.error);
        return;
    }

    const result = await response.json();
    feedback.innerText = `추론 경로가 제출되었습니다. 연결 강도: ${result.connectionStrength}`;
    
    user.problemsSolvedToday++;
    if (user.problemsSolvedToday >= user.dailyLimit) {
        displayRewardOptions();
    }
}

function displayRewardOptions() {
    alert("오늘의 문제를 모두 소진했습니다! 친구를 초대하거나 광고를 시청하여 추가 문제를 풀 수 있습니다.");
}

function getNumberOfSlotsForCurrentLevel() {
    switch (user.level) {
        case 1: return 3;
        case 2: return 4;
        case 3: return 5;
        case 4: return 5;
        case 5: return 6;
        case 6: return 6;
        case 7: return 7;
        default: return 3;
    }
}

function displayFeedback(message) {
    const feedback = document.getElementById("feedback");
    feedback.innerText = message;
}

function updateSubscriptionStatus() {
    const subscriptionStatus = document.getElementById("subscription-status");
    subscriptionStatus.innerText = user.subscriptionStatus ? "유료" : "무료";
}

async function subscribe() {
    const csrfToken = getCsrfToken(); // Fetch CSRF token from a secure location
    const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ paymentId: 'valid_payment_id' }) // Example payment ID
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        alert(errorResponse.error);
        return;
    }

    user.subscriptionStatus = true;
    user.dailyLimit = Infinity; // Unlimited problems for paid users
    updateSubscriptionStatus();
    alert("구독이 완료되었습니다! 무제한 문제를 풀 수 있습니다.");
}

function getCsrfToken() {
    // Retrieve CSRF token from cookie or meta tag
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

document.getElementById("submit-path").addEventListener("click", submitPath);
document.getElementById("subscribe-button").addEventListener("click", subscribe);
populateTextArea();
setupSlots();
updateSubscriptionStatus();