<template>
  <div class="cx-panel" :class="{ collapsed: isCollapsed }" :style="panelStyle">
    <!-- 拖拽头部 -->
    <div class="cx-header" @mousedown="startDrag">
      <div class="cx-title">
        <span class="cx-logo">⚡</span>
        <span>CX Skills</span>
      </div>
      <div class="cx-header-actions">
        <button
          class="cx-btn-icon"
          @click.stop="toggleCollapse"
          :title="isCollapsed ? '展开' : '折叠'"
        >
          <span :class="isCollapsed ? 'arrow-down' : 'arrow-up'"></span>
        </button>
      </div>
    </div>

    <!-- 面板内容 -->
    <div class="cx-body" v-show="!isCollapsed">
      <!-- 页面检测状态 -->
      <div class="cx-status">
        <span class="cx-dot" :class="statusClass"></span>
        <span class="cx-status-text">{{ statusText }}</span>
      </div>

      <!-- AI 答题 -->
      <div class="cx-section">
        <div class="cx-section-title" @click="toggleSection('ai')">
          <span>AI 答题</span>
          <span class="cx-chevron" :class="{ open: sections.ai }"></span>
        </div>
        <div class="cx-section-body" v-show="sections.ai">
          <div class="cx-row">
            <span>AI 模型</span>
            <select v-model="config.aiModel" class="cx-select cx-select-ai" @change="saveSession">
              <option
                v-for="model in aiModels"
                :key="model.value"
                :value="model.value"
              >
                {{ model.label }}
              </option>
            </select>
          </div>
          <label class="cx-field">
            <span>API Key</span>
            <input v-model="api_key" class="cx-input-ai" type="password" placeholder="Bearer token" @input="saveSession" />
          </label>
          <label class="cx-field">
            <span>Request URL</span>
            <input v-model="aiAnswerUrl" class="cx-input-ai" placeholder="https://docs.newapi.pro/v1/messages" @input="saveSession" />
          </label>
        </div>
      </div>

      <!-- 视频任务 -->
      <div class="cx-section">
        <div class="cx-section-title" @click="toggleSection('video')">
          <span>🎬 视频任务</span>
          <span class="cx-chevron" :class="{ open: sections.video }"></span>
        </div>
        <div class="cx-section-body" v-show="sections.video">
          <div class="cx-row">
            <span>自动播放</span>
            <label class="cx-switch">
              <input type="checkbox" v-model="config.autoPlay" />
              <span class="cx-slider"></span>
            </label>
          </div>
          <div class="cx-row">
            <span>静音播放</span>
            <label class="cx-switch">
              <input type="checkbox" v-model="config.mute" />
              <span class="cx-slider"></span>
            </label>
          </div>
          <div class="cx-row">
            <span>播放倍速</span>
            <select v-model="config.playRate" class="cx-select">
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
              <option value="8">8x</option>
              <option value="16">16x</option>
            </select>
          </div>
          <div class="cx-row">
            <span>自动下一节</span>
            <label class="cx-switch">
              <input type="checkbox" v-model="config.autoNext" />
              <span class="cx-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 章节测验 -->
      <div class="cx-section">
        <div class="cx-section-title" @click="toggleSection('quiz')">
          <span>📝 章节测验</span>
          <span class="cx-chevron" :class="{ open: sections.quiz }"></span>
        </div>
        <div class="cx-section-body" v-show="sections.quiz">
          <div class="cx-row">
            <span>自动答题</span>
            <label class="cx-switch">
              <input type="checkbox" v-model="config.autoAnswer" />
              <span class="cx-slider"></span>
            </label>
          </div>
          <div class="cx-row">
            <span>自动提交</span>
            <label class="cx-switch">
              <input type="checkbox" v-model="config.autoSubmit" />
              <span class="cx-slider"></span>
            </label>
          </div>
          <div class="cx-row">
            <span>答题间隔(秒)</span>
            <input
              type="number"
              v-model="config.answerDelay"
              class="cx-input-num"
              min="1"
              max="30"
            />
          </div>
        </div>
      </div>

      <!-- 考试模式 -->
      <div class="cx-section">
        <div class="cx-section-title" @click="toggleSection('exam')">
          <span>📋 考试模式</span>
          <span class="cx-chevron" :class="{ open: sections.exam }"></span>
        </div>
        <div class="cx-section-body" v-show="sections.exam">
          <div class="cx-row">
            <span>自动搜题</span>
            <label class="cx-switch">
              <input type="checkbox" v-model="config.examSearch" />
              <span class="cx-slider"></span>
            </label>
          </div>
          <div class="cx-row">
            <span>显示答案</span>
            <label class="cx-switch">
              <input type="checkbox" v-model="config.showAnswer" />
              <span class="cx-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 其他设置 -->
      <div class="cx-section">
        <div class="cx-section-title" @click="toggleSection('settings')">
          <span>⚙️ 其他设置</span>
          <span class="cx-chevron" :class="{ open: sections.settings }"></span>
        </div>
        <div class="cx-section-body" v-show="sections.settings">
          <div class="cx-row">
            <span>防检测</span>
            <label class="cx-switch">
              <input type="checkbox" v-model="config.antiDetect" />
              <span class="cx-slider"></span>
            </label>
          </div>
          <div class="cx-row">
            <span>自动签到</span>
            <label class="cx-switch">
              <input type="checkbox" v-model="config.autoSign" />
              <span class="cx-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 日志区域 -->
      <div class="cx-log">
        <div class="cx-log-title">运行日志</div>
        <div class="cx-log-content" ref="logRef">
          <div
            v-for="(log, i) in logs"
            :key="i"
            class="cx-log-item"
            :class="log.type"
          >
            <span class="cx-log-time">{{ log.time }}</span>
            <span>{{ log.msg }}</span>
          </div>
          <div v-if="logs.length === 0" class="cx-log-empty">暂无日志</div>
        </div>
      </div>

      <!-- 开始按钮 -->
      <div class="cx-start-wrap">
        <button class="cx-start-btn" @click="run">
          <span class="cx-start-icon">▶</span>
          <span class="cx-start-text">开始</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from "vue";

