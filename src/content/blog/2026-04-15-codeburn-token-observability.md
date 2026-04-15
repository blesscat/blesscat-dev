---
title: "你的 Claude Code 每天燒多少錢？CodeBurn 用 13 類規則拆解 token 流向"
date: "2026-04-15"
datetime: "2026-04-15T09:30:00+08:00"
description: "一個工程師發現自己每天花 200 美元在 Claude Code 上卻完全沒有能見度，於是寫了 CodeBurn 這個開源工具，把每個對話回合自動分類成 13 種活動，直擊 AI coding 成本的黑盒子。"
heroImage: /images/2026-04-15-codeburn-token-observability.png
tags:
  - AI coding
  - Claude Code
  - 成本優化
  - 開源工具
  - token 追蹤
---

# 你的 Claude Code 每天燒多少錢？CodeBurn 用 13 類規則拆解 token 流向

> 「我每天在 Claude Code 燒 200 多美元，但完全不知道錢花去哪了。是 debugging 貴？brainstorming 貴？還是某個專案特別會吃？」

這個問題是 Reddit 用戶 `MurkyFlan567` 發 CodeBurn 工具帖子的開頭。貼文一推出就爆了——758 upvotes，討論串一路燒到 50+ 樓。工程師們終於有機會看看自己跟 AI 的「情感交流」到底花了多少錢。

## 安裝超級簡單

```bash
npx codeburn
# 或
npm install -g codeburn
```

只要你的機器有 Node.js 20+，有 Claude Code 的 session 資料（預設在 `~/.claude/projects/`），裝完就能跑。

---

## 核心思路：讀 transcript，不折騰 API

CodeBurn 的設計哲學很乾脆：**不攔截、不 proxy、不需要任何 API key**。它直接讀取 Claude Code 磁盤上已經儲存的 session transcript JSONL 檔案，用純規則（regex + tool pattern matching）把所有對話回合自動分類。**不需要呼叫 LLM 做分類，成本幾乎是零。**

### 13 類分類規則

這是工具最有價值的部分——一個回合究竟算「coding」還是「debugging」，靠的不是 AI 判斷，而是確定的工具指紋。

```
src/classifier.ts
```

每個 `ParsedTurn` 進來之後，先看有沒有**工具呼叫**：

| 工具指紋 | 初步分類 |
|---|---|
| `Edit`, `Write`, `FileEditTool`, `FileWriteTool` | `coding` |
| Bash（有 `test`/`pytest`/`jest` 關鍵字） | `testing` |
| Bash（有 `git push/commit/merge`） | `git` |
| Bash（有 `npm build`/`docker`/`pm2`） | `build/deploy` |
| `EnterPlanMode` | `planning` |
| `Agent`（subagent spawn） | `delegation` |
| `WebSearch`, `WebFetch`, `mcp__*` | `exploration` |
| `Read`, `Grep`, `Glob`（無 edits） | `exploration` |
| **完全沒有工具呼叫** | `conversation` |

然後用關鍵字**二次 refine**，例如：

```typescript
// 如果初步是 coding，再看使用者訊息
if (category === 'coding') {
  if (DEBUG_KEYWORDS.test(userMessage)) return 'debugging'
  // /\b(fix|bug|error|broken|failing|crash|debug|traceback)\b/i
  if (REFACTOR_KEYWORDS.test(userMessage)) return 'refactoring'
  // /\b(refactor|clean up|rename|simplify|migrate)\b/i
  if (FEATURE_KEYWORDS.test(userMessage)) return 'feature'
  // /\b(add|create|implement|build|introduce)\b/i
}
```

純對話（無工具）的回合也會被 keyword scan：

```typescript
function classifyConversation(userMessage: string): TaskCategory {
  if (BRAINSTORM_KEYWORDS.test(userMessage)) return 'brainstorming'
  // /\b(brainstorm|idea|what if|design|approach|strategy)\b/i
  if (RESEARCH_KEYWORDS.test(userMessage)) return 'exploration'
  // /\b(research|investigate|look into|check|search|explain)\b/i
  if (DEBUG_KEYWORDS.test(userMessage)) return 'debugging'
  return 'conversation'
}
```

所以同一句「幫我看一下這個 error」，在有工具的回合會進 debugging，在純對話裡也會進 debugging。規則一致，沒有歧義。

## 成本計算：LiteLLM 定價 + 24 小時快取

```
src/models.ts
```

每個 API call 的 token 用量（input / output / cache write / cache read / web search）從 transcript 的 `usage` 欄位讀取出來後，乘上對應模型的單價：

```typescript
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheCreationTokens: number,
  cacheReadTokens: number,
  webSearchRequests: number,
  speed: 'standard' | 'fast' = 'standard',
): number {
  const costs = getModelCosts(model)
  const multiplier = speed === 'fast' ? costs.fastMultiplier : 1
  return multiplier * (
    inputTokens * costs.inputCostPerToken +
    outputTokens * costs.outputCostPerToken +
    cacheCreationTokens * costs.cacheWriteCostPerToken +
    cacheReadTokens * costs.cacheReadCostPerToken +
    webSearchRequests * costs.webSearchCostPerRequest
  )
}
```

定價資料從 [LiteLLM 的 model_prices_and_context_window.json](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json) 自動抓取，快取 24 小時。万一抓不到，則使用內建的 hardcoded fallback——包括 Claude Opus 4.6、Sonnet 4.6、GPT-5.4 全系列。

