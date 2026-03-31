const STORAGE_KEY = "cubemate-data-v1";
const PUBLISHED_DATA_URL = "./data.json";
const DEFAULT_CATEGORIES = ["已学会", "基本熟练", "学习中", "未学习"];
const PATTERN_TEMPLATE = [
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0]
];
const DEFAULT_PATTERN = PATTERN_TEMPLATE.map((row) => row.map(() => 0));

const seedAlgorithms = [
  {
    id: crypto.randomUUID(),
    name: "小鱼 OLL",
    category: "未学习",
    pattern: "顶面只剩一个角朝上，正面看像一条小鱼。",
    algorithm: "R U R' U R U2 R'",
    tags: ["OLL", "2-look", "初学者"],
    visualPattern: [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0]
    ]
  },
  {
    id: crypto.randomUUID(),
    name: "反小鱼 OLL",
    category: "未学习",
    pattern: "和小鱼相反方向，常见于顶层定向第二种情况。",
    algorithm: "R U2 R' U' R U' R'",
    tags: ["OLL", "2-look", "初学者"],
    visualPattern: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0]
    ]
  },
  {
    id: crypto.randomUUID(),
    name: "T OLL",
    category: "未学习",
    pattern: "正面像一个 T 形，常用于两步顶层。",
    algorithm: "r U R' U' r' F R F'",
    tags: ["OLL", "常用", "进阶"],
    visualPattern: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0]
    ]
  },
  {
    id: crypto.randomUUID(),
    name: "Aa PLL",
    category: "未学习",
    pattern: "顶层角块需要三循环，边块已对好。",
    algorithm: "x R' U R' D2 R U' R' D2 R2 x'",
    tags: ["PLL", "角块"],
    visualPattern: [
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0]
    ]
  },
  {
    id: crypto.randomUUID(),
    name: "Ua PLL",
    category: "未学习",
    pattern: "顶层三条边顺时针循环。",
    algorithm: "R U' R U R U R U' R' U' R2",
    tags: ["PLL", "边块"],
    visualPattern: [
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0]
    ]
  }
];

const today = new Date().toISOString().slice(0, 10);

const state = createEmptyState();

const algorithmList = document.getElementById("algorithmList");
const taskList = document.getElementById("taskList");
const algorithmForm = document.getElementById("algorithmForm");
const categorySelect = document.getElementById("categorySelect");
const tagSelect = document.getElementById("tagSelect");
const categoryManagerList = document.getElementById("categoryManagerList");
const newCategoryInput = document.getElementById("newCategoryInput");
const addCategoryButton = document.getElementById("addCategoryButton");
const taskForm = document.getElementById("taskForm");
const searchInput = document.getElementById("searchInput");
const exportButton = document.getElementById("exportButton");
const publishExportButton = document.getElementById("publishExportButton");
const importInput = document.getElementById("importInput");
const restorePublishedButton = document.getElementById("restorePublishedButton");
const algorithmTemplate = document.getElementById("algorithmCardTemplate");
const taskTemplate = document.getElementById("taskCardTemplate");
const patternEditor = document.getElementById("patternEditor");
const clearPatternButton = document.getElementById("clearPatternButton");
const fillPatternButton = document.getElementById("fillPatternButton");
const taskAssignmentList = document.getElementById("taskAssignmentList");
const assignmentRepeatInput = document.getElementById("assignmentRepeatInput");
const cancelEditButton = document.getElementById("cancelEditButton");
const submitAlgorithmButton = document.getElementById("submitAlgorithmButton");
const algorithmFormTitle = document.getElementById("algorithmFormTitle");
const practicePanel = document.getElementById("practicePanel");
const practiceTitle = document.getElementById("practiceTitle");
const practiceMeta = document.getElementById("practiceMeta");
const practiceContent = document.getElementById("practiceContent");
const closePracticeButton = document.getElementById("closePracticeButton");
const tabButtons = document.querySelectorAll("[data-tab]");
const tabPanels = document.querySelectorAll("[data-tab-panel]");
const countNodes = {
  algorithm: document.getElementById("algorithmCount"),
  task: document.getElementById("taskCount"),
  completion: document.getElementById("completionRate")
};
let draftPattern = clonePattern(DEFAULT_PATTERN);
let editingAlgorithmId = null;
let activePracticeTaskId = null;
let publishedSnapshot = null;
state.activeTab = "practice";
state.openAssignmentCategories = [];

taskForm.elements.date.value = today;
buildPatternEditor();
renderTaskAssignmentSelector();

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.activeTab = button.dataset.tab;
    renderTabs();
  });
});

