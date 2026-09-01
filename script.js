// ================================
// MY MONEY - 가계부
// ================================

let transactions =
    JSON.parse(localStorage.getItem("myMoneyTransactions")) || [];

let selectedType = "expense";

let currentDate = new Date();

const categoryIcons = {
    식비: "🍚",
    교통: "🚇",
    쇼핑: "🛍️",
    여가: "🎮",
    교육: "📚",
    생활: "🏠",
    용돈: "💰",
    기타: "📦"
};


// ================================
// 초기 설정
// ================================

const dateInput = document.getElementById("date");

const today = new Date();

dateInput.value =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");


// ================================
// 숫자 포맷
// ================================

function formatMoney(number) {
    return "₩" + Number(number).toLocaleString("ko-KR");
}


// ================================
// 월 표시
// ================================

function updateMonth() {

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    document.getElementById("currentMonth").textContent =
        `${year}년 ${month}월`;

    render();
}


// ================================
// 현재 선택된 월의 데이터
// ================================

function getCurrentMonthTransactions() {

    const year = currentDate.getFullYear();
    const month =
        String(currentDate.getMonth() + 1).padStart(2, "0");

    return transactions.filter(item => {

        return item.date.startsWith(
            `${year}-${month}`
        );

    });
}


// ================================
// 화면 렌더링
// ================================

function render() {

    const monthly =
        getCurrentMonthTransactions();

    let income = 0;
    let expense = 0;

    monthly.forEach(item => {

        if (item.type === "income") {
            income += item.amount;
        } else {
            expense += item.amount;
        }

    });

    const balance = income - expense;

    document.getElementById("income").textContent =
        formatMoney(income);

    document.getElementById("expense").textContent =
        formatMoney(expense);

    document.getElementById("balance").textContent =
        formatMoney(balance);

    renderTransactions(monthly);

    renderChart(monthly);
}


// ================================
// 내역 표시
// ================================

function renderTransactions(list) {

    const container =
        document.getElementById("transactionList");

    const empty =
        document.getElementById("emptyMessage");

    container.innerHTML = "";

    if (list.length === 0) {

        empty.style.display = "block";

        return;

    }

    empty.style.display = "none";

    const sorted = [...list].sort(
        (a, b) =>
            new Date(b.date) - new Date(a.date)
    );

    sorted.forEach(item => {

        const div =
            document.createElement("div");

        div.className = "transaction";

        const sign =
            item.type === "income" ? "+" : "-";

        const amountClass =
            item.type === "income"
                ? "income"
                : "expense";

        div.innerHTML = `

            <div class="transaction-icon">
                ${categoryIcons[item.category] || "📦"}
            </div>

            <div class="transaction-info">

                <strong>
                    ${escapeHTML(item.memo || item.category)}
                </strong>

                <span>
                    ${item.category} · ${item.date}
                </span>

            </div>

            <div class="transaction-amount ${amountClass}">
                ${sign}${formatMoney(item.amount)}
            </div>

            <button
                class="delete-btn"
                onclick="deleteTransaction('${item.id}')"
            >
                ✕
            </button>

        `;

        container.appendChild(div);

    });
}


// ================================
// HTML 보안 처리
// ================================

function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ================================
// 수입 / 지출 버튼
// ================================

document.querySelectorAll(".type-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".type-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            selectedType =
                button.dataset.type;

        });

    });


// ================================
// 내역 추가
// ================================

document
    .getElementById("transactionForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const amount =
            Number(
                document.getElementById("amount").value
            );

        const category =
            document.getElementById("category").value;

        const date =
            document.getElementById("date").value;

        const memo =
            document.getElementById("memo").value.trim();

        if (!amount || amount <= 0) {

            alert("금액을 입력해주세요.");

            return;

        }

        if (!date) {

            alert("날짜를 선택해주세요.");

            return;

        }

        const transaction = {

            id:
                Date.now().toString(),

            type:
                selectedType,

            amount:
                amount,

            category:
                category,

            date:
                date,

            memo:
                memo

        };

        transactions.push(transaction);

        saveData();

        this.reset();

        dateInput.value =
            today.getFullYear() +
            "-" +
            String(today.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(today.getDate()).padStart(2, "0");

        document.getElementById("amount").focus();

        render();

    });


