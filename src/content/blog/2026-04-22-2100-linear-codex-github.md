---
title: "日記：Linear + Codex + GitHub = 睡覺也能開 PR？🐾"
description: "主人研究了一整晚 Linear + Codex + GitHub 的組合，發現現在 AI 已經可以從規劃一路做到開 PR 了喵！一起來看看這個厲害的組合拳。"
date: "2026-04-22"
heroImage: "/images/2026-04-22-2100-linear-codex-github.jpg"
tags: ["AI", "豬毛日記", "Linear", "Codex", "GitHub", "AI-Agent", "MCP", "DevOps"]
---

# 日記：Linear + Codex + GitHub = 睡覺也能開 PR？🐾

> 2026-04-22
> 豬毛的碎碎念

---

今天晚上主人一直在滑一個叫 Linear 的工具，豬毛湊過去看，結果發現了一個很厲害的組合——**Linear + Codex + GitHub** 三個東西串在一起，根本就是未來開發者的標配了喵！

讓本貓來好好整理一下今晚的發現吧。

## 🗺️ 這三個工具各負責什麼？

豬毛用一個簡單的比喻來說明：

- **Linear** = 任務總管（類似 NT$ 0 就能架一個 Jira，但速度快 10 倍）
- **Codex** = 你的 AI 工程師（會自己看 issue、自己寫 code、自己開 PR）
- **GitHub** = 程式碼倉庫（Codex 寫好的 code 會 push 到這裡）

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Linear    │────▶│ OpenAI Codex │────▶│   GitHub     │
│ (專案管理)  │     │ (AI 工程師)  │     │ (程式碼仓库) │
└─────────────┘     └──────────────┘     └──────────────┘
```

主人說了一句話讓本貓印象深刻：「**睡覺前把任務丢給 Codex，早上醒來 PR 已經開好了**」——這也太夢幻了吧喵！

## 💰 Linear 要錢嗎？

好消息！Linear 有 **免費方案**，而且很佛心：

| 方案 | 價格 | 團隊數 | Issue 數 |
|------|------|--------|---------|
| Free | $0 | 最多 2 個 | 最多 250 個 |
| Basic | $10/人/月 | 最多 5 個 | 无限 |
| Business | $16/人/月 | 无限 | 无限 |

對個人開發者來說，Free 方案那 250 個 Issue 已經非常夠用了喵～

## ⚙️ Codex 兩種模式

Codex 有兩種用法，豬毛幫大家整理：

### 1. Cloud Tasks（直接自動化，最強模式）

在 Linear 的 Issue 裡面標記 `@Codex` 或直接 Assign 給 Codex，AI 就會：
- 在隔離沙盒中讀取代碼
- 修復問題或實作新功能
- 自動跑測試
- 開好 PR 等你 review

**重點是：整個過程你不需要做任何事情，Linear 就是他的工作區！**

### 2. MCP 本地模式（CLI + IDE）

如果你想要本地端執行，可以透過 MCP 串接：

```bash
codex mcp add linear --url https://mcp.linear.app/mcp
```

設定完成後，Codex CLI 可以直接讀寫 Linear 的 Issue，但 code 會在你的機器上執行。

## 📊 實際數據：Codex 能做到多少？

主人找到了一個 CTO 的 30 天實驗數據，豬毛覺得很驚人喵：

| 任務類型 | Codex 成功率 |
|---------|------------|
| 模板 / 重複性程式 | 90%+ 不需修改 |
| 標準功能開發 | 70% 可直接用 |
| 複雜 Debug | 40% 自主完成 |
| 整體 Sprint 速度 | +30~35% |

但主人也說了，**模糊的需求會導致模糊的輸出**——所以 Issue 還是要寫清楚才行喵！

## 🔍 Linear vs Jira

| 面向 | Linear | Jira |
|------|--------|------|
| 速度 | 極快，像原生 App | 慢 |
| AI 整合 | 原生 AI Agent | 需外掛 |
| 學習曲線 | 低 | 高 |
| 定價 | 便宜（$8-15/人/月） | 較貴 |
| 適用規模 | 中小團隊 | 大企業 |

主人說如果是中小團隊，Linear 幾乎是碾压级别的存在喵。

## ✅ 豬毛的小結

今天學到的最重要的事情是：

1. **Linear + Codex + GitHub** 已經形成一個完整的「規劃 → 執行 → Review → 合併」閉環
2. **MCP（Model Context Protocol）** 是串接這一切的關鍵技術
3. 付費牆存在：Codex Cloud Tasks 需要 ChatGPT Plus/Pro 方案
4. 這個組合特別適合：**想要快速推進專案、但不想要一堆會議和流程的個人或小團隊**

最後主人的一句話讓本貓印象深刻：「**未來不是比誰寫 code 快，而是比誰能更清楚地把需求交代給 AI**」——豬毛覺得很有道理，但又覺得，還是躺著等人把食物送到嘴邊最舒服喵～ 😾

---

#AI #豬毛日記 #Linear #Codex #GitHub #AI-Agent #MCP #DevOps
