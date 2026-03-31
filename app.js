const STORAGE_KEY = "cubemate-data-v1";
const PUBLISHED_DATA_URL = "./data.json";
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
    category: "OLL",
    pattern: "顶面只剩一个角朝上，正面看像一条小鱼。",
    algorithm: "R U R' U R U2 R'",
    tags: ["2-look", "初学者"],
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
    category: "OLL",
    pattern: "和小鱼相反方向，常见于顶层定向第二种情况。",
    algorithm: "R U2 R' U' R U' R'",
    tags: ["2-look", "初学者"],
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
    category: "OLL",
    pattern: "正面像一个 T 形，常用于两步顶层。",
    algorithm: "r U R' U' r' F R F'",
    tags: ["常用", "进阶"],
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
    category: "PLL",
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
    category: "PLL",
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
const cancelEditButton = document.getElementById("cancelEditButton");
const submitAlgorithmButton = document.getElementById("submitAlgorithmButton");
const algorithmFormKicker = document.getElementById("algorithmFormKicker");
const algorithmFormTitle = document.getElementById("algorithmFormTitle");
const practicePanel = document.getElementById("practicePanel");
const practiceTitle = document.getElementById("practiceTitle");
const practiceMeta = document.getElementById("practiceMeta");
const practiceContent = document.getElementById("practiceContent");
const closePracticeButton = document.getElementById("closePracticeButton");
const countNodes = {
  algorithm: document.getElementById("algorithmCount"),
  task: document.getElementById("taskCount"),
  completion: document.getElementById("completionRate")
};
let draftPattern = clonePattern(DEFAULT_PATTERN);
let editingAlgorithmId = null;
let activePracticeTaskId = null;
let practiceRevealSolution = false;
let publishedSnapshot = null;

taskForm.elements.date.value = today;
buildPatternEditor();
renderTaskAssignmentSelector();

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    state.algorithmFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((node) => {
      node.classList.toggle("active", node === button);
    });
    renderAlgorithms();
  });
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
    tags: String(formData.get("tags"))
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
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
  const assignments = Array.from(taskAssignmentList.querySelectorAll("[data-algorithm-id]"))
    .map((input) => ({
      algorithmId: input.dataset.algorithmId,
      repetitions: Number(input.value || 0)
    }))
    .filter((item) => item.repetitions > 0);

  if (!assignments.length) {
    window.alert("请至少选择一条公式，并设置练习次数。");
    return;
  }

  const queue = shuffleArray(
    assignments.flatMap((item) => Array.from({ length: item.repetitions }, () => item.algorithmId))
  );
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

closePracticeButton.addEventListener("click", () => {
  activePracticeTaskId = null;
  practiceRevealSolution = false;
  renderPracticePanel();
});

