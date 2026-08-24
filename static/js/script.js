/* =========================================================
   SIRIUS AI - script.js
   Complete Frontend JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const voiceBtn = document.getElementById("voiceBtn");
    const newChatBtn = document.getElementById("newChatBtn");
    const historyBtn = document.getElementById("historyBtn");

    const themeBtn = document.getElementById("themeBtn");
    const settingsThemeBtn =
        document.getElementById("settingsThemeBtn");

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const toast = document.getElementById("toast");
    const toastMessage =
        document.getElementById("toastMessage");

    const moodStatus =
        document.getElementById("moodStatus");

    const refreshMoodBtn =
        document.getElementById("refreshMoodBtn");

    const journalText =
        document.getElementById("journalText");

    const journalTitle =
        document.getElementById("journalTitle");

    const wordCount =
        document.getElementById("wordCount");

    const saveJournalBtn =
        document.getElementById("saveJournalBtn");

    const journalDate =
        document.getElementById("journalDate");

    const journalHistory =
        document.getElementById("journalHistory");

    const clearJournalBtn =
        document.getElementById("clearJournalBtn");

    const startBreathingBtn =
        document.getElementById("startBreathingBtn");

    const stopBreathingBtn =
        document.getElementById("stopBreathingBtn");

    const breathCircle =
        document.getElementById("breathCircle");

    const breathText =
        document.getElementById("breathText");

    const breathTimer =
        document.getElementById("breathTimer");

    const breathingInstruction =
        document.getElementById("breathingInstruction");

    /* =====================================================
       GLOBAL VARIABLES
    ===================================================== */

    let moodChart = null;

    let breathingInterval = null;
    let breathingRunning = false;
    let currentBreathingPhase = 0;
    let currentBreathingTime = 4;

    let toastTimeout = null;

    let editingJournalId = null;

    let currentAudio = null;

    const currentUser =
        document.body.dataset.username || "guest";

    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        if (!toast || !toastMessage) {
            console.log(message);
            return;
        }

        toastMessage.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    /* =====================================================
       HELPER - CAPITALIZE
    ===================================================== */

    function capitalize(value) {

        if (!value) {
            return "";
        }

        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );
    }

    /* =====================================================
       SECURITY HELPER
    ===================================================== */

    function escapeHtml(text) {

        const div =
            document.createElement("div");

        div.textContent = text || "";

        return div.innerHTML;
    }

    /* =====================================================
       SIDEBAR NAVIGATION
    ===================================================== */

    const navItems =
        document.querySelectorAll(".nav-item");

    const pageSections =
        document.querySelectorAll(".page-section");

    const pageTitle =
        document.getElementById("pageTitle");

    function showSection(sectionId) {

        pageSections.forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });

        const selectedSection =
            document.getElementById(sectionId);

        if (selectedSection) {

            selectedSection.classList.add(
                "active-section"
            );
        }

        navItems.forEach(item => {

            item.classList.remove("active");

            if (
                item.dataset.section ===
                sectionId
            ) {

                item.classList.add("active");
            }
        });

        const titleMap = {

            dashboardSection: "Dashboard",
            chatSection: "AI Chat",
            moodSectionPage: "Mood Tracker",
            journalSection: "Journal",
            breathingSection: "Breathing",
            relaxSection: "Relax",
            analyticsSection: "Insights",
            settingsSection: "Settings"

        };

        if (pageTitle) {

            pageTitle.textContent =
                titleMap[sectionId] ||
                "Sirius";
        }

        /* Close mobile sidebar */

        if (sidebar) {
            sidebar.classList.remove("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("show");
        }

        /* Load mood data */

        if (
            sectionId === "moodSectionPage" ||
            sectionId === "analyticsSection"
        ) {

            loadMoodChart();
        }
    }

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            const sectionId =
                item.dataset.section;

            if (sectionId) {

                showSection(sectionId);
            }
        });
    });

    /* =====================================================
       QUICK ACTION BUTTONS
    ===================================================== */

    const openSectionButtons =
        document.querySelectorAll(
            "[data-open-section]"
        );

    openSectionButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const sectionId =
                    button.dataset.openSection;

                showSection(sectionId);
            }
        );
    });

    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    if (menuBtn) {

        menuBtn.addEventListener(
            "click",
            () => {

                if (sidebar) {
                    sidebar.classList.toggle(
                        "open"
                    );
                }

                if (sidebarOverlay) {
                    sidebarOverlay.classList.toggle(
                        "show"
                    );
                }
            }
        );
    }

    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            () => {

                if (sidebar) {
                    sidebar.classList.remove(
                        "open"
                    );
                }

                sidebarOverlay.classList.remove(
                    "show"
                );
            }
        );
    }

    /* =====================================================
       DARK MODE
    ===================================================== */

    function setTheme(darkMode) {

        document.body.classList.toggle(
            "dark-mode",
            darkMode
        );

        localStorage.setItem(
            "SiriusDarkMode",
            darkMode ? "true" : "false"
        );

        updateThemeIcons(darkMode);
    }

    function updateThemeIcons(darkMode) {

        if (themeBtn) {

            const icon =
                themeBtn.querySelector("i");

            if (icon) {

                icon.className = darkMode
                    ? "fa-solid fa-sun"
                    : "fa-solid fa-moon";
            }
        }

        if (settingsThemeBtn) {

            settingsThemeBtn.classList.toggle(
                "active",
                darkMode
            );
        }
    }

    const savedTheme =
        localStorage.getItem(
            "SiriusDarkMode"
        );

    setTheme(savedTheme === "true");

    if (themeBtn) {

        themeBtn.addEventListener(
            "click",
            () => {

                const currentlyDark =
                    document.body.classList.contains(
                        "dark-mode"
                    );

                setTheme(!currentlyDark);
            }
        );
    }

    if (settingsThemeBtn) {

        settingsThemeBtn.addEventListener(
            "click",
            () => {

                const currentlyDark =
                    document.body.classList.contains(
                        "dark-mode"
                    );

                setTheme(!currentlyDark);
            }
        );
    }

    /* =====================================================
       MOOD TRACKER
    ===================================================== */

    const moodButtons =
        document.querySelectorAll(
            "[data-mood]"
        );

    moodButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const mood =
                    button.dataset.mood;

                saveMood(mood);
            }
        );
    });

    async function saveMood(mood) {

        try {

            if (moodStatus) {

                moodStatus.textContent =
                    "Saving your mood...";
            }

            const response =
                await fetch(
                    "/save_mood",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            mood: mood
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Could not save mood."
                );
            }

            if (moodStatus) {

                moodStatus.textContent =
                    `Mood saved: ${capitalize(mood)} 💚`;
            }

            showToast(
                `${capitalize(mood)} mood saved 💚`
            );

            moodButtons.forEach(button => {

                button.classList.remove(
                    "selected"
                );

            });

            moodButtons.forEach(button => {

                if (
                    button.dataset.mood ===
                    mood
                ) {

                    button.classList.add(
                        "selected"
                    );
                }
            });

            await loadMoodChart();

        } catch (error) {

            console.error(
                "Mood error:",
                error
            );

            if (moodStatus) {

                moodStatus.textContent =
                    "Unable to save mood.";
            }

            showToast(
                "Could not save mood."
            );
        }
    }

    /* =====================================================
       LOAD MOODS
    ===================================================== */

    async function loadMoodChart() {

        try {

            const response =
                await fetch(
                    "/get_moods",
                    {
                        cache: "no-store"
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Failed to load moods."
                );
            }

            const data =
                await response.json();

            const moods =
                data.moods || [];

            createMoodChart(moods);

            updateMoodStatistics(moods);

        } catch (error) {

            console.error(
                "Chart error:",
                error
            );
        }
    }

    /* =====================================================
       CREATE MOOD CHART
    ===================================================== */

    function createMoodChart(moods) {

        const canvas =
            document.getElementById(
                "moodChart"
            );

        if (!canvas) {
            return;
        }

        if (moodChart) {

            moodChart.destroy();

            moodChart = null;
        }

        if (!Array.isArray(moods)) {
            moods = [];
        }

        const happy =
            moods.filter(
                m => m === "happy"
            ).length;

        const calm =
            moods.filter(
                m => m === "calm"
            ).length;

        const sad =
            moods.filter(
                m => m === "sad"
            ).length;

        const stressed =
            moods.filter(
                m => m === "stressed"
            ).length;

        const tired =
            moods.filter(
                m => m === "tired"
            ).length;

        const ctx =
            canvas.getContext("2d");

        moodChart =
            new Chart(
                ctx,
                {
                    type: "doughnut",

                    data: {

                        labels: [
                            "Happy 😊",
                            "Calm 😌",
                            "Sad 😔",
                            "Stress 😣",
                            "Tired 😴"
                        ],

                        datasets: [
                            {
                                data: [
                                    happy,
                                    calm,
                                    sad,
                                    stressed,
                                    tired
                                ],

                                backgroundColor: [
                                    "#55c3b1",
                                    "#60a5fa",
                                    "#a78bfa",
                                    "#f59e9e",
                                    "#94a3b8"
                                ],

                                borderWidth: 2
                            }
                        ]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        plugins: {

                            legend: {

                                display: true,

                                position:
                                    "bottom"
                            }
                        }
                    }
                }
            );
    }

    /* =====================================================
       MOOD STATISTICS
    ===================================================== */

    function updateMoodStatistics(moods) {

        const counts = {

            happy: 0,
            calm: 0,
            sad: 0,
            stressed: 0,
            tired: 0
        };

        if (Array.isArray(moods)) {

            moods.forEach(item => {

                const mood =
                    String(item)
                        .toLowerCase();

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            counts,
                            mood
                        )
                ) {

                    counts[mood]++;
                }
            });
        }

        const happyCount =
            document.getElementById(
                "happyCount"
            );

        const calmCount =
            document.getElementById(
                "calmCount"
            );

        const sadCount =
            document.getElementById(
                "sadCount"
            );

        const stressCount =
            document.getElementById(
                "stressCount"
            );

        if (happyCount) {
            happyCount.textContent =
                counts.happy;
        }

        if (calmCount) {
            calmCount.textContent =
                counts.calm;
        }

        if (sadCount) {
            sadCount.textContent =
                counts.sad;
        }

        if (stressCount) {
            stressCount.textContent =
                counts.stressed;
        }

        const total =
            Object.values(counts)
                .reduce(
                    (sum, value) =>
                        sum + value,
                    0
                );

        const scoreElement =
            document.getElementById(
                "wellnessScore"
            );

        const message =
            document.getElementById(
                "wellnessMessage"
            );

        if (total === 0) {

            if (scoreElement) {
                scoreElement.textContent = "0";
            }

            if (message) {
                message.textContent =
                    "Start tracking your mood.";
            }

            return;
        }

        const positive =
            counts.happy +
            counts.calm;

        const score =
            Math.round(
                (positive / total) * 100
            );

        if (scoreElement) {
            scoreElement.textContent =
                score;
        }

        if (message) {

            if (score >= 70) {

                message.textContent =
                    "You're doing well.";

            } else if (score >= 40) {

                message.textContent =
                    "Keep taking care of yourself.";

            } else {

                message.textContent =
                    "It's okay to have difficult days.";
            }
        }
    }

    /* =====================================================
       REFRESH MOOD
    ===================================================== */

    if (refreshMoodBtn) {

        refreshMoodBtn.addEventListener(
            "click",
            async () => {

                await loadMoodChart();

                showToast(
                    "Mood data refreshed."
                );
            }
        );
    }

    /* =====================================================
       AI CHAT
    ===================================================== */

    async function sendMessage() {

        if (!userInput || !chatBox) {
            return;
        }

        const message =
            userInput.value.trim();

        if (!message) {

            showToast(
                "Please write something first."
            );

            return;
        }

        /* Add user message immediately */

        addUserMessage(message);

        userInput.value = "";

        if (sendBtn) {
            sendBtn.disabled = true;
        }

        const typingElement =
            addTypingIndicator();

        try {

            const response =
                await fetch(
                    "/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            message: message
                        })
                    }
                );

            const data =
                await response.json();

            if (typingElement) {
                typingElement.remove();
            }

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Something went wrong."
                );
            }

            const reply =
                data.reply ||
                "I'm here with you. Tell me more.";

            addAIMessage(reply);

        } catch (error) {

            console.error(
                "Chat error:",
                error
            );

            if (typingElement) {
                typingElement.remove();
            }

            addAIMessage(
                "I'm sorry, I couldn't connect right now. Please check that your Flask server and AI API are running."
            );

        } finally {

            if (sendBtn) {
                sendBtn.disabled = false;
            }

            userInput.focus();
        }
    }

    /* =====================================================
       ADD USER MESSAGE
    ===================================================== */

    function addUserMessage(message) {

        if (!chatBox) {
            return;
        }

        const row =
            document.createElement("div");

        row.className =
            "user-message-row";

        const messageElement =
            document.createElement("div");

        messageElement.className =
            "user-message";

        messageElement.textContent =
            message;

        row.appendChild(
            messageElement
        );

        chatBox.appendChild(row);

        scrollChatToBottom();
    }

    /* =====================================================
       ADD AI MESSAGE
    ===================================================== */

    function addAIMessage(message) {

        if (!chatBox) {
            return;
        }

        const row =
            document.createElement("div");

        row.className =
            "ai-message-row";

        const avatar =
            document.createElement("div");

        avatar.className =
            "ai-avatar";

        avatar.textContent =
            "✦";

        const messageElement =
            document.createElement("div");

        messageElement.className =
            "ai-message";

        const name =
            document.createElement("div");

        name.className =
            "message-name";

        name.textContent =
            "Sirius AI";

        const content =
            document.createElement("div");

        content.className =
            "message-content";

        /*
           Markdown support
        */

        if (
            typeof marked !== "undefined"
        ) {

            content.innerHTML =
                marked.parse(message);

        } else {

            content.textContent =
                message;
        }

        messageElement.appendChild(name);

        messageElement.appendChild(
            content
        );

        row.appendChild(avatar);

        row.appendChild(
            messageElement
        );

        chatBox.appendChild(row);

        scrollChatToBottom();
    }

    /* =====================================================
       TYPING INDICATOR
    ===================================================== */

    function addTypingIndicator() {

        if (!chatBox) {
            return null;
        }

        const row =
            document.createElement("div");

        row.className =
            "ai-message-row typing-row";

        row.innerHTML = `

            <div class="ai-avatar">
                ✦
            </div>

            <div class="ai-message typing-message">

                <div class="message-name">
                    Sirius AI
                </div>

                <div class="typing-dots">

                    <span></span>
                    <span></span>
                    <span></span>

                </div>

            </div>
        `;

        chatBox.appendChild(row);

        scrollChatToBottom();

        return row;
    }

    /* =====================================================
   CHAT HISTORY
===================================================== */

