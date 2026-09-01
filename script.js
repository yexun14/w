// ==========================================
// MY MONEY
// 가계부 JavaScript
// ==========================================


// ------------------------------------------
// 저장소
// ------------------------------------------

const STORAGE_KEY = "MY_MONEY_DATA_V1";
const THEME_KEY = "MY_MONEY_THEME";


// ------------------------------------------
// 기본 데이터
// ------------------------------------------

let data =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || {

        transactions: [],

        budgets: {}

    };


// ------------------------------------------
// 상태
// ------------------------------------------

let currentDate = new Date();

currentDate.setDate(1);

let selectedType = "expense";

let selectedFilter = "all";


// ------------------------------------------
// DOM
// ------------------------------------------

const $ = id =>
    document.getElementById(id);


// ------------------------------------------
// 카테고리 아이콘
// ------------------------------------------

const icons = {

    식비: "🍚",

    교통: "🚇",

    쇼핑: "🛍️",

    여가: "🎮",

    교육: "📚",

    생활: "🏠",

    의료: "💊",

    구독: "📱",

    용돈: "💰",

    기타: "📦"

};


// ------------------------------------------
// 금액
// ------------------------------------------

function formatMoney(number) {

    return (
        "₩" +
        Number(number || 0)
            .toLocaleString("ko-KR")
    );

}


// ------------------------------------------
// 오늘 날짜
// ------------------------------------------

function getToday() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ------------------------------------------
// 현재 월
// ------------------------------------------

function getCurrentMonth() {

    const year =
        currentDate.getFullYear();

    const month =
        String(
            currentDate.getMonth() + 1
        ).padStart(2, "0");

    return `${year}-${month}`;

}


// ------------------------------------------
// 저장
// ------------------------------------------

function saveData() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(data)

    );

}


// ------------------------------------------
// 알림
// ------------------------------------------

function showToast(message) {

    const toast =
        $("toast");

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 1800);

}


// ------------------------------------------
// HTML 보안 처리
// ------------------------------------------