addCategoryButton.addEventListener("click", () => {
  const name = newCategoryInput.value.trim();
  if (!name) {
    return;
  }
  if (state.categories.includes(name)) {
    window.alert("这个分类已经存在。");
    return;
  }
  state.categories.push(name);
  state.categories.sort((a, b) => a.localeCompare(b, "zh-CN"));
  categorySelect.value = name;
  newCategoryInput.value = "";
  persist();
  render();
});

algorithmForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(algorithmForm);
  const entry = normalizeAlgorithm({
    id: editingAlgorithmId || crypto.randomUUID(),
    name: String(formData.get("name")).trim(),
    category: String(formData.get("category")).trim(),
    pattern: String(formData.get("pattern")).trim(),
    algorithm: String(formData.get("algorithm")).trim(),
    visualPattern: clonePattern(draftPattern),
    tags: [String(formData.get("tag")).trim() || "未学习"]
  });

  if (editingAlgorithmId) {
    state.algorithms = state.algorithms.map((item) =>
      item.id === editingAlgorithmId ? entry : item
    );
  } else {
    state.algorithms.unshift(entry);
  }

  persist();
  resetAlgorithmForm();
  render();
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const repeatCount = Number(assignmentRepeatInput.value || 0);
  const assignments = Array.from(taskAssignmentList.querySelectorAll("[data-algorithm-id]:checked"))
    .map((input) => ({
      algorithmId: input.dataset.algorithmId,
      repetitions: repeatCount
    }));

  if (!assignments.length) {
    window.alert("请至少勾选一条公式。");
    return;
  }

  if (repeatCount < 1) {
    window.alert("请填写每条公式练习次数。");
    return;
  }

  const queue = buildPracticeQueue(assignments);
  const target = assignments.reduce((sum, item) => sum + item.repetitions, 0);
  const task = {
    id: crypto.randomUUID(),
    friendName: String(formData.get("friendName")).trim(),
    date: String(formData.get("date")).trim(),
    target,
    focus: String(formData.get("focus")).trim(),
    assignments,
    queue,
    completed: 0,
    needsMore: 0
  };

  state.tasks.unshift(task);
  persist();
  taskForm.reset();
  taskForm.elements.date.value = today;
  resetTaskAssignmentSelector();
  render();
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLowerCase();
  renderAlgorithms();
});