let currentChatId = null;


/* -----------------------------------------------------
   CLEAR CURRENT CHAT UI
----------------------------------------------------- */

function clearChatBox() {

    if (!chatBox) {
        return;
    }

    chatBox.innerHTML = `
        <div class="ai-message-row">

            <div class="ai-avatar">
                ✦
            </div>

            <div class="ai-message">

                <div class="message-name">
                    Sirius AI
                </div>

                <div class="message-content">

                    <p>
                        Hi ${escapeHtml(currentUser)} 👋
                    </p>

                    <p>
                        I'm here to listen.
                        You can tell me how you're feeling,
                        ask a question, or simply talk.
                    </p>

                </div>

            </div>

        </div>
    `;

    scrollChatToBottom();
}


/* -----------------------------------------------------
   NEW CHAT
----------------------------------------------------- */

if (newChatBtn) {

    newChatBtn.addEventListener("click", async () => {

        try {

            const response = await fetch(
                "/new_chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Could not create a new chat."
                );
            }

            currentChatId = data.chat_id;

            clearChatBox();

            if (userInput) {
                userInput.value = "";
                userInput.focus();
            }

            showToast("New chat started ✨");

        } catch (error) {

            console.error(
                "New chat error:",
                error
            );

            showToast(
                "Could not start a new chat."
            );
        }

    });
}