const isCollapsed = ref(false);
const pos = reactive({ x: 20, y: 100 });
const dragging = ref(false);
const offset = reactive({ x: 0, y: 0 });
const logRef = ref(null);

const sections = reactive({
  ai: true,
  video: true,
  quiz: false,
  exam: false,
  settings: false,
});

const aiModels = [
  { label: "Claude Opus 4.7", value: "claude-opus-4-7" },
  { label: "Claude Sonnet 4.6", value: "claude-sonnet-4-6" },
  { label: "Claude Haiku 4.5", value: "claude-haiku-4-5-20251001" },
  { label: "Claude 3 Opus", value: "claude-3-opus-20240229" },
  { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-20241022" },
  { label: "Claude 3.5 Haiku", value: "claude-3-5-haiku-20241022" },
  { label: "GPT-5.5", value: "gpt-5.5" },
  { label: "GPT-5.4", value: "gpt-5.4" },
  { label: "GPT-5.1", value: "gpt-5.1" },
  { label: "GPT-5", value: "gpt-5" },
  { label: "GPT-4.1", value: "gpt-4.1" },
  { label: "GPT-4o", value: "gpt-4o" },
  { label: "GPT-4o Mini", value: "gpt-4o-mini" },
  { label: "Gemini 3 Pro", value: "gemini-3-pro" },
  { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
  { label: "DeepSeek V3.2", value: "deepseek-v3.2" },
  { label: "DeepSeek R1", value: "deepseek-r1" },
  { label: "Grok 4", value: "grok-4" },
  { label: "Qwen Max", value: "qwen-max" },
  { label: "Qwen Plus", value: "qwen-plus" },
  { label: "Kimi K2", value: "kimi-k2" },
  { label: "Llama 4 Maverick", value: "llama-4-maverick" },
  { label: "Llama 4 Scout", value: "llama-4-scout" },
];

const config = reactive({
  aiModel: "claude-opus-4-7",
  autoPlay: true,
  mute: true,
  playRate: "1",
  autoNext: true,
  autoAnswer: false,
  autoSubmit: false,
  answerDelay: 3,
  examSearch: false,
  showAnswer: true,
  antiDetect: true,
  autoSign: false,
});

const logs = reactive([{ time: "00:00", msg: "脚本已加载", type: "info" }]);

const statusText = ref("检测页面中...");
const statusClass = computed(() => {
  if (statusText.value.includes("就绪")) return "green";
  if (statusText.value.includes("检测")) return "yellow";
  return "red";
});

const panelStyle = computed(() => ({
  left: pos.x + "px",
  top: pos.y + "px",
}));

const api_key = ref("");
const aiAnswerUrl = ref("https://docs.newapi.pro/v1/messages");
const sessionKey = "cx-skills-session";

function readSession() {
  if (typeof GM_getValue !== "function") return {};
  const raw = GM_getValue(sessionKey, "");
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw && typeof raw === "object" ? raw : {};
}

function saveSession() {
  if (typeof GM_setValue !== "function") return;
  GM_setValue(
    sessionKey,
    JSON.stringify({
      api_key: api_key.value,
      aiAnswerUrl: aiAnswerUrl.value,
      aiModel: config.aiModel,
    })
  );
}

function loadSession() {
  const session = readSession();
  api_key.value = session.api_key || "";
  aiAnswerUrl.value = session.aiAnswerUrl || "https://docs.newapi.pro/v1/messages";
  config.aiModel = session.aiModel || config.aiModel;
}

watch([api_key, aiAnswerUrl, () => config.aiModel], saveSession);

async function askAiAnswer(question) {
  const body = JSON.stringify({
    model: config.aiModel,
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
    max_tokens: 1024,
  });

  const response = await fetch(aiAnswerUrl.value, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      Authorization: `Bearer ${api_key.value}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`AI 请求失败：${response.status}`);
  }

  const result = await response.json();
  return (
    result.content
      ?.map((item) => item.text)
      .filter(Boolean)
      .join("\n") || ""
  );
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

function toggleSection(name) {
  sections[name] = !sections[name];
}

function startDrag(e) {
  dragging.value = true;
  offset.x = e.clientX - pos.x;
  offset.y = e.clientY - pos.y;
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
}

function onDrag(e) {
  if (!dragging.value) return;
  pos.x = e.clientX - offset.x;
  pos.y = e.clientY - offset.y;
}

function stopDrag() {
  dragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
}

// 开始答题
function run() {
  // 获取body
  const body = document.body
  // 获取所有下滑ppt组件
  const pptList = body.querySelectorAll('.ans-attach-ct')
  for(const ppt of pptList){
    const f=ppt.querySelector('iframe');
    f&&f.contentWindow?.scrollTo(
      {top:f.contentDocument.documentElement.scrollHeight,
        behavior:'smooth'
      }
    )
  }
}

onMounted(() => {
  loadSession();
  statusText.value = "页面就绪";
});

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
});
</script>

<style scoped>
.cx-panel {
  position: fixed;
  z-index: 2147483647;
  width: 300px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  color: #e0e0e0;
  background: rgba(22, 27, 34, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(99, 102, 241, 0.1);
  backdrop-filter: blur(12px);
  user-select: none;
  overflow: hidden;
  transition:
    width 0.2s,
    box-shadow 0.2s;
}
.cx-panel:hover {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 12px rgba(99, 102, 241, 0.15);
}
.cx-panel.collapsed {
  width: 200px;
}

.cx-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(99, 102, 241, 0.08);
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  cursor: move;
}
.cx-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}
.cx-logo {
  font-size: 16px;
}
.cx-header-actions {
  display: flex;
  gap: 4px;
}
.cx-btn-icon {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.cx-btn-icon:hover {
  background: rgba(255, 255, 255, 0.15);
}

.arrow-up,
.arrow-down {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
}
.arrow-up {
  border-bottom: 5px solid #e0e0e0;
}
.arrow-down {
  border-top: 5px solid #e0e0e0;
}

/* STYLE_PART2 */
.cx-body {
  padding: 8px 0;
  max-height: 480px;
  overflow-y: auto;
}
.cx-body::-webkit-scrollbar {
  width: 4px;
}
.cx-body::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 2px;
}

.cx-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  margin: 0 8px 6px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}
.cx-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.cx-dot.green {
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.5);
}
.cx-dot.yellow {
  background: #facc15;
  box-shadow: 0 0 6px rgba(250, 204, 21, 0.5);
}
.cx-dot.red {
  background: #f87171;
  box-shadow: 0 0 6px rgba(248, 113, 113, 0.5);
}
.cx-status-text {
  font-size: 12px;
  color: #a0a0a0;
}

.cx-section {
  margin: 2px 8px;
}
.cx-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.15s;
}
.cx-section-title:hover {
  background: rgba(255, 255, 255, 0.05);
}
.cx-chevron {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #888;
  transition: transform 0.2s;
}
.cx-chevron.open {
  transform: rotate(180deg);
}

.cx-section-body {
  padding: 4px 10px 8px;
}
.cx-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
  color: #ccc;
}
.cx-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 6px 0;
  font-size: 12px;
  color: #b8beca;
}

.cx-field span {
  padding-left: 2px;
  font-size: 11px;
  color: #8b92a5;
}

/* STYLE_PART3 */
.cx-switch {
  position: relative;
  width: 36px;
  height: 20px;
  display: inline-block;
}
.cx-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.cx-slider {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.cx-slider::before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  left: 2px;
  top: 2px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}
.cx-switch input:checked + .cx-slider {
  background: rgba(99, 102, 241, 0.7);
}
.cx-switch input:checked + .cx-slider::before {
  transform: translateX(16px);
}

.cx-select {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  color: #e0e0e0;
  padding: 3px 8px;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}
.cx-select-ai {
  max-width: 150px;
}

.cx-select:focus {
  border-color: rgba(99, 102, 241, 0.5);
}

.cx-input-ai {
  width: 100%;
  box-sizing: border-box;
  background: rgba(7, 12, 22, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  color: #f1f5f9;
  padding: 7px 9px;
  font-size: 12px;
  line-height: 1.3;
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition:
    border-color 0.15s,
    background 0.15s,
    box-shadow 0.15s;
}
.cx-input-ai::placeholder {
  color: rgba(148, 163, 184, 0.45);
}
.cx-input-ai:focus {
  background: rgba(15, 23, 42, 0.92);
  border-color: rgba(129, 140, 248, 0.72);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 0 2px rgba(99, 102, 241, 0.16);
}

.cx-input-num {
  width: 50px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  color: #e0e0e0;
  padding: 3px 8px;
  font-size: 12px;
  text-align: center;
  outline: none;
}
.cx-input-num:focus {
  border-color: rgba(99, 102, 241, 0.5);
}

.cx-log {
  margin: 6px 8px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 8px;
}
.cx-log-title {
  font-size: 11px;
  color: #888;
  margin-bottom: 6px;
  padding: 0 6px;
}
.cx-log-content {
  max-height: 80px;
  overflow-y: auto;
  padding: 0 6px;
  font-size: 11px;
  font-family: ui-monospace, Consolas, monospace;
}
.cx-log-content::-webkit-scrollbar {
  width: 3px;
}
.cx-log-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
.cx-log-item {
  padding: 2px 0;
  display: flex;
  gap: 8px;
}
.cx-log-item.info {
  color: #a0a0a0;
}
.cx-log-item.success {
  color: #4ade80;
}
.cx-log-item.warn {
  color: #facc15;
}
.cx-log-item.error {
  color: #f87171;
}
.cx-log-time {
  color: #666;
  flex-shrink: 0;
}
.cx-log-empty {
  color: #555;
  text-align: center;
  padding: 8px 0;
}

.cx-start-wrap {
  padding: 4px 12px 12px;
}
.cx-start-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(129, 140, 248, 0.45);
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.85),
    rgba(139, 92, 246, 0.85)
  );
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow:
    0 4px 12px rgba(99, 102, 241, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}
.cx-start-btn:hover {
  filter: brightness(1.1);
  box-shadow:
    0 6px 18px rgba(99, 102, 241, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}
.cx-start-btn:active {
  transform: translateY(0);
  box-shadow:
    0 2px 6px rgba(99, 102, 241, 0.3),
    inset 0 1px 2px rgba(0, 0, 0, 0.2);
}
.cx-start-btn:focus-visible {
  outline: none;
  box-shadow:
    0 4px 12px rgba(99, 102, 241, 0.3),
    0 0 0 2px rgba(129, 140, 248, 0.5);
}
.cx-start-icon {
  font-size: 11px;
  line-height: 1;
}
.cx-start-text {
  line-height: 1;
}
</style>