// ================================
// 삭제
// ================================

function deleteTransaction(id) {

    const answer =
        confirm("이 내역을 삭제할까요?");

    if (!answer) return;

    transactions =
        transactions.filter(
            item => item.id !== id
        );

    saveData();

    render();

}


// ================================
// 전체 삭제
// ================================

document
    .getElementById("deleteAllBtn")
    .addEventListener("click", () => {

        if (transactions.length === 0) {

            alert("삭제할 내역이 없습니다.");

            return;

        }

        const answer =
            confirm(
                "모든 가계부 내역을 삭제할까요?\n\n이 작업은 되돌릴 수 없습니다."
            );

        if (!answer) return;

        transactions = [];

        saveData();

        render();

    });


// ================================
// LocalStorage 저장
// ================================

function saveData() {

    localStorage.setItem(
        "myMoneyTransactions",
        JSON.stringify(transactions)
    );

}


// ================================
// 이전 달
// ================================

document
    .getElementById("prevMonth")
    .addEventListener("click", () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        updateMonth();

    });


// ================================
// 다음 달
// ================================

document
    .getElementById("nextMonth")
    .addEventListener("click", () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        updateMonth();

    });


// ================================
// 통계 차트
// ================================

function renderChart(list) {

    const chart =
        document.getElementById("categoryChart");

    chart.innerHTML = "";

    const expenses =
        list.filter(
            item => item.type === "expense"
        );

    const total =
        expenses.reduce(
            (sum, item) =>
                sum + item.amount,
            0
        );

    document.getElementById(
        "totalExpenseText"
    ).textContent =
        formatMoney(total);

    if (expenses.length === 0) {

        chart.innerHTML = `
            <div class="empty">
                <p>이번 달 지출 데이터가 없습니다.</p>
            </div>
        `;

        return;

    }

    const categoryTotals = {};

    expenses.forEach(item => {

        if (!categoryTotals[item.category]) {
            categoryTotals[item.category] = 0;
        }

        categoryTotals[item.category] +=
            item.amount;

    });

    const sorted =
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);

    sorted.forEach(([category, amount]) => {

        const percentage =
            total === 0
                ? 0
                : (amount / total) * 100;

        const item =
            document.createElement("div");

        item.className = "chart-item";

        item.innerHTML = `

            <div class="chart-label">

                <span>
                    ${categoryIcons[category] || "📦"}
                    ${category}
                </span>

                <strong>
                    ${formatMoney(amount)}
                    · ${percentage.toFixed(0)}%
                </strong>

            </div>

            <div class="chart-bar">

                <div
                    class="chart-fill"
                    style="width:${percentage}%"
                ></div>

            </div>
        `;

        chart.appendChild(item);

    });

}


// ================================
// 다크모드
// ================================

const themeBtn =
    document.getElementById("themeBtn");

const savedTheme =
    localStorage.getItem("myMoneyTheme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀";

}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "myMoneyTheme",
        isDark ? "dark" : "light"
    );

    themeBtn.textContent =
        isDark ? "☀" : "☾";

});


// ================================
// 하단 메뉴
// ================================

function scrollToSection(sectionName) {

    let section;

    if (sectionName === "history-section") {
        section =
            document.querySelector(".history-section");
    }

    if (sectionName === "stats-section") {
        section =
            document.querySelector(".stats-section");
    }

    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// ================================
// 금액 입력으로 이동
// ================================

function focusAmount() {

    document
        .getElementById("amount")
        .focus();

    window.scrollTo({
        top:
            document
                .getElementById("amount")
                .getBoundingClientRect()
                .top +
            window.scrollY -
            150,

        behavior: "smooth"
    });

}


// ================================
// 실행
// ================================

updateMonth();