/* -----------------------------------------------------
   HISTORY PANEL
----------------------------------------------------- */

function createHistoryPanel() {

    let panel =
        document.getElementById(
            "siriusHistoryPanel"
        );

    if (panel) {
        return panel;
    }

    panel =
        document.createElement("div");

    panel.id =
        "siriusHistoryPanel";

    panel.innerHTML = `

        <div class="history-panel">

            <div class="history-header">

                <div>
                    <h3>Chat History</h3>

                    <p>
                        Your previous conversations
                    </p>
                </div>

                <button
                    id="closeHistoryBtn"
                    type="button"
                    title="Close">

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </div>

            <div
                id="historyList"
                class="history-list">

                <div class="history-loading">
                    Loading...
                </div>

            </div>

        </div>

    `;

    document.body.appendChild(panel);

    const closeBtn =
        document.getElementById(
            "closeHistoryBtn"
        );

    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            closeHistory
        );
    }

    panel.addEventListener(
        "click",
        event => {

            if (
                event.target === panel
            ) {
                closeHistory();
            }

        }
    );

    return panel;
}


/* -----------------------------------------------------
   CLOSE HISTORY
----------------------------------------------------- */

function closeHistory() {

    const panel =
        document.getElementById(
            "siriusHistoryPanel"
        );

    if (panel) {
        panel.remove();
    }
}


