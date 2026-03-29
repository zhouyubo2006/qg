const i18n = {
    zh: {
        logo: "TODO!",
        inputPlaceholder: "新增待办事项...",
        submit: "提交",
        markAllComplete: "全部标为完成",
        slogan: "今日事今日毕，勿将今事待明日!",
        searchPlaceholder: "搜索待办事项...",
        menu: "开 ✨",
        all: "全部",
        trash: "回收站",
        markAllDone: "全部标为已完成",
        clearAll: "清除全部",
        exportData: "导出数据",
        importData: "导入(txt/json)",
        todoFooter: "剩余 {count} 项未完成",
        edit: "编辑",
        delete: "删除",
        restore: "恢复",
        urgent: "加急",
        cancelUrgent: "取消加急",
        emptyTrash: "清空回收站",
        confirmClear: "确定要清除全部吗？",
        confirmEmptyTrash: "确定要清空回收站吗？"
    },
    en: {
        logo: "TODO!",
        inputPlaceholder: "Add a new todo...",
        submit: "Submit",
        markAllComplete: "Mark All Complete",
        slogan: "Finish today's work, don't put it off till tomorrow!",
        searchPlaceholder: "Search todos...",
        menu: "Menu ✨",
        all: "All",
        trash: "Trash",
        markAllDone: "Mark All Done",
        clearAll: "Clear All",
        exportData: "Export Data",
        importData: "Import (txt/json)",
        todoFooter: "{count} items left",
        edit: "Edit",
        delete: "Delete",
        restore: "Restore",
        urgent: "Urgent",
        cancelUrgent: "Cancel Urgent",
        emptyTrash: "Empty Trash",
        confirmClear: "Are you sure you want to clear all?",
        confirmEmptyTrash: "Are you sure you want to empty the trash?"
    }
};

let currentLang = "zh";
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

function init() {
    updateTime();
    setInterval(updateTime, 1000);
    renderTodos();
    bindEvents();
    applyLang();
}

function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleString(currentLang, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
    document.getElementById("timeDisplay").textContent = timeStr;
}

function applyLang() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.textContent = i18n[currentLang][key];
    });
    renderTodos();
}

function renderTodos() {
    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "";

    let filteredTodos = todos;
    if (currentFilter === "trash") {
        filteredTodos = todos.filter(t => t.deleted);
    } else {
        filteredTodos = todos.filter(t => !t.deleted);
    }

    const searchText = document.getElementById("searchInput").value.toLowerCase();
    if (searchText) {
        filteredTodos = filteredTodos.filter(t =>
            t.content.toLowerCase().includes(searchText)
        );
    }

    filteredTodos.sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return new Date(b.createTime) - new Date(a.createTime);
    });

    filteredTodos.forEach(todo => {
        const item = document.createElement("div");
        item.className = `todo-item ${todo.completed ? "completed" : ""} ${todo.urgent ? "urgent" : ""}`;
        item.dataset.id = todo.id;

        const left = document.createElement("div");
        left.className = "todo-left";

        const checkbox = document.createElement("div");
        checkbox.className = `todo-checkbox ${todo.completed ? "checked" : ""}`;
        checkbox.addEventListener("click", () => toggleComplete(todo.id));

        const content = document.createElement("div");
        const text = document.createElement("div");
        text.className = "todo-content";
        text.textContent = todo.content;
        text.addEventListener("dblclick", () => editTodo(todo.id));

        const time = document.createElement("div");
        time.className = "todo-time";
        time.textContent = new Date(todo.createTime).toLocaleString(currentLang);

        content.appendChild(text);
        content.appendChild(time);
        left.appendChild(checkbox);
        left.appendChild(content);

        const actions = document.createElement("div");
        actions.className = "todo-actions";

        if (currentFilter === "trash") {
            const restoreBtn = document.createElement("button");
            restoreBtn.textContent = i18n[currentLang].restore;
            restoreBtn.addEventListener("click", () => restoreTodo(todo.id));
            actions.appendChild(restoreBtn);
        } else {
            const urgentBtn = document.createElement("button");
            urgentBtn.textContent = todo.urgent ? i18n[currentLang].cancelUrgent : i18n[currentLang].urgent;
            urgentBtn.addEventListener("click", () => toggleUrgent(todo.id));
            actions.appendChild(urgentBtn);

            const editBtn = document.createElement("button");
            editBtn.textContent = i18n[currentLang].edit;
            editBtn.addEventListener("click", () => editTodo(todo.id));
            actions.appendChild(editBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "✕";
            deleteBtn.addEventListener("click", () => deleteTodo(todo.id));
            actions.appendChild(deleteBtn);
        }

        item.appendChild(left);
        item.appendChild(actions);
        todoList.appendChild(item);
    });

    const uncompletedCount = todos.filter(t => !t.deleted && !t.completed).length;
    document.getElementById("todoFooter").textContent = i18n[currentLang].todoFooter.replace("{count}", uncompletedCount);
}

function bindEvents() {
    document.getElementById("submitBtn").addEventListener("click", addTodo);
    document.getElementById("todoInput").addEventListener("keypress", e => {
        if (e.key === "Enter") addTodo();
    });

    document.getElementById("searchInput").addEventListener("input", renderTodos);
    document.getElementById("markAllComplete").addEventListener("click", markAllComplete);
    document.getElementById("markAllDone").addEventListener("click", markAllComplete);
    document.getElementById("clearAll").addEventListener("click", clearAll);
    document.getElementById("exportData").addEventListener("click", exportData);
    document.getElementById("importData").addEventListener("click", importData);

    document.querySelectorAll(".menu-item").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".menu-item").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentLang = btn.dataset.lang;
            applyLang();
        });
    });
}

function addTodo() {
    const input = document.getElementById("todoInput");
    const content = input.value.trim();
    if (!content) return;

    const newTodo = {
        id: Date.now().toString(),
        content: content,
        completed: false,
        urgent: false,
        deleted: false,
        createTime: new Date().toISOString()
    };

    todos.unshift(newTodo);
    saveTodos();
    input.value = "";
    renderTodos();
}

function toggleComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function toggleUrgent(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.urgent = !todo.urgent;
        saveTodos();
        renderTodos();
    }
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        const newContent = prompt(i18n[currentLang].edit, todo.content);
        if (newContent !== null) {
            todo.content = newContent.trim();
            saveTodos();
            renderTodos();
        }
    }
}

function deleteTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.deleted = true;
        saveTodos();
        renderTodos();
    }
}

function restoreTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.deleted = false;
        saveTodos();
        renderTodos();
    }
}

function markAllComplete() {
    todos.forEach(t => {
        if (!t.deleted) t.completed = true;
    });
    saveTodos();
    renderTodos();
}

function clearAll() {
    if (confirm(i18n[currentLang].confirmClear)) {
        todos = [];
        saveTodos();
        renderTodos();
    }
}

function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

function exportData() {
    const dataStr = JSON.stringify(todos, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todos_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.json";
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target.result);
                todos = data;
                saveTodos();
                renderTodos();
                alert("导入成功！");
            } catch (err) {
                alert("导入失败：文件格式错误");
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

init();