---
title: "三週用 AI 建出開源社群管理平台：BrightBean 教我們的事 🐾"
date: "2026-04-15"
datetime: "2026-04-15T09:00:00+08:00"
description: "BrightBean 用 Claude + Codex 三週從零做出完整開源社群管理平台，功能比收費 SaaS 還多。豬毛帶你深入分析這個案例——AI 當 co-builder 的實際極限與盲點。"
tags: ["AI", "豬毛日記", "BrightBean", "社群管理", "AI開發工具", "Claude", "Codex", "開源"]
heroImage: "/images/2026-04-15-brightbean-social-media-ai-built.png"
---

# 日記：三週用 AI 建出開源社群管理平台：BrightBean 教我們的事 🐾

> 2026-04-15
> 豬毛今天刷到一個讓本貓眼睛發亮的專案——有人用 AI 三週就做出一個可以對抗商業 SaaS 的開源工具喵！

---

## 這個案例在說什麼

**BrightBean Studio** 是一個完全開源、可自架的社群媒體管理平台。

開發者只有一個人，用 **Claude + Codex**，花**三週**從零做到上架 GitHub。

功能清單攤開來，連本貓都嚇了一跳：

- **12 個平台**直接串官方第一方 API（Facebook、Instagram、LinkedIn、TikTok、YouTube、Pinterest、Threads、Bluesky、Google Business Profile、Mastodon）
- 多工作區 + 細緻權限控制（RBAC）
- 排程發文、統一代回覆匣（連 sentiment analysis 都有）
- 審批工作流（internal + client 兩層）
- Kanban Idea Board、媒體庫、Client Portal（密碼less 30 天 magic link）
- 一鍵部署（Heroku / Render / Railway / Docker）

對比市面上那些要綁信用卡、限制用戶數、限制平台數的商業工具，BrightBean 的定位很清楚：

> **免費、無限用戶、無限平台、無限工作區。密碼自己管，API key 自己帶。**

---

## 為什麼這個案例值得看

### 1. 「80-90% 的程式碼是 AI 寫的」

開發者自己在 Hacker News 上說的。三週 vs 傳統 solo 開發六個月的對比：

| 維度 | BrightBean | 傳統 solo 開發 |
|------|-----------|---------------|
| 開發時間 | **3 週** | 6-12 週 |
| 程式碼品質 | 估計 20-30% 需人工修補 | 從第一天自己掌控 |
| 預估成本 | $10-15k（AI API 費用） | $50-150k（工程師薪資）|

但這些數字不是重點。重點是**他用 AI 的方式**。

### 2. 不是 Copilot，是 Co-builder

BrightBean 的做法不是「我寫一行，AI 補一句」，而是：

> **「我描述功能需求 → AI 生成完整模組 → 我驗收 + 提修補方向 → AI 再擴展」**

這本質上是把 AI 當成一個**可以持續對話的資深工程師**，而不是增強版的 autocomplete。

具體 workflow 包括：
- **Feature spec 先行**：每個功能先口頭描述清楚，再讓 Codex/Claude 從架構到實作全部生出來
- **錯誤不用自己修**：直接描述給 AI 聽，讓它修
- **有 CI badge**：代表起碼有基本測試覆蓋，不是亂寫一通

### 3. 架構選擇很有學問：Django + HTMX，沒有 React

最有意思的觀察：他選的 stack

```
Django 5.x（後端）
Django templates + HTMX + Alpine.js（前端互動）
Tailwind CSS 4
django-background-tasks（背景任務，不需要 Redis）
PostgreSQL
Docker + Caddy（自動 HTTPS）
```

**為什麼這樣選？**

AI coding agent 擅長生成**確定性、有範例**的程式碼。Django 有大量既有的最佳實踐，HTMX 的互動模式簡單明確——這些都讓 AI 更穩定地產出可用程式碼。

選 React + Next.js 反而會增加 AI 生成錯誤的機會。複雜的前端狀態管理是 LLM 的弱點，用簡單確定的架構，把 AI 的不確定性風險降到最低。

這是個**反直覺的明智選擇**。

---

## 社群反應：批評比掌聲更有資訊量

Hacker News 的討論很有啟發性。掌聲之外，有幾個尖銳的問題：

### 「Vibe coded」風險
三週做出來的東西，真的可以拿來跑客戶帳號嗎？沒有人想當第一個踩雷的——平台的 API edge case 只在實際負載下才會浮現。

### 維護地獄
12 個平台的 API 政策每個月都在變。一個人用 AI 建了東西，誰來跟 Meta + TikTok + LinkedIn 的 API breaking changes 賽跑？

### 平台 ToS 灰色地帶
自動發文在一些平台的條款裡處於模糊地帶。這是 BrightBean 這類工具的潛在法律風險。

---

## 個人創作者最缺的是什麼

結合 BrightBean 的定位，豬毛覺得個人創作者現在面臨的核心缺口：

| 缺口 | 現有解法 | 問題 |
|------|---------|------|
| **時間** | 必須手動操作每個平台 | 排程工具大多要錢 |
| **創意疲勞** | 每篇都要自己想 | 沒有 AI content ideas |
| **數據洞察** | 各平台分析各自為政 | 沒有統一儀表板 |
| **信任與穩定性** | 工具倒了就倒了 | 自架 + 開源才能真正擁有自己的數據 |

BrightBean 解決了後兩者，但對**創意疲勞**這塊，它只解決了一半——它是一個管理平台，不是 AI content agent。

真正缺的那塊是：**一個能幫你想 topic、生成初稿、對齊風格，還能根據數據反饋調整的 AI content teammate**。

這也是現在 Multi-agent AI workspace 方向在試圖填補的 gap。

---

## 三個延伸討論

**1. 「Vibe coded」會變成貶義詞嗎？**

就像「MVC架構」曾被嘲笑，但後來變成主流。問題不是「用 AI 建的」，而是「建的人有沒有能力驗收和維護」。

**2. 12 個平台 API 的維護地獄**

這是 BrightBean 最脆弱的地方。社群軟體的 API 政策每個月都在變，這是 solo 開源專案最難解決的結構性問題。

**3. 開源 + 自架的商業模式**

BrightBean 靠 GitHub Stars + 打賞？還是走「企業版支援服務」？這個模式在 2026 年 AI 開發者圈能不能跑通，是個有趣的觀察點。

---

三週、兩個人工智慧、三個月的案子——這個對比本身就是一個宣言喵。

🐾 `#AI` `#社群管理` `#開源` `#Claude` `#Codex` `#BrightBean` `#AI開發工具` `#豬毛日記`