function escapeHTML(text) {

    return String(text)
        .replace(
            /[&<>"']/g,

            char => ({

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            }[char])

        );

}


// ------------------------------------------
// 현재 월 거래
// ------------------------------------------

function getMonthTransactions() {

    return data.transactions.filter(

        transaction =>
            transaction.date.startsWith(
                getCurrentMonth()
            )

    );

}


// ------------------------------------------
// 전체 화면 업데이트
// ------------------------------------------

function render() {

    const transactions =
        getMonthTransactions();


    // 수입

    const income =
        transactions

            .filter(
                item =>
                    item.type === "income"
            )

            .reduce(
                (sum, item) =>
                    sum + item.amount,

                0
            );


    // 지출

    const expense =
        transactions

            .filter(
                item =>
                    item.type === "expense"
            )

            .reduce(
                (sum, item) =>
                    sum + item.amount,

                0
            );


    // 월

    $("monthTitle").textContent =

        `${currentDate.getFullYear()}년 ` +
        `${currentDate.getMonth() + 1}월`;


    // 잔액

    $("balance").textContent =
        formatMoney(
            income - expense
        );


    // 수입

    $("income").textContent =
        formatMoney(income);


    // 지출

    $("expense").textContent =
        formatMoney(expense);


    // 요약

    $("summaryExpense").textContent =
        formatMoney(expense);


    $("transactionCount").textContent =
        `${transactions.length}건`;


    const days =
        new Date(

            currentDate.getFullYear(),

            currentDate.getMonth() + 1,

            0

        ).getDate();


    $("averageExpense").textContent =
        formatMoney(
            Math.round(
                expense / days
            )
        );


    renderTransactions(
        transactions
    );


    renderChart(
        transactions
    );


    renderBudget(
        expense
    );

}


// ------------------------------------------
// 거래 내역
// ------------------------------------------

function renderTransactions(
    transactions
) {

    const list =
        $("transactionList");

    const empty =
        $("empty");


    const search =
        $("search")
            .value
            .trim()
            .toLowerCase();


    let filtered =
        transactions.filter(

            item =>

                selectedFilter === "all"

                ||

                item.type === selectedFilter

        );


    filtered =
        filtered.filter(

            item => {

                const text =

                    `${item.category} ` +
                    `${item.memo || ""}`;

                return text
                    .toLowerCase()
                    .includes(search);

            }

        );


    filtered.sort(

        (a, b) =>

            b.date.localeCompare(
                a.date
            )

            ||

            b.id - a.id

    );


    list.innerHTML = "";


    if(filtered.length === 0){

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    filtered.forEach(
        transaction => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "transaction";


            const isIncome =
                transaction.type === "income";


            const sign =
                isIncome
                    ? "+"
                    : "-";


            const color =
                isIncome
                    ? "income-text"
                    : "expense-text";


            element.innerHTML = `

                <div class="transaction-icon">

                    ${
                        icons[
                            transaction.category
                        ] || "📦"
                    }

                </div>


                <div class="transaction-main">

                    <strong>

                        ${
                            escapeHTML(
                                transaction.memo
                                ||
                                transaction.category
                            )
                        }

                    </strong>


                    <span>

                        ${
                            escapeHTML(
                                transaction.category
                            )
                        }

                        ·

                        ${
                            escapeHTML(
                                transaction.date
                            )
                        }

                    </span>

                </div>


                <div
                    class="transaction-amount ${color}"
                >

                    ${sign}${formatMoney(
                        transaction.amount
                    )}

                </div>


                <button
                    class="delete-btn"
                >
                    ✕
                </button>

            `;


            element
                .querySelector(
                    ".delete-btn"
                )
                .onclick = () => {

                    deleteTransaction(
                        transaction.id
                    );

                };


            list.appendChild(
                element
            );

        }

    );

}


// ------------------------------------------
// 통계
// ------------------------------------------

function renderChart(
    transactions
) {

    const chart =
        $("chart");


    chart.innerHTML = "";


    const expenses =
        transactions.filter(

            item =>
                item.type === "expense"

        );


    const total =
        expenses.reduce(

            (sum, item) =>
                sum + item.amount,

            0

        );


    $("chartTotal").textContent =
        formatMoney(total);


    if(expenses.length === 0){

        chart.innerHTML = `

            <div class="empty">

                <p>
                    이번 달 지출 데이터가 없습니다.
                </p>

            </div>

        `;

        return;

    }


    const categories = {};


    expenses.forEach(
        item => {

            if(
                !categories[
                    item.category
                ]
            ){

                categories[
                    item.category
                ] = 0;

            }


            categories[
                item.category
            ] += item.amount;

        }

    );


    const sorted =
        Object.entries(
            categories
        ).sort(
            (a, b) =>
                b[1] - a[1]
        );


    sorted.forEach(
        ([category, amount]) => {

            const percent =
                total === 0
                    ? 0
                    : amount /
                      total *
                      100;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "chart-row";


            row.innerHTML = `

                <div class="chart-label">

                    <span>

                        ${
                            icons[
                                category
                            ] || "📦"
                        }

                        ${category}

                    </span>


                    <b>

                        ${formatMoney(
                            amount
                        )}

                        ·

                        ${percent.toFixed(
                            0
                        )}%

                    </b>

                </div>


                <div class="chart-background">

                    <div
                        class="chart-bar"
                        style="
                            width:${percent}%;
                        "
                    ></div>

                </div>

            `;


            chart.appendChild(
                row
            );

        }

    );

}


// ------------------------------------------
// 예산
// ------------------------------------------

function renderBudget(
    expense
) {

    const month =
        getCurrentMonth();


    const budget =
        Number(
            data.budgets[month] || 0
        );


    $("budgetUsed").textContent =
        `${formatMoney(expense)} 사용`;


    $("budget").value =
        budget || "";


    if(!budget){

        $("budgetPercent")
            .textContent =
            "예산 미설정";


        $("progressBar")
            .style.width =
            "0%";


        return;

    }


    const percent =
        expense /
        budget *
        100;


    $("budgetPercent")
        .textContent =
        `${Math.round(
            percent
        )}%`;


    $("progressBar")
        .style.width =
        `${Math.min(
            percent,
            100
        )}%`;


    $("progressBar")
        .style.background =
        percent > 100
            ? "var(--expense)"
            : "var(--primary)";

}


// ------------------------------------------
// 수입 / 지출 선택
// ------------------------------------------

document
    .querySelectorAll(
        ".type-btn"
    )
    .forEach(button => {

        button.onclick = () => {

            document
                .querySelectorAll(
                    ".type-btn"
                )
                .forEach(
                    btn =>
                        btn.classList
                            .remove(
                                "active"
                            )
                );


            button.classList.add(
                "active"
            );


            selectedType =
                button.dataset.type;

        };

    });


// ------------------------------------------
// 내역 추가
// ------------------------------------------

$("transactionForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const amount =
                Number(
                    $("amount").value
                );


            if(
                !amount ||
                amount <= 0
            ){

                showToast(
                    "금액을 입력해주세요."
                );

                return;

            }


            const transaction = {

                id:
                    Date.now(),

                type:
                    selectedType,

                amount:
                    amount,

                category:
                    $("category").value,

                date:
                    $("date").value,

                memo:
                    $("memo").value.trim()

            };


            data.transactions.push(
                transaction
            );


            saveData();


            event.target.reset();


            $("date").value =
                getToday();


            render();


            $("amount").focus();


            showToast(

                selectedType === "income"

                    ? "수입을 추가했습니다."

                    : "지출을 추가했습니다."

            );

        }

    );


// ------------------------------------------
// 거래 삭제
// ------------------------------------------

function deleteTransaction(
    id
){

    if(
        !confirm(
            "이 내역을 삭제할까요?"
        )
    ){

        return;

    }


    data.transactions =
        data.transactions.filter(

            item =>
                item.id !== id

        );


    saveData();

    render();

    showToast(
        "삭제했습니다."
    );

}


// ------------------------------------------
// 이전 달
// ------------------------------------------