exportButton.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(serializeState(false), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `cubemate-backup-${today}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
});

publishExportButton.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(serializeState(true), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "data.json";
  anchor.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const imported = JSON.parse(text);

    if (!Array.isArray(imported.algorithms) || !Array.isArray(imported.tasks)) {
      throw new Error("格式不正确");
    }

    hydrateState(normalizeAppState(imported));
    persist();
    render();
    window.alert("导入成功");
  } catch (error) {
    window.alert(`导入失败：${error.message}`);
  } finally {
    importInput.value = "";
  }
});

clearPatternButton.addEventListener("click", () => {
  resetDraftPattern();
});

fillPatternButton.addEventListener("click", () => {
  draftPattern = PATTERN_TEMPLATE.map((row, rowIndex) =>
    row.map((cell, columnIndex) => (cell && isEditablePatternCell(rowIndex, columnIndex) ? 1 : 0))
  );
  syncPatternEditor();
});

cancelEditButton.addEventListener("click", () => {
  resetAlgorithmForm();
});

restorePublishedButton.addEventListener("click", () => {
  if (!publishedSnapshot) {
    window.alert("当前没有可恢复的线上发布版本。");
    return;
  }

  hydrateState(structuredClone(publishedSnapshot));
  resetAlgorithmForm();
  persist();
  render();
  window.alert("已恢复到当前仓库里的发布版本。");
});

closePracticeButton.addEventListener("click", () => {
  activePracticeTaskId = null;
  renderPracticePanel();
});

function loadLocalState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return normalizeAppState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(false)));
}

function render() {
  renderTabs();
  renderCategoryControls();
  renderAlgorithms();
  renderTaskAssignmentSelector();
  renderTasks();
  renderStats();
  renderPracticePanel();
}

function renderCategoryControls() {
  renderCategorySelect();
  renderTagSelect();
  renderCategoryManager();
  renderFilterToolbar();
}

function renderCategorySelect() {
  const selectedValue = editingAlgorithmId
    ? algorithmForm.elements.category.value
    : categorySelect.value || state.categories[0];
  categorySelect.innerHTML = "";

  state.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.append(option);
  });

  if (state.categories.includes(selectedValue)) {
    categorySelect.value = selectedValue;
  } else {
    categorySelect.value = state.categories[0] || "";
  }
}

function renderCategoryManager() {
  categoryManagerList.innerHTML = "";

  state.categories.forEach((category) => {
    const row = document.createElement("div");
    row.className = "category-item";

    const input = document.createElement("input");
    input.type = "text";
    input.value = category;
    input.setAttribute("aria-label", `${category} 分类名称`);

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "ghost-button";
    saveButton.textContent = "保存";
    saveButton.addEventListener("click", () => {
      renameCategory(category, input.value.trim());
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger-link";
    deleteButton.textContent = "删除";
    deleteButton.addEventListener("click", () => {
      deleteCategory(category);
    });

    row.append(input, saveButton, deleteButton);
    categoryManagerList.append(row);
  });
}

function renderTagSelect() {
  const selectedValue = editingAlgorithmId
    ? algorithmForm.elements.tag.value
    : tagSelect.value || DEFAULT_CATEGORIES[3];
  tagSelect.innerHTML = "";

  DEFAULT_CATEGORIES.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagSelect.append(option);
  });

  if (DEFAULT_CATEGORIES.includes(selectedValue)) {
    tagSelect.value = selectedValue;
  } else {
    tagSelect.value = "未学习";
  }
}

function renderFilterToolbar() {
  const toolbar = document.querySelector(".toolbar");
  toolbar.innerHTML = "";

  const allButton = createFilterButton("all", "全部");
  toolbar.append(allButton);

  state.categories.forEach((category) => {
    toolbar.append(createFilterButton(category, category));
  });
}

function createFilterButton(value, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ghost-button";
  button.dataset.filter = value;
  button.textContent = label;
  button.classList.toggle("active", state.algorithmFilter === value);
  button.addEventListener("click", () => {
    state.algorithmFilter = value;
    renderAlgorithms();
    renderFilterToolbar();
  });
  return button;
}

function renderTabs() {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.activeTab);
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tabPanel === state.activeTab);
  });
}

function renderAlgorithms() {
  const keyword = state.search;
  const filtered = state.algorithms.filter((item) => {
    const matchesFilter =
      state.algorithmFilter === "all" || item.category === state.algorithmFilter;
    const text = [item.name, item.pattern, item.algorithm, ...(item.tags || [])]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !keyword || text.includes(keyword);
    return matchesFilter && matchesSearch;
  });

  algorithmList.innerHTML = "";

  if (!filtered.length) {
    algorithmList.append(emptyState("还没有匹配到公式，试试录入一个新的案例。"));
    return;
  }

  filtered.forEach((item) => {
    const node = algorithmTemplate.content.firstElementChild.cloneNode(true);
    const categoryPill = node.querySelector(".category-pill");
    categoryPill.textContent = item.category;
    categoryPill.dataset.category = item.category;
    const tagPill = node.querySelector(".tag-pill");
    const tagValue = item.tags?.[0] || "未学习";
    tagPill.textContent = tagValue;
    tagPill.dataset.tag = tagValue;
    node.querySelector(".algorithm-visual").append(createPatternElement(item.visualPattern));
    node.querySelector(".algorithm-name").textContent = item.name;
    const patternNode = node.querySelector(".algorithm-pattern");
    if (item.pattern) {
      patternNode.textContent = item.pattern;
    } else {
      patternNode.remove();
    }
    node.querySelector(".algorithm-formula").replaceWith(createFormulaStack(item.algorithm));
    node.querySelector(".edit-algorithm").addEventListener("click", () => {
      startEditingAlgorithm(item);
    });
    node.querySelector(".sort-up").addEventListener("click", () => {
      moveAlgorithm(item.id, -1);
    });
    node.querySelector(".sort-down").addEventListener("click", () => {
      moveAlgorithm(item.id, 1);
    });
    node.querySelector(".delete-algorithm").addEventListener("click", () => {
      state.algorithms = state.algorithms.filter((entry) => entry.id !== item.id);
      if (editingAlgorithmId === item.id) {
        resetAlgorithmForm();
      }
      persist();
      render();
    });
    algorithmList.append(node);
  });
}

function renderTasks() {
  taskList.innerHTML = "";

  if (!state.tasks.length) {
    taskList.append(emptyState("先创建一个任务，比如让朋友今天练习 10 把。"));
    return;
  }

  state.tasks.forEach((task) => {
    const node = taskTemplate.content.firstElementChild.cloneNode(true);
    const progress = task.target ? Math.min(100, Math.round((task.completed / task.target) * 100)) : 0;
    node.querySelector(".task-name").textContent = task.friendName;
    node.querySelector(".task-meta").textContent = `${task.date} · 目标 ${task.target} 次`;
    node.querySelector(".task-progress-text").textContent = `${task.completed}/${task.target}`;
    node.querySelector(".task-focus").textContent = task.focus
      ? `训练重点：${task.focus}`
      : "训练重点：未设置";
    node.querySelector(".task-repeat").textContent = getRepeatSummary(task);
    node.querySelector(".progress-value").style.width = `${progress}%`;
    node.querySelector(".task-assignment-summary").append(renderAssignmentSummary(task));

    node.querySelector(".task-practice").addEventListener("click", () => {
      activePracticeTaskId = task.id;
      renderPracticePanel();
      practicePanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    node.querySelector(".task-delete").addEventListener("click", () => {
      state.tasks = state.tasks.filter((entry) => entry.id !== task.id);
      if (activePracticeTaskId === task.id) {
        activePracticeTaskId = null;
      }
      persist();
      render();
    });

    taskList.append(node);
  });
}

function renderStats() {
  if (!countNodes.algorithm || !countNodes.task || !countNodes.completion) {
    return;
  }

  countNodes.algorithm.textContent = String(state.algorithms.length);
  countNodes.task.textContent = String(state.tasks.length);

  if (!state.tasks.length) {
    countNodes.completion.textContent = "0%";
    return;
  }

  const average =
    state.tasks.reduce((sum, task) => sum + task.completed / task.target, 0) / state.tasks.length;
  countNodes.completion.textContent = `${Math.round(average * 100)}%`;
}

function renderTaskAssignmentSelector() {
  const checkedValues = new Set(
    Array.from(taskAssignmentList.querySelectorAll("[data-algorithm-id]:checked")).map((input) =>
      input.dataset.algorithmId
    )
  );
  taskAssignmentList.innerHTML = "";

  if (!state.algorithms.length) {
    taskAssignmentList.append(emptyState("请先录入公式，再给朋友布置练习。"));
    return;
  }

  state.categories.forEach((category) => {
    const algorithms = state.algorithms.filter((algorithm) => algorithm.category === category);
    if (!algorithms.length) {
      return;
    }

    const group = document.createElement("section");
    group.className = "assignment-group";
    group.classList.toggle("open", state.openAssignmentCategories.includes(category));

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "assignment-group-toggle";
    toggle.addEventListener("click", () => {
      toggleAssignmentCategory(category);
    });

    const meta = document.createElement("div");
    meta.className = "assignment-group-meta";
    const badge = document.createElement("span");
    badge.className = "category-badge";
    badge.textContent = category;
    const count = document.createElement("span");
    count.className = "assignment-group-count";
    count.textContent = `${algorithms.length} 条公式`;
    meta.append(badge, count);

    const actions = document.createElement("div");
    actions.className = "assignment-group-actions";

    const selectAllButton = document.createElement("button");
    selectAllButton.type = "button";
    selectAllButton.className = "assignment-group-select-all";
    selectAllButton.textContent = "全选此分类";
    selectAllButton.addEventListener("click", (event) => {
      event.stopPropagation();
      selectAssignmentCategory(category);
    });

    const chevron = document.createElement("span");
    chevron.className = "assignment-group-chevron";
    chevron.textContent = "▾";
    actions.append(selectAllButton, chevron);
    toggle.append(meta, actions);

    const body = document.createElement("div");
    body.className = "assignment-group-body";

    algorithms.forEach((algorithm) => {
      const row = document.createElement("label");
      row.className = "assignment-row";

      const info = document.createElement("div");
      info.className = "assignment-info";

      const thumb = document.createElement("div");
      thumb.className = "assignment-thumb";
      thumb.append(createPatternElement(algorithm.visualPattern));

      const textWrap = document.createElement("div");
      textWrap.innerHTML =
        `<strong>${escapeHtml(algorithm.name)}</strong><span>${escapeHtml(algorithm.category)}</span>`;
      info.append(thumb, textWrap);

      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "assignment-check";
      input.checked = checkedValues.has(algorithm.id);
      input.dataset.algorithmId = algorithm.id;
      input.setAttribute("aria-label", `选择 ${algorithm.name}`);

      row.append(info, input);
      body.append(row);
    });

    group.append(toggle, body);
    taskAssignmentList.append(group);
  });
}

function emptyState(text) {
  const div = document.createElement("div");
  div.className = "empty-state";
  div.textContent = text;
  return div;
}

function buildPatternEditor() {
  patternEditor.innerHTML = "";

  PATTERN_TEMPLATE.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cube-cell editor-cell";
      button.dataset.row = String(rowIndex);
      button.dataset.column = String(columnIndex);
      applyCellClasses(button, rowIndex, columnIndex);

      if (!cell) {
        button.classList.add("is-void");
      } else {
        button.addEventListener("click", () => {
          if (!isEditablePatternCell(rowIndex, columnIndex)) {
            return;
          }

          draftPattern[rowIndex][columnIndex] = draftPattern[rowIndex][columnIndex] ? 0 : 1;
          syncPatternEditor();
        });
      }

      patternEditor.append(button);
    });
  });

  patternEditor.append(createCenterFrame());
  syncPatternEditor();
}

function syncPatternEditor() {
  patternEditor.querySelectorAll(".cube-cell").forEach((cell) => {
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);
    if (!Number.isInteger(row) || !Number.isInteger(column) || !PATTERN_TEMPLATE[row][column]) {
      return;
    }

    cell.classList.toggle("active", Boolean(draftPattern[row][column]));
  });
}

function resetDraftPattern() {
  draftPattern = clonePattern(DEFAULT_PATTERN);
  syncPatternEditor();
}

function resetAlgorithmForm() {
  editingAlgorithmId = null;
  algorithmForm.reset();
  algorithmForm.elements.category.value = state.categories[0] || "";
  algorithmForm.elements.tag.value = "未学习";
  resetDraftPattern();
  setAlgorithmFormMode();
}

function resetTaskAssignmentSelector() {
  taskAssignmentList.querySelectorAll("[data-algorithm-id]").forEach((input) => {
    input.checked = false;
  });
  assignmentRepeatInput.value = "1";
}

function startEditingAlgorithm(item) {
  editingAlgorithmId = item.id;
  algorithmForm.elements.name.value = item.name || "";
  algorithmForm.elements.category.value = item.category || state.categories[0] || "";
  algorithmForm.elements.pattern.value = item.pattern || "";
  algorithmForm.elements.algorithm.value = item.algorithm || "";
  algorithmForm.elements.tag.value = Array.isArray(item.tags) ? item.tags[0] || "未学习" : "未学习";
  draftPattern = normalizePattern(item.visualPattern);
  syncPatternEditor();
  setAlgorithmFormMode();
  algorithmForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setAlgorithmFormMode() {
  const isEditing = Boolean(editingAlgorithmId);
  algorithmFormTitle.textContent = isEditing ? "编辑公式" : "录入公式";
  submitAlgorithmButton.textContent = isEditing ? "保存修改" : "保存公式";
  cancelEditButton.classList.toggle("hidden", !isEditing);
}

function createPatternElement(pattern) {
  const wrap = document.createElement("div");
  wrap.className = "cube-pattern";
  const normalized = normalizePattern(pattern);

  PATTERN_TEMPLATE.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const square = document.createElement("div");
      square.className = "cube-cell";
      applyCellClasses(square, rowIndex, columnIndex);
      if (!cell) {
        square.classList.add("is-void");
      } else if (normalized[rowIndex][columnIndex]) {
        square.classList.add("active");
      }
      wrap.append(square);
    });
  });

  wrap.append(createCenterFrame());
  return wrap;
}

function renderAssignmentSummary(task) {
  const wrap = document.createElement("div");
  const assignments = Array.isArray(task.assignments) ? task.assignments : [];

  assignments.forEach((assignment) => {
    const algorithm = state.algorithms.find((item) => item.id === assignment.algorithmId);
    const chip = document.createElement("span");
    chip.className = "assignment-chip";
    chip.textContent = `${algorithm?.name || "已删除公式"}`;
    wrap.append(chip);
  });

  if (task.needsMore) {
    const chip = document.createElement("span");
    chip.className = "assignment-chip";
    chip.textContent = `额外加练 ${task.needsMore} 次`;
    wrap.append(chip);
  }

  return wrap;
}

function renderPracticePanel() {
  const task = state.tasks.find((item) => item.id === activePracticeTaskId);

  if (!task) {
    practicePanel.classList.add("hidden");
    practiceTitle.textContent = "开始练习";
    practiceMeta.textContent = "";
    practiceContent.innerHTML = '<div class="empty-state">先从任务进度里点击“开始练习”。</div>';
    return;
  }

  practicePanel.classList.remove("hidden");
  practiceContent.innerHTML = "";

  if (!task.queue?.length) {
    practiceTitle.textContent = `${task.friendName} 已完成`;
    practiceMeta.textContent = `${task.date} · 已完成 ${task.completed}/${task.target}`;
    practiceContent.append(emptyState("这组练习已经全部完成。"));
    return;
  }

  const currentAlgorithmId = task.queue[0];
  const algorithm = state.algorithms.find((item) => item.id === currentAlgorithmId);

  if (!algorithm) {
    practiceContent.append(emptyState("当前公式不存在，请返回检查任务。"));
    return;
  }

  const currentIndex = Math.min(task.completed + 1, task.target);
  practiceTitle.textContent = task.friendName;
  practiceMeta.textContent = `${task.date} · 第 ${currentIndex} / ${task.target} 题 · 已完成 ${task.completed}`;

  const stage = document.createElement("div");
  stage.className = "practice-stage";

  const face = document.createElement("div");
  face.className = "practice-card-face";
  face.append(createPatternElement(algorithm.visualPattern));

  const name = document.createElement("h3");
  name.className = "practice-name";
  name.textContent = algorithm.name;
  face.append(name);

  const scramble = document.createElement("code");
  scramble.className = "algorithm-formula practice-algorithm";
  scramble.textContent = `打乱公式：${invertAlgorithm(algorithm.algorithm)}`;
  face.append(scramble);

  const formula = document.createElement("code");
  formula.className = "algorithm-formula practice-algorithm";
  formula.textContent = `公式：${algorithm.algorithm}`;
  face.append(formula);

  if (algorithm.pattern) {
    const note = document.createElement("p");
    note.className = "practice-note";
    note.textContent = `备注：${algorithm.pattern}`;
    face.append(note);
  }

  const actions = document.createElement("div");
  actions.className = "practice-actions";

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "primary-button";
  nextButton.textContent = "下一题";
  nextButton.addEventListener("click", () => {
    goToNextPracticeCard();
  });

  actions.append(nextButton);

  stage.append(face, actions);
  practiceContent.append(stage);
}

function goToNextPracticeCard() {
  if (!activePracticeTaskId) {
    return;
  }

  state.tasks = state.tasks.map((task) => {
    if (task.id !== activePracticeTaskId) {
      return task;
    }

    const queue = Array.isArray(task.queue) ? [...task.queue] : [];
    if (!queue.length) {
      return task;
    }

    const completedAlgorithmId = queue.shift();
    promoteNextDifferent(queue, completedAlgorithmId);
    return {
      ...task,
      queue,
      completed: Number(task.completed || 0) + 1
    };
  });

  persist();
  renderTasks();
  renderPracticePanel();
  renderStats();
}

function buildPracticeQueue(assignments) {
  const pool = assignments.map((assignment) => ({
    algorithmId: assignment.algorithmId,
    remaining: assignment.repetitions
  }));
  const queue = [];
  let lastAlgorithmId = null;

  while (pool.some((item) => item.remaining > 0)) {
    const candidates = pool
      .filter((item) => item.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining);

    let nextItem = candidates.find((item) => item.algorithmId !== lastAlgorithmId) || candidates[0];
    queue.push(nextItem.algorithmId);
    nextItem.remaining -= 1;
    lastAlgorithmId = nextItem.algorithmId;
  }

  return queue;
}

function promoteNextDifferent(queue, previousAlgorithmId) {
  if (!Array.isArray(queue) || queue.length <= 1) {
    return;
  }

  if (queue[0] !== previousAlgorithmId) {
    return;
  }

  const nextDifferentIndex = queue.findIndex((id) => id !== previousAlgorithmId);
  if (nextDifferentIndex <= 0) {
    return;
  }

  const [nextDifferent] = queue.splice(nextDifferentIndex, 1);
  queue.unshift(nextDifferent);
}

function toggleAssignmentCategory(category) {
  if (state.openAssignmentCategories.includes(category)) {
    state.openAssignmentCategories = state.openAssignmentCategories.filter((item) => item !== category);
  } else {
    state.openAssignmentCategories = [...state.openAssignmentCategories, category];
  }
  renderTaskAssignmentSelector();
}

function selectAssignmentCategory(category) {
  const checkedValues = new Set(
    Array.from(taskAssignmentList.querySelectorAll("[data-algorithm-id]:checked")).map((input) =>
      input.dataset.algorithmId
    )
  );
  const categoryIds = state.algorithms
    .filter((algorithm) => algorithm.category === category)
    .map((algorithm) => algorithm.id);
  const allChecked = categoryIds.every((id) => checkedValues.has(id));

  categoryIds.forEach((id) => {
    if (allChecked) {
      checkedValues.delete(id);
    } else {
      checkedValues.add(id);
    }
  });

  renderTaskAssignmentSelector();
  taskAssignmentList.querySelectorAll("[data-algorithm-id]").forEach((input) => {
    input.checked = checkedValues.has(input.dataset.algorithmId);
  });
}


function moveAlgorithm(id, direction) {
  const currentIndex = state.algorithms.findIndex((item) => item.id === id);
  if (currentIndex === -1) {
    return;
  }

  const targetIndex = currentIndex + direction;
  if (targetIndex < 0 || targetIndex >= state.algorithms.length) {
    return;
  }

  const nextAlgorithms = [...state.algorithms];
  [nextAlgorithms[currentIndex], nextAlgorithms[targetIndex]] = [
    nextAlgorithms[targetIndex],
    nextAlgorithms[currentIndex]
  ];
  state.algorithms = nextAlgorithms;
  persist();
  render();
}

function createFormulaStack(algorithm) {
  const wrap = document.createElement("div");
  wrap.className = "formula-stack";

  const formulaLine = document.createElement("div");
  formulaLine.className = "formula-line";
  const formulaLabel = document.createElement("p");
  formulaLabel.className = "formula-label";
  formulaLabel.textContent = "公式";
  const formulaCode = document.createElement("code");
  formulaCode.className = "algorithm-formula";
  formulaCode.textContent = algorithm;
  formulaLine.append(formulaLabel, formulaCode);

  const scrambleLine = document.createElement("div");
  scrambleLine.className = "formula-line";
  const scrambleLabel = document.createElement("p");
  scrambleLabel.className = "formula-label";
  scrambleLabel.textContent = "打乱公式";
  const scrambleCode = document.createElement("code");
  scrambleCode.className = "algorithm-formula";
  scrambleCode.textContent = invertAlgorithm(algorithm);
  scrambleLine.append(scrambleLabel, scrambleCode);

  wrap.append(formulaLine, scrambleLine);
  return wrap;
}

function normalizeAlgorithm(item) {
  return {
    ...item,
    tags: normalizeStatusTags(item.tags),
    visualPattern: normalizePattern(item.visualPattern)
  };
}

function normalizeTask(task) {
  const assignments = Array.isArray(task.assignments) ? task.assignments : [];
  const target =
    typeof task.target === "number" && Number.isFinite(task.target)
      ? task.target
      : assignments.reduce((sum, item) => sum + Number(item.repetitions || 0), 0);

  return {
    ...task,
    target,
    assignments,
    queue: Array.isArray(task.queue) ? task.queue : [],
    completed: Number(task.completed || 0),
    needsMore: Number(task.needsMore || 0)
  };
}

function createEmptyState() {
  return {
    algorithms: [],
    tasks: [],
    categories: [],
    algorithmFilter: "all",
    search: "",
    publishedAt: null
  };
}

function serializeState(asPublishedFile) {
  return {
    publishedAt: asPublishedFile ? new Date().toISOString() : state.publishedAt,
    categories: state.categories,
    algorithms: state.algorithms,
    tasks: state.tasks
  };
}

function normalizeAppState(data) {
  const rawAlgorithms = Array.isArray(data.algorithms) ? data.algorithms : seedAlgorithms;
  const normalizedAlgorithms = rawAlgorithms.map((item) => normalizeAlgorithm(item));
  const categories = normalizeCategories(data.categories, data.algorithms);
  return {
    algorithms: normalizedAlgorithms,
    tasks: Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : [],
    categories,
    algorithmFilter: state.algorithmFilter || "all",
    search: state.search || "",
    publishedAt: typeof data.publishedAt === "string" ? data.publishedAt : null
  };
}

function hydrateState(nextState) {
  state.algorithms = nextState.algorithms;
  state.tasks = nextState.tasks;
  state.categories = nextState.categories;
  state.algorithmFilter = nextState.algorithmFilter || "all";
  state.search = nextState.search || "";
  state.publishedAt = nextState.publishedAt || null;
  if (state.algorithmFilter !== "all" && !state.categories.includes(state.algorithmFilter)) {
    state.algorithmFilter = "all";
  }
}

async function loadPublishedState() {
  if (!window.location.protocol.startsWith("http")) {
    return normalizeAppState({
      algorithms: seedAlgorithms,
      tasks: []
    });
  }

  try {
    const response = await fetch(PUBLISHED_DATA_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("无法读取发布数据");
    }
    return normalizeAppState(await response.json());
  } catch {
    return normalizeAppState({
      algorithms: seedAlgorithms,
      tasks: []
    });
  }
}

async function initializeApp() {
  const localState = loadLocalState();
  const publishedState = await loadPublishedState();
  publishedSnapshot = structuredClone(publishedState);
  hydrateState(resolveInitialState(localState, publishedState));
  render();
}

function resolveInitialState(localState, publishedState) {
  if (!localState) {
    return publishedState;
  }

  if (
    publishedState?.publishedAt &&
    (!localState.publishedAt || new Date(publishedState.publishedAt) > new Date(localState.publishedAt))
  ) {
    return publishedState;
  }

  return localState;
}

function normalizeCategories(categories, algorithms) {
  const base = Array.isArray(categories) && categories.length ? categories : DEFAULT_CATEGORIES;
  const algorithmCategories = Array.from(
    new Set(
      (Array.isArray(algorithms) ? algorithms : seedAlgorithms)
        .map((item) => item?.category)
        .filter(Boolean)
    )
  );
  return Array.from(new Set([...base, ...algorithmCategories]));
}

function normalizeStatusTags(tags) {
  const firstTag = Array.isArray(tags) ? tags[0] : tags;
  if (DEFAULT_CATEGORIES.includes(firstTag)) {
    return [firstTag];
  }
  return ["未学习"];
}

function renameCategory(oldName, newName) {
  if (!newName) {
    window.alert("分类名称不能为空。");
    return;
  }
  if (oldName === newName) {
    return;
  }
  if (state.categories.includes(newName)) {
    window.alert("这个分类已经存在。");
    return;
  }

  state.categories = state.categories.map((category) => (category === oldName ? newName : category));
  state.algorithms = state.algorithms.map((item) =>
    item.category === oldName ? { ...item, category: newName } : item
  );
  if (state.algorithmFilter === oldName) {
    state.algorithmFilter = newName;
  }
  if (algorithmForm.elements.category.value === oldName) {
    algorithmForm.elements.category.value = newName;
  }
  persist();
  render();
}

function deleteCategory(name) {
  if (DEFAULT_CATEGORIES.includes(name)) {
    window.alert("默认学习分类需要保留，不能删除。");
    return;
  }

  state.categories = state.categories.filter((category) => category !== name);
  state.algorithms = state.algorithms.map((item) =>
    item.category === name ? { ...item, category: "未分类" } : item
  );
  if (state.algorithmFilter === name) {
    state.algorithmFilter = "all";
  }
  if (algorithmForm.elements.category.value === name) {
    algorithmForm.elements.category.value = "未分类";
  }
  persist();
  render();
}

function normalizePattern(pattern) {
  if (!Array.isArray(pattern)) {
    return clonePattern(DEFAULT_PATTERN);
  }

  return PATTERN_TEMPLATE.map((row, rowIndex) =>
    row.map((cell, columnIndex) => {
      if (!cell) {
        return 0;
      }

      return pattern?.[rowIndex]?.[columnIndex] ? 1 : 0;
    })
  );
}

function clonePattern(pattern) {
  return pattern.map((row) => [...row]);
}

function isEditablePatternCell(row, column) {
  return Boolean(PATTERN_TEMPLATE[row]?.[column]);
}

function applyCellClasses(element, row, column) {
  const region = getCellRegion(row, column);

  if (!region) {
    return;
  }

  element.classList.add(`cell-${region}`);
  applyCellPosition(element, row, column, region);
}

function getCellRegion(row, column) {
  if (!PATTERN_TEMPLATE[row]?.[column]) {
    return null;
  }

  if (row >= 1 && row <= 3 && column >= 1 && column <= 3) {
    return "center";
  }
  if (row === 0) {
    return "top";
  }
  if (row === 4) {
    return "bottom";
  }
  if (column === 0) {
    return "left";
  }
  if (column === 4) {
    return "right";
  }

  return null;
}

function createCenterFrame() {
  const frame = document.createElement("div");
  frame.className = "center-frame";
  return frame;
}

function applyCellPosition(element, row, column, region) {
  const centerStart = 36;
  const centerCell = 28;
  const sideTop = 16;
  const sideBottom = 122;
  const sideLeft = 16;
  const sideRight = 122;

  if (region === "center") {
    element.style.left = `${centerStart + (column - 1) * centerCell}px`;
    element.style.top = `${centerStart + (row - 1) * centerCell}px`;
    return;
  }

  if (region === "top") {
    element.style.left = `${centerStart + (column - 1) * centerCell + 1}px`;
    element.style.top = `${sideTop}px`;
    return;
  }

  if (region === "bottom") {
    element.style.left = `${centerStart + (column - 1) * centerCell + 1}px`;
    element.style.top = `${sideBottom}px`;
    return;
  }

  if (region === "left") {
    element.style.left = `${sideLeft}px`;
    element.style.top = `${centerStart + (row - 1) * centerCell + 1}px`;
    return;
  }

  if (region === "right") {
    element.style.left = `${sideRight}px`;
    element.style.top = `${centerStart + (row - 1) * centerCell + 1}px`;
  }
}

function formatAssignmentText(task) {
  return (task.assignments || [])
    .map((assignment) => {
      const algorithm = state.algorithms.find((item) => item.id === assignment.algorithmId);
      return `${algorithm?.name || "已删除公式"} x${assignment.repetitions}`;
    })
    .join("，");
}

function getRepeatSummary(task) {
  const repeatCount = task.assignments?.[0]?.repetitions || 0;
  return repeatCount ? `每条练习：${repeatCount} 次` : "每条练习：未设置";
}

function invertAlgorithm(algorithmText) {
  const tokens = tokenizeAlgorithm(algorithmText);
  if (!tokens.length) {
    return "暂时无法生成";
  }

  return tokens
    .reverse()
    .map(invertMove)
    .join(" ");
}

function tokenizeAlgorithm(text) {
  const normalized = String(text || "")
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
    .replaceAll("＇", "'")
    .replaceAll("`", "'")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return [];
  }

  const compact = normalized.replaceAll(" ", "");
  const tokens = compact.match(/([RUFLDBMESxyzrufldbmes][w]?)(2)?(')?/g) || [];

  return tokens.filter(Boolean);
}

function invertMove(move) {
  const normalized = move.replaceAll("’", "'").replaceAll("‘", "'");

  if (normalized.includes("2")) {
    return normalized.replace("'", "");
  }

  if (normalized.endsWith("'")) {
    return normalized.slice(0, -1);
  }

  return `${normalized}'`;
}

function shuffleArray(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

initializeApp();