/* -----------------------------------------------------
   LOAD HISTORY
----------------------------------------------------- */

async function loadChatHistory() {

    const panel =
        createHistoryPanel();

    const historyList =
        document.getElementById(
            "historyList"
        );

    if (!historyList) {
        return;
    }

    historyList.innerHTML = `
        <div class="history-loading">
            Loading conversations...
        </div>
    `;

    try {

        const response =
            await fetch(
                "/get_chat_history",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Could not load chat history."
            );
        }

        const chats =
            data.chats || [];

        if (chats.length === 0) {

            historyList.innerHTML = `

                <div class="history-empty">

                    <i class="fa-regular fa-comments"></i>

                    <h4>
                        No conversations yet
                    </h4>

                    <p>
                        Start a new conversation
                        with Sirius AI.
                    </p>

                </div>

            `;

            return;
        }

        historyList.innerHTML =
            chats.map(chat => {

                const date =
                    chat.created_at
                        ? formatChatDate(
                            chat.created_at
                        )
                        : "";

                return `

                    <div
                        class="history-item"
                        data-chat-id="${escapeHtml(
                            chat.chat_id
                        )}">

                        <div
                            class="history-icon">

                            <i
                                class="fa-regular fa-message">
                            </i>

                        </div>

                        <div
                            class="history-content">

                            <h4>
                                ${escapeHtml(
                                    chat.title
                                )}
                            </h4>

                            <span>
                                ${escapeHtml(date)}
                            </span>

                        </div>

                        <button
                            class="delete-chat-btn"
                            data-chat-id="${escapeHtml(
                                chat.chat_id
                            )}"
                            type="button"
                            title="Delete conversation">

                            <i
                                class="fa-solid fa-trash-can">
                            </i>

                        </button>

                    </div>

                `;

            }).join("");

        /* ---------------------------------------------
           OPEN CHAT
        --------------------------------------------- */

        historyList
            .querySelectorAll(
                ".history-item"
            )
            .forEach(item => {

                item.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target.closest(
                                ".delete-chat-btn"
                            )
                        ) {
                            return;
                        }

                        const chatId =
                            item.dataset.chatId;

                        openChat(chatId);
                    }
                );

            });

        /* ---------------------------------------------
           DELETE CHAT
        --------------------------------------------- */

        historyList
            .querySelectorAll(
                ".delete-chat-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async event => {

                        event.stopPropagation();

                        const chatId =
                            button.dataset.chatId;

                        const confirmed =
                            window.confirm(
                                "Delete this conversation?"
                            );

                        if (!confirmed) {
                            return;
                        }

                        await deleteChat(
                            chatId
                        );

                    }
                );

            });

    } catch (error) {

        console.error(
            "History error:",
            error
        );

        historyList.innerHTML = `

            <div class="history-empty">

                <i
                    class="fa-solid fa-triangle-exclamation">
                </i>

                <h4>
                    Could not load history
                </h4>

                <p>
                    Please make sure Flask
                    is running.
                </p>

            </div>

        `;
    }
}