$("prevMonth").onclick =
    () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        render();

    };


// ------------------------------------------
// 다음 달
// ------------------------------------------

$("nextMonth").onclick =
    () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        render();

    };


// ------------------------------------------
// 필터
// ------------------------------------------

document
    .querySelectorAll(
        ".filter"
    )
    .forEach(button => {

        button.onclick = () => {

            document
                .querySelectorAll(
                    ".filter"
                )
                .forEach(
                    btn =>
                        btn.classList
                            .remove(
                                "active"
                            )
                );


            button.classList.add(
                "active"
            );


            selectedFilter =
                button.dataset.filter;


            renderTransactions(
                getMonthTransactions()
            );

        };

    });


// ------------------------------------------
// 검색
// ------------------------------------------

$("search").oninput =
    () => {

        renderTransactions(
            getMonthTransactions()
        );

    };


// ------------------------------------------
// 현재 달 삭제
// ------------------------------------------

$("deleteMonth").onclick =
    () => {

        const current =
            getMonthTransactions();


        if(!current.length){

            showToast(
                "현재 달에 내역이 없습니다."
            );

            return;

        }


        if(
            confirm(
                "현재 달의 모든 내역을 삭제할까요?"
            )
        ){

            data.transactions =
                data.transactions.filter(

                    item =>
                        !item.date.startsWith(
                            getCurrentMonth()
                        )

                );


            saveData();

            render();

            showToast(
                "현재 달 내역을 삭제했습니다."
            );

        }

    };


// ------------------------------------------
// 예산 저장
// ------------------------------------------

$("saveBudget").onclick =
    () => {

        const value =
            Number(
                $("budget").value
            );


        if(value < 0){

            return;

        }


        data.budgets[
            getCurrentMonth()
        ] = value;


        saveData();

        render();

        showToast(
            "예산을 저장했습니다."
        );

    };


// ------------------------------------------
// 다크모드
// ------------------------------------------

if(
    localStorage.getItem(
        THEME_KEY
    ) === "dark"
){

    document.body.classList.add(
        "dark"
    );

    $("themeBtn").textContent =
        "☀";

}


$("themeBtn").onclick =
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(

            THEME_KEY,

            dark
                ? "dark"
                : "light"

        );


        $("themeBtn").textContent =
            dark
                ? "☀"
                : "☾";

    };


// ------------------------------------------
// 하단 메뉴
// ------------------------------------------

document
    .querySelectorAll(
        ".nav-btn"
    )
    .forEach(button => {

        button.onclick = () => {

            const target =
                button.dataset.target;


            if(target === "top"){

                window.scrollTo({

                    top: 0,

                    behavior:
                        "smooth"

                });

            }
            else{

                const element =
                    document.getElementById(
                        target
                    );


                if(element){

                    element.scrollIntoView({

                        behavior:
                            "smooth"

                    });

                }

            }

        };

    });


// ------------------------------------------
// + 버튼
// ------------------------------------------

$("quickAdd").onclick =
    () => {

        document
            .querySelector(
                ".add-card"
            )
            .scrollIntoView({

                behavior:
                    "smooth"

            });


        setTimeout(
            () =>
                $("amount").focus(),
            400
        );

    };


// ------------------------------------------
// 설정 모달
// ------------------------------------------

$("settings").onclick =
    () => {

        $("modal")
            .classList
            .add(
                "show"
            );

    };


$("closeModal").onclick =
    () => {

        $("modal")
            .classList
            .remove(
                "show"
            );

    };


// ------------------------------------------
// CSV
// ------------------------------------------

$("exportCSV").onclick =
    () => {

        const rows = [

            [
                "날짜",
                "구분",
                "카테고리",
                "금액",
                "메모"
            ],

            ...data.transactions.map(
                item => [

                    item.date,

                    item.type === "income"
                        ? "수입"
                        : "지출",

                    item.category,

                    item.amount,

                    item.memo || ""

                ]
            )

        ];


        const csv =

            "\uFEFF" +

            rows
                .map(
                    row =>
                        row
                            .map(
                                value =>
                                    `"${String(value)
                                        .replace(
                                            /"/g,
                                            '""'
                                        )}"`
                            )
                            .join(",")
                )
                .join("\n");


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "my-money.csv";


        link.click();


        URL.revokeObjectURL(
            url
        );


        showToast(
            "CSV 파일을 만들었습니다."
        );

    };


// ------------------------------------------
// 전체 데이터 삭제
// ------------------------------------------

$("resetData").onclick =
    () => {

        if(
            confirm(
                "모든 가계부 데이터를 삭제할까요?"
            )
        ){

            data = {

                transactions: [],

                budgets: {}

            };


            saveData();

            render();


            $("modal")
                .classList
                .remove(
                    "show"
                );


            showToast(
                "모든 데이터를 삭제했습니다."
            );

        }

    };


// ------------------------------------------
// 초기 날짜
// ------------------------------------------

$("date").value =
    getToday();


// ------------------------------------------
// 최초 실행
// ------------------------------------------

render();