restorePublishedButton.addEventListener("click", () => {
  if (!publishedSnapshot) {
    window.alert("当前没有可恢复的线上发布版本。");
    return;
  }

  hydrateState(structuredClone(publishedSnapshot));
  activePracticeTaskId = null;
  practiceRevealSolution = false;
  resetAlgorithmForm();
  persist();
  render();
  window.alert("已恢复到当前仓库里的发布版本。");
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
  renderAlgorithms();
  renderTaskAssignmentSelector();
  renderTasks();
  renderStats();
  renderPracticePanel();
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
    node.querySelector(".category-pill").textContent = item.category;
    node.querySelector(".tag-pill").textContent = item.tags?.[0] || "未分类标签";
    node.querySelector(".algorithm-visual").append(createPatternElement(item.visualPattern));
    node.querySelector(".algorithm-name").textContent = item.name;
    node.querySelector(".algorithm-pattern").textContent = item.pattern || "暂时没有补充案例描述。";
    node.querySelector(".algorithm-formula").replaceWith(createFormulaStack(item.algorithm));
    node.querySelector(".edit-algorithm").addEventListener("click", () => {
      startEditingAlgorithm(item);
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
    node.querySelector(".progress-value").style.width = `${progress}%`;
    node.querySelector(".task-assignment-summary").append(renderAssignmentSummary(task));

    node.querySelector(".task-practice").addEventListener("click", () => {
      activePracticeTaskId = task.id;
      practiceRevealSolution = false;
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

    node.querySelector(".task-share").addEventListener("click", async () => {
      const message =
        `魔方练习任务\n` +
        `朋友：${task.friendName}\n` +
        `日期：${task.date}\n` +
        `目标：${task.target} 次\n` +
        `当前进度：${task.completed}/${task.target}\n` +
        `训练重点：${task.focus || "未设置"}\n` +
        `练习公式：${formatAssignmentText(task)}`;

      try {
        await navigator.clipboard.writeText(message);
        window.alert("任务文案已复制");
      } catch {
        window.alert(message);
      }
    });

    taskList.append(node);
  });
}

function renderStats() {
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
  const currentValues = new Map(
    Array.from(taskAssignmentList.querySelectorAll("[data-algorithm-id]")).map((input) => [
      input.dataset.algorithmId,
      input.value
    ])
  );
  taskAssignmentList.innerHTML = "";

  if (!state.algorithms.length) {
    taskAssignmentList.append(emptyState("请先录入公式，再给朋友布置练习。"));
    return;
  }

  state.algorithms.forEach((algorithm) => {
    const row = document.createElement("label");
    row.className = "assignment-row";
    row.innerHTML =
      `<div><strong>${escapeHtml(algorithm.name)}</strong><span>${escapeHtml(algorithm.category)}</span></div>`;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = currentValues.get(algorithm.id) || "0";
    input.dataset.algorithmId = algorithm.id;
    input.setAttribute("aria-label", `${algorithm.name} 练习次数`);
    row.append(input);
    taskAssignmentList.append(row);
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
  resetDraftPattern();
  setAlgorithmFormMode();
}

function resetTaskAssignmentSelector() {
  taskAssignmentList.querySelectorAll("input").forEach((input) => {
    input.value = "0";
  });
}

function startEditingAlgorithm(item) {
  editingAlgorithmId = item.id;
  algorithmForm.elements.name.value = item.name || "";
  algorithmForm.elements.category.value = item.category || "OLL";
  algorithmForm.elements.pattern.value = item.pattern || "";
  algorithmForm.elements.algorithm.value = item.algorithm || "";
  algorithmForm.elements.tags.value = Array.isArray(item.tags) ? item.tags.join(", ") : "";
  draftPattern = normalizePattern(item.visualPattern);
  syncPatternEditor();
  setAlgorithmFormMode();
  algorithmForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setAlgorithmFormMode() {
  const isEditing = Boolean(editingAlgorithmId);
  algorithmFormKicker.textContent = isEditing ? "编辑内容" : "新增内容";
  algorithmFormTitle.textContent = isEditing ? "编辑顶层公式" : "录入顶层公式";
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
    chip.textContent = `${algorithm?.name || "已删除公式"} × ${assignment.repetitions}`;
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
    practiceContent.innerHTML = '<div class="empty-state">先从任务卡片里点击“开始练习”。</div>';
    return;
  }

  practicePanel.classList.remove("hidden");
  practiceTitle.textContent = `${task.friendName} 的练习任务`;
  practiceMeta.textContent = `${task.date} · 已完成 ${task.completed}/${task.target}${task.needsMore ? ` · 加练 ${task.needsMore}` : ""}`;
  practiceContent.innerHTML = "";

  if (!task.queue?.length) {
    practiceContent.append(emptyState("本次练习已经全部完成，可以继续创建新的任务。"));
    return;
  }

  const currentAlgorithmId = task.queue[0];
  const algorithm = state.algorithms.find((item) => item.id === currentAlgorithmId);

  if (!algorithm) {
    task.queue.shift();
    persist();
    render();
    return;
  }

  const stage = document.createElement("div");
  stage.className = "practice-stage";
  stage.append(createPatternElement(algorithm.visualPattern));

  const title = document.createElement("h3");
  title.textContent = algorithm.name;
  stage.append(title);

  const description = document.createElement("p");
  description.className = "algorithm-pattern";
  description.textContent = algorithm.pattern || "暂时没有补充案例描述。";
  stage.append(description);

  const formula = document.createElement("code");
  formula.className = "algorithm-formula practice-algorithm";
  formula.textContent = algorithm.algorithm;

  const scramble = document.createElement("code");
  scramble.className = "algorithm-formula practice-algorithm";
  scramble.textContent = `打乱公式：${invertAlgorithm(algorithm.algorithm)}`;
  stage.append(scramble);

  if (practiceRevealSolution) {
    const solutionLabel = document.createElement("p");
    solutionLabel.className = "formula-label";
    solutionLabel.textContent = "参考公式";
    stage.append(solutionLabel);
    stage.append(formula);
  }

  const actions = document.createElement("div");
  actions.className = "practice-actions";

  const successButton = document.createElement("button");
  successButton.type = "button";
  successButton.className = "primary-button";
  successButton.textContent = "成功还原";
  successButton.addEventListener("click", () => {
    task.queue.shift();
    task.completed += 1;
    practiceRevealSolution = false;
    persist();
    render();
  });

  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.className = "ghost-button";
  retryButton.textContent = "还需练习";
  retryButton.addEventListener("click", () => {
    practiceRevealSolution = true;
    persist();
    renderPracticePanel();
  });

  actions.append(successButton, retryButton);

  if (practiceRevealSolution) {
    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "ghost-button";
    nextButton.textContent = "加入加练并下一题";
    nextButton.addEventListener("click", () => {
      const algorithmId = task.queue.shift();
      task.queue.push(algorithmId);
      task.needsMore += 1;
      task.queue = shuffleArray(task.queue);
      practiceRevealSolution = false;
      persist();
      render();
    });
    actions.append(nextButton);
  }

  stage.append(actions);
  practiceContent.append(stage);
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
    algorithmFilter: "all",
    search: "",
    publishedAt: null
  };
}

function serializeState(asPublishedFile) {
  return {
    publishedAt: asPublishedFile ? new Date().toISOString() : state.publishedAt,
    algorithms: state.algorithms,
    tasks: state.tasks
  };
}

function normalizeAppState(data) {
  return {
    algorithms: Array.isArray(data.algorithms)
      ? data.algorithms.map(normalizeAlgorithm)
      : seedAlgorithms.map(normalizeAlgorithm),
    tasks: Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : [],
    algorithmFilter: state.algorithmFilter || "all",
    search: state.search || "",
    publishedAt: typeof data.publishedAt === "string" ? data.publishedAt : null
  };
}

function hydrateState(nextState) {
  state.algorithms = nextState.algorithms;
  state.tasks = nextState.tasks;
  state.algorithmFilter = nextState.algorithmFilter || "all";
  state.search = nextState.search || "";
  state.publishedAt = nextState.publishedAt || null;
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