/* -----------------------------------------------------
   OPEN OLD CHAT
----------------------------------------------------- */

async function openChat(chatId) {

    try {

        const response =
            await fetch(
                `/get_chat/${encodeURIComponent(
                    chatId
                )}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Could not open conversation."
            );
        }

        currentChatId =
            data.chat_id;

        clearChatBox();

        const messages =
            data.messages || [];

        messages.forEach(item => {

            addUserMessage(
                item.user_message
            );

            addAIMessage(
                item.ai_reply
            );

        });

        closeHistory();

        scrollChatToBottom();

        if (userInput) {
            userInput.focus();
        }

        showToast(
            "Conversation opened 💬"
        );

    } catch (error) {

        console.error(
            "Open chat error:",
            error
        );

        showToast(
            "Could not open conversation."
        );
    }
}


/* -----------------------------------------------------
   DELETE CHAT
----------------------------------------------------- */

async function deleteChat(chatId) {

    try {

        const response =
            await fetch(
                `/delete_chat/${encodeURIComponent(
                    chatId
                )}`,
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Could not delete conversation."
            );
        }

        if (
            currentChatId === chatId
        ) {

            currentChatId = null;

            clearChatBox();
        }

        showToast(
            "Conversation deleted 🗑️"
        );

        await loadChatHistory();

    } catch (error) {

        console.error(
            "Delete chat error:",
            error
        );

        showToast(
            "Could not delete conversation."
        );
    }
}


/* -----------------------------------------------------
   FORMAT DATE
----------------------------------------------------- */

function formatChatDate(dateString) {

    try {

        const date =
            new Date(
                dateString.replace(
                    " ",
                    "T"
                ) + "Z"
            );

        return date.toLocaleString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );

    } catch {

        return dateString;
    }
}


/* -----------------------------------------------------
   HISTORY BUTTON
----------------------------------------------------- */

if (historyBtn) {

    historyBtn.addEventListener(
        "click",
        loadChatHistory
    );
}


    /* =====================================================
       SEND BUTTON
    ===================================================== */

    if (sendBtn) {

        sendBtn.addEventListener(
            "click",
            sendMessage
        );
    }

    /* =====================================================
       ENTER KEY
    ===================================================== */

    if (userInput) {

        userInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();
                }
            }
        );
    }

    /* =====================================================
       CHAT SUGGESTIONS
    ===================================================== */

    const suggestionButtons =
        document.querySelectorAll(
            ".suggestion-btn"
        );

    suggestionButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const message =
                    button.dataset.message;

                if (userInput) {

                    userInput.value =
                        message;

                    sendMessage();
                }
            }
        );
    });

    /* =====================================================
       SCROLL CHAT
    ===================================================== */

    function scrollChatToBottom() {

        if (!chatBox) {
            return;
        }

        chatBox.scrollTop =
            chatBox.scrollHeight;
    }

    /* =====================================================
       VOICE INPUT
    ===================================================== */

    let recognition = null;

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (SpeechRecognition) {

        recognition =
            new SpeechRecognition();

        recognition.continuous = false;

        recognition.interimResults = false;

        recognition.lang = "en-US";

        recognition.onstart = () => {

            if (voiceBtn) {

                voiceBtn.classList.add(
                    "recording"
                );
            }

            showToast(
                "Listening..."
            );
        };

        recognition.onresult = event => {

            const transcript =
                event.results[0][0]
                    .transcript;

            if (userInput) {

                userInput.value =
                    transcript;
            }
        };

        recognition.onerror = error => {

            console.error(
                "Voice error:",
                error
            );

            showToast(
                "Voice input could not be used."
            );
        };

        recognition.onend = () => {

            if (voiceBtn) {

                voiceBtn.classList.remove(
                    "recording"
                );
            }
        };
    }

    if (voiceBtn) {

        voiceBtn.addEventListener(
            "click",
            () => {

                if (!recognition) {

                    showToast(
                        "Voice input is not supported in this browser."
                    );

                    return;
                }

                try {

                    recognition.start();

                } catch (error) {

                    console.error(
                        "Recognition error:",
                        error
                    );
                }
            }
        );
    }

    /* =====================================================
       BREATHING EXERCISE
    ===================================================== */

    const breathingPhases = [

        {
            name: "Breathe in",

            instruction:
                "Slowly breathe in through your nose.",

            duration: 4,

            className: "inhale"
        },

        {
            name: "Hold",

            instruction:
                "Gently hold your breath.",

            duration: 4,

            className: "hold"
        },

        {
            name: "Breathe out",

            instruction:
                "Slowly breathe out and relax.",

            duration: 6,

            className: "exhale"
        }

    ];

    function startBreathing() {

        if (breathingRunning) {
            return;
        }

        breathingRunning = true;

        currentBreathingPhase = 0;

        runBreathingPhase();
    }

    function runBreathingPhase() {

        if (!breathingRunning) {
            return;
        }

        const phase =
            breathingPhases[
                currentBreathingPhase
            ];

        currentBreathingTime =
            phase.duration;

        if (breathText) {

            breathText.textContent =
                phase.name;
        }

        if (breathTimer) {

            breathTimer.textContent =
                currentBreathingTime;
        }

        if (breathingInstruction) {

            breathingInstruction.textContent =
                phase.instruction;
        }

        if (breathCircle) {

            breathCircle.classList.remove(
                "inhale",
                "hold",
                "exhale"
            );

            breathCircle.classList.add(
                phase.className
            );
        }

        clearInterval(
            breathingInterval
        );

        breathingInterval =
            setInterval(
                () => {

                    currentBreathingTime--;

                    if (breathTimer) {

                        breathTimer.textContent =
                            currentBreathingTime;
                    }

                    if (
                        currentBreathingTime <=
                        0
                    ) {

                        clearInterval(
                            breathingInterval
                        );

                        currentBreathingPhase =
                            (
                                currentBreathingPhase +
                                1
                            ) %
                            breathingPhases.length;

                        runBreathingPhase();
                    }

                },
                1000
            );
    }

    function stopBreathing() {

        breathingRunning = false;

        clearInterval(
            breathingInterval
        );

        if (breathText) {

            breathText.textContent =
                "Ready";
        }

        if (breathTimer) {

            breathTimer.textContent =
                "4";
        }

        if (breathingInstruction) {

            breathingInstruction.textContent =
                "Prepare to breathe";
        }

        if (breathCircle) {

            breathCircle.classList.remove(
                "inhale",
                "hold",
                "exhale"
            );
        }
    }

    if (startBreathingBtn) {

        startBreathingBtn.addEventListener(
            "click",
            startBreathing
        );
    }

    if (stopBreathingBtn) {

        stopBreathingBtn.addEventListener(
            "click",
            stopBreathing
        );
    }

    /* =====================================================
       JOURNAL
    ===================================================== */

    async function loadJournalHistory() {

        if (!journalHistory) {
            return;
        }

        try {

            const response =
                await fetch(
                    "/get_journals",
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Could not load journals."
                );
            }

            const data =
                await response.json();

            renderJournalHistory(
                data.journals || []
            );

        } catch (error) {

            console.error(
                "Journal loading error:",
                error
            );

            journalHistory.innerHTML = `

                <div class="empty-journal">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <p>
                        Could not load journal history.
                    </p>

                    <span>
                        Make sure Flask is running.
                    </span>

                </div>
            `;
        }
    }

    function renderJournalHistory(entries) {

        if (!journalHistory) {
            return;
        }

        if (
            !entries ||
            entries.length === 0
        ) {

            journalHistory.innerHTML = `

                <div class="empty-journal">

                    <i class="fa-regular fa-bookmark"></i>

                    <p>
                        No journal entries yet.
                    </p>

                    <span>
                        Write something above and save it.
                    </span>

                </div>
            `;

            return;
        }

        journalHistory.innerHTML =
            entries.map(entry => {

                const date =
                    entry.created_at
                        ? new Date(
                            entry.created_at
                                .replace(
                                    " ",
                                    "T"
                                ) + "Z"
                        ).toLocaleString(
                            "en-IN",
                            {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit"
                            }
                        )
                        : "Saved entry";

                const preview =
                    entry.content.length > 220
                        ? `${entry.content.slice(
                            0,
                            220
                        )}...`
                        : entry.content;

                return `

                    <article
                        class="journal-entry">

                        <div
                            class="journal-entry-top">

                            <div>

                                <h4>
                                    ${escapeHtml(
                                        entry.title ||
                                        "My Journal Entry"
                                    )}
                                </h4>

                                <span>
                                    ${date}
                                </span>

                            </div>

                            <div
                                class="journal-actions">

                                <button
                                    class="edit-journal-btn"
                                    data-id="${entry.id}"
                                    type="button"
                                    title="Edit entry">

                                    <i
                                        class="fa-solid fa-pen">
                                    </i>

                                </button>

                                <button
                                    class="delete-journal-btn"
                                    data-id="${entry.id}"
                                    type="button"
                                    title="Delete entry">

                                    <i
                                        class="fa-solid fa-trash-can">
                                    </i>

                                </button>

                            </div>

                        </div>

                        <p>
                            ${escapeHtml(preview)}
                        </p>

                    </article>
                `;

            }).join("");

        /* EDIT */

        journalHistory
            .querySelectorAll(
                ".edit-journal-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;

                        const entry =
                            entries.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(id)
                            );

                        if (!entry) {

                            showToast(
                                "Journal entry not found."
                            );

                            return;
                        }

                        if (journalTitle) {

                            journalTitle.value =
                                entry.title || "";
                        }

                        if (journalText) {

                            journalText.value =
                                entry.content || "";
                        }

                        editingJournalId =
                            id;

                        updateWordCount();

                        if (saveJournalBtn) {

                            saveJournalBtn.innerHTML = `

                                <i
                                    class="fa-solid fa-pen-to-square">
                                </i>

                                Update Entry
                            `;
                        }

                        const journalSection =
                            document.getElementById(
                                "journalSection"
                            );

                        if (journalSection) {

                            journalSection.scrollIntoView(
                                {
                                    behavior:
                                        "smooth",

                                    block:
                                        "start"
                                }
                            );
                        }

                        showToast(
                            "Editing your journal ✏️"
                        );
                    }
                );
            });

        /* DELETE */

        journalHistory
            .querySelectorAll(
                ".delete-journal-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            button.dataset.id;

                        const confirmDelete =
                            window.confirm(
                                "Delete this journal entry?"
                            );

                        if (!confirmDelete) {
                            return;
                        }

                        try {

                            const response =
                                await fetch(
                                    `/delete_journal/${id}`,
                                    {
                                        method:
                                            "DELETE"
                                    }
                                );

                            const data =
                                await response.json();

                            if (
                                !response.ok ||
                                !data.success
                            ) {

                                showToast(
                                    data.message ||
                                    "Could not delete entry."
                                );

                                return;
                            }

                            if (
                                String(
                                    editingJournalId
                                ) ===
                                String(id)
                            ) {

                                editingJournalId =
                                    null;

                                if (journalTitle) {
                                    journalTitle.value =
                                        "";
                                }

                                if (journalText) {
                                    journalText.value =
                                        "";
                                }

                                updateWordCount();

                                if (saveJournalBtn) {

                                    saveJournalBtn.innerHTML = `

                                        <i
                                            class="fa-solid fa-floppy-disk">
                                        </i>

                                        Save Entry
                                    `;
                                }
                            }

                            await loadJournalHistory();

                            showToast(
                                "Journal entry deleted."
                            );

                        } catch (error) {

                            console.error(
                                error
                            );

                            showToast(
                                "Could not connect to the server."
                            );
                        }
                    }
                );
            });
    }

    /* =====================================================
       JOURNAL WORD COUNT
    ===================================================== */

    function updateWordCount() {

        if (
            !journalText ||
            !wordCount
        ) {
            return;
        }

        const text =
            journalText.value.trim();

        const words =
            text
                ? text.split(/\s+/).length
                : 0;

        wordCount.textContent =
            `${words} ${
                words === 1
                    ? "word"
                    : "words"
            }`;
    }

    if (journalText) {

        journalText.addEventListener(
            "input",
            updateWordCount
        );
    }

    /* =====================================================
       JOURNAL DATE
    ===================================================== */

    if (journalDate) {

        journalDate.textContent =
            new Date().toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
    }

    /* =====================================================
       SAVE / UPDATE JOURNAL
    ===================================================== */

    if (saveJournalBtn) {

        saveJournalBtn.addEventListener(
            "click",
            async () => {

                const title =
                    journalTitle
                        ? journalTitle.value.trim()
                        : "";

                const content =
                    journalText
                        ? journalText.value.trim()
                        : "";

                if (!content) {

                    showToast(
                        "Write something before saving."
                    );

                    return;
                }

                saveJournalBtn.disabled =
                    true;

                try {

                    /* UPDATE */

                    if (
                        editingJournalId !==
                        null
                    ) {

                        const response =
                            await fetch(
                                `/edit_journal/${editingJournalId}`,
                                {
                                    method:
                                        "PUT",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify(
                                            {
                                                title:
                                                    title ||
                                                    "My Journal Entry",

                                                content:
                                                    content
                                            }
                                        )
                                }
                            );

                        const data =
                            await response.json();

                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            throw new Error(
                                data.message ||
                                "Could not update journal."
                            );
                        }

                        editingJournalId =
                            null;

                        if (journalTitle) {
                            journalTitle.value =
                                "";
                        }

                        if (journalText) {
                            journalText.value =
                                "";
                        }

                        updateWordCount();

                        saveJournalBtn.innerHTML = `

                            <i
                                class="fa-solid fa-floppy-disk">
                            </i>

                            Save Entry
                        `;

                        await loadJournalHistory();

                        showToast(
                            "Journal entry updated. ✨"
                        );

                    }

                    /* CREATE */

                    else {

                        const response =
                            await fetch(
                                "/save_journal",
                                {
                                    method:
                                        "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify(
                                            {
                                                title:
                                                    title ||
                                                    "My Journal Entry",

                                                content:
                                                    content
                                            }
                                        )
                                }
                            );

                        const data =
                            await response.json();

                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            throw new Error(
                                data.message ||
                                "Could not save journal."
                            );
                        }

                        if (journalTitle) {
                            journalTitle.value =
                                "";
                        }

                        if (journalText) {
                            journalText.value =
                                "";
                        }

                        updateWordCount();

                        await loadJournalHistory();

                        showToast(
                            "Journal entry saved. 💚"
                        );
                    }

                } catch (error) {

                    console.error(
                        "Journal error:",
                        error
                    );

                    showToast(
                        error.message ||
                        "Could not save journal."
                    );

                } finally {

                    saveJournalBtn.disabled =
                        false;
                }
            }
        );
    }

    /* =====================================================
       CLEAR ALL JOURNALS
    ===================================================== */

    if (clearJournalBtn) {

        clearJournalBtn.addEventListener(
            "click",
            async () => {

                const confirmClear =
                    window.confirm(
                        "Delete all your saved journal entries?"
                    );

                if (!confirmClear) {
                    return;
                }

                try {

                    const response =
                        await fetch(
                            "/clear_journals",
                            {
                                method:
                                    "DELETE"
                            }
                        );

                    const data =
                        await response.json();

                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Could not clear journal history."
                        );
                    }

                    await loadJournalHistory();

                    showToast(
                        "Journal history cleared."
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                    showToast(
                        error.message ||
                        "Could not clear journal history."
                    );
                }
            }
        );
    }

    /* =====================================================
       RELAXATION AUDIO
    ===================================================== */

    const soundCards =
        document.querySelectorAll(
            ".sound-card"
        );

    const stopSoundBtn =
        document.getElementById(
            "stopSoundBtn"
        );

    const nowPlaying =
        document.getElementById(
            "nowPlaying"
        );

    soundCards.forEach(card => {

        const audio =
            card.querySelector(
                ".relax-audio"
            );

        const control =
            card.querySelector(
                ".sound-control"
            );

        if (
            !audio ||
            !control
        ) {
            return;
        }

        audio.loop = true;

        audio.volume = 0.6;

        audio.addEventListener(
            "error",
            () => {

                console.error(
                    "Audio failed:",
                    audio.currentSrc,
                    audio.error
                );

                showToast(
                    "Audio file could not be loaded."
                );
            }
        );

        control.addEventListener(
            "click",
            async event => {

                event.stopPropagation();

                /* Same audio */

                if (
                    currentAudio === audio &&
                    !audio.paused
                ) {

                    audio.pause();

                    control.innerHTML =
                        '<i class="fa-solid fa-play"></i>';

                    card.classList.remove(
                        "playing"
                    );

                    if (nowPlaying) {

                        nowPlaying.textContent =
                            "Paused";
                    }

                    return;
                }

                /* Stop previous */

                if (currentAudio) {

                    currentAudio.pause();

                    currentAudio.currentTime =
                        0;
                }

                document
                    .querySelectorAll(
                        ".sound-control"
                    )
                    .forEach(btn => {

                        btn.innerHTML =
                            '<i class="fa-solid fa-play"></i>';
                    });

                document
                    .querySelectorAll(
                        ".sound-card"
                    )
                    .forEach(soundCard => {

                        soundCard.classList.remove(
                            "playing"
                        );
                    });

                try {

                    await audio.play();

                    currentAudio =
                        audio;

                    control.innerHTML =
                        '<i class="fa-solid fa-pause"></i>';

                    card.classList.add(
                        "playing"
                    );

                    const name =
                        card.querySelector(
                            "h3"
                        );

                    if (nowPlaying) {

                        nowPlaying.textContent =
                            "Now playing: " +
                            (
                                name
                                    ? name.textContent
                                    : "Relaxation audio"
                            );
                    }

                } catch (error) {

                    console.error(
                        "Playback error:",
                        error
                    );

                    showToast(
                        "Could not play the audio."
                    );
                }
            }
        );
    });

    if (stopSoundBtn) {

        stopSoundBtn.addEventListener(
            "click",
            () => {

                if (currentAudio) {

                    currentAudio.pause();

                    currentAudio.currentTime =
                        0;
                }

                document
                    .querySelectorAll(
                        ".sound-control"
                    )
                    .forEach(btn => {

                        btn.innerHTML =
                            '<i class="fa-solid fa-play"></i>';
                    });

                document
                    .querySelectorAll(
                        ".sound-card"
                    )
                    .forEach(card => {

                        card.classList.remove(
                            "playing"
                        );
                    });

                currentAudio = null;

                if (nowPlaying) {

                    nowPlaying.textContent =
                        "Nothing playing";
                }
            }
        );
    }

    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "/logout";
            }
        );
    }

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadMoodChart();

    loadJournalHistory();

    // Get the current active chat ID
async function initializeChat() {

    try {

        const response =
            await fetch("/get_chat_history", {
                cache: "no-store"
            });

        if (!response.ok) {
            return;
        }

        const data =
            await response.json();

        if (
            data.success &&
            data.chats &&
            data.chats.length > 0
        ) {

            // Do not automatically open an old chat.
            // Start with a fresh conversation.
            currentChatId = null;

        }

    } catch (error) {

        console.error(
            "Chat initialization error:",
            error
        );
    }
}

initializeChat();

    /*
       Load only the logged-in user's
       previous chat messages.

       There is NO separate chat history
       panel.
    */


    updateWordCount();

    console.log(
        "✨ Sirius AI JavaScript loaded successfully."
    );

});