重點是：**cache 成本有单独欄位**。很多人只看 input/output，忽略了 cache read 的費用。CodeBurn 把 `cache_creation_input_tokens` 和 `cache_read_input_tokens` 分開算，數字更準確。

## Retry 迴圈檢測：Edit → Bash → Edit 怎麼算？

這是另一個很有價值的指標——**一發成功率（1-shot rate）**。

```typescript
function countRetries(turn: ParsedTurn): number {
  let sawEditBeforeBash = false
  let sawBashAfterEdit = false
  let retries = 0

  for (const call of turn.assistantCalls) {
    const hasEdit = call.tools.some(t => EDIT_TOOLS.has(t))
    const hasBash = call.tools.some(t => BASH_TOOLS.has(t))

    if (hasEdit) {
      if (sawBashAfterEdit) retries++  // 又 edit 了，代表上一次没成功
      sawEditBeforeBash = true
      sawBashAfterEdit = false
    }
    if (hasBash && sawEditBeforeBash) {
      sawBashAfterEdit = true
    }
  }
  return retries
}
```

邏輯很聰明：**在同一個 turn 內，如果看到 Edit → Bash → Edit，就代表第一個 Edit 的輸出被驗證没通過（test 或 build 失敗），AI 需要重來**。次數就是 retry 次數。1-shot rate = 沒有 retry 的編輯回合 / 總編輯回合。

這個數字可以回答一個很實際的問題：「我到底需不需要一直盯著它？」

## 架構：Provider Plugin 系統

```
src/
  cli.ts           # Commander.js 入口
  dashboard.tsx    # Ink（React for TUI）
  parser.ts       # JSONL 讀取、dedup、分日期範圍
  classifier.ts   # 13 類規則引擎
  models.ts       # 定價計算
  providers/
    claude.ts     # Claude Code session discover
    codex.ts      # Codex session discover + tool name normalization
```

讓我特別想強調的是 **provider plugin 系統**。新增一個 provider（如 Pi、OpenCode、Amp）只需要實作一個檔案，實現四個介面：

- `createSessionParser()` — 找到並解析 session 檔案
- `normalizeToolName()` — 把各家 tool name 統一映射
- `getModelDisplayName()` — 顯示用戶看得懂的名字

Codex 的 tool name 會被 normalize 成 Claude 的 conventions（`exec_command` → `Bash`、`read_file` → `Read`），這樣分類規則可以跨 provider 共用，**同一套 13 類邏輯同時適用於 Claude Code 和 Codex**。

## Parser 邏輯：對話回合怎麼組成的

```
src/parser.ts
```

每個 session 是 JSONL 檔案，一行一筆記錄（`JournalEntry`），type 是 `user` 或 `assistant`。Parser 做的事是：

1. **Group into turns**：遇到 `type: 'user'` 的 entry，就開一個新 turn，把累積的 assistant calls 包裝成一個 `ParsedTurn`
2. **Deduplicate**：用 API message ID 去重（Claude 存了 `msg.id`），避免重複計算
3. **Date filter**：支援只分析特定日期範圍（today / 7d / 30d / month）
4. **Subagent sessions**：session 目錄下的 `subagents/` 子目錄也會遞迴掃描

```typescript
async function collectJsonlFiles(dirPath: string): Promise<string[]> {
  const files = await readdir(dirPath).catch(() => [])
  // ... 也掃 subagents/ 子目錄
  for (const entry of files) {
    const subagentsPath = join(dirPath, entry, 'subagents')
    const subFiles = await readdir(subagentsPath).catch(() => [])
    // subagent sessions 也納入
  }
}
```

## 大家發現了什麼？

作者 `MurkyFlan567` 自己的分析結果出來之後引發大量共鳴：

> **56% 的花費是「Conversation」——純文字來回，沒有任何工具呼叫。**
> 實際 coding（edits / writes）只佔 21%。

還有人在底下留言：跑完才發現 Claude Code 在背景默默開了**數千個 terminal sessions**，自己完全沒察覺。有人的日花費從自以為的「合理範圍」直接翻倍。

這個數據呼應了一個很多人不願面對的事實：大家以為在「讓 AI 幫我寫程式」，實際上大量時間是在「跟 AI 討論需求、解釋 bug、安撫 AI 的情緒」。

## 總結：值得關注的設計思路

| 面向 | CodeBurn 的做法 |
|---|---|
| **成本追蹤** | 直接讀磁盤上的 transcript，不 proxy，不吃 API quota |
| **分類方式** | 純規則引擎，零額外 LLM 調用意願 |
| **資料來源** | JSONL（已存在的資料），無需改造任何基礎建設 |
| **Provider 擴展** | Plugin 架構，一個檔案新增一種 tool |
| **覆蓋範圍** | Claude Code + Claude Desktop + Codex（以及規劃中的 Pi、OpenCode、Amp）|
| **貨幣支援** | 162 種法幣，自動抓 ECB 匯率，24 小時快取 |

CodeBurn 解決的不是「看得見總花費」的問題——ccusage 已經可以做到。它解決的是「**看不見錢花去哪**」的問題。把錢切成有意義的類別，讓工程師終於能回答：「我的 brainstorming 每次燒多少錢？」

GitHub: [AgentSeal/codeburn](https://github.com/AgentSeal/codeburn) · 893 stars（還在漲）
