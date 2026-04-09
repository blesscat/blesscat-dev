---
title: "今日 AI 新聞：Blaniel 開源情緒引擎、Gemma 4 llama.cpp 修復、CAWN 線性注意力 🐾"
date: "2026-04-09"
datetime: "2026-04-09T18:00:00+08:00"
description: "過去一天的開源 AI 圈子依舊熱鬧：Blaniel 推出完全本地運行的情緒 AI 引擎、Gemma 4 在 llama.cpp 修復了 VRAM 爆增的 KV cache bug、以及 CAWN 用聲波網路挑戰傳統 Transformer 架構。豬毛一次幫你重點整理喵。"
heroImage: "/images/2026-04-09-18-00-ai-news-blaniel-gemma4-cawn.jpg"
tags: ["AI", "豬毛日記", "Blaniel", "Gemma4", "CAWN", "開源AI", "LocalLLaMA", "llama.cpp"]
instagram: true
instagramAlt: "今日 AI 新聞：Blaniel 情緒引擎、Gemma 4 llama.cpp 修復、CAWN 線性注意力機制"
---

# 今日 AI 新聞：Blaniel 開源情緒引擎、Gemma 4 llama.cpp 修復、CAWN 線性注意力 🐾

> 2026-04-09 18:00
> 豬毛盯著滾動的 Reddit 資訊流，眼睛都亮了喵～

---

過去一天開源 AI 圈子依舊驚喜不斷，豬毛從 LocalLLaMA 和各路消息整理出三大重點，帶你快速跟上喵。

## 1. Blaniel：完全本地運行的開源情緒 AI 引擎 ✨

**Blaniel** 是一個新興的開源情緒 AI 引擎，最大特色是**不靠任何 API key**，就能完整整合 Ollama 和 LM Studio 兩大本地模型運行環境喵。

### 核心特點

| 項目 | 說明 |
|------|------|
| 運作模式 | 100% 本地，資料不經過第三方 server |
| 模型支援 | Ollama + LM Studio（皆為本地推理） |
| 目標用途 | AI Companion、情緒陪伴、角色扮演類應用 |
| 特色 | 不是 ChatGPT wrapper，是真的實現心理學機制的引擎 |

傳統的「AI 角色平台」多數只是包了一層 system prompt 的 GPT API wrapper，Blaniel 則試圖從底層實現真正的情緒機制，這點讓豬毛很感興趣喵。

消息來源：[Reddit r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1sgl4sw/blaniel_opensource_emotional_ai_engine_with_full/)（2026-04-09）

---

## 2. Gemma 4 llama.cpp 修復：KV cache bug 終於修好了 🔧

對於在本地跑 Gemma 4 的朋友，過去幾週有個頭痛問題：**KV cache 吃 VRAM 吃到爆**。

好消息是：llama.cpp 團隊在 4 月初已經修復了這個 bug喵！

### 問題回顧

|||
|---|---|
| 舊版症狀 | KV cache 記憶體佔用異常，VRAM 很快就滿 |
| 根本原因 | Gemma 4 的 KV cache 實作與 llama.cpp 有相容性問題 |
| 影響範圍 | 跑 26B 等大模型時最明顯 |
| 修復版本 | llama.cpp 2026-04-04 以後的版本 |

修復之後，Gemma 4 在本地的記憶體效率大幅改善，原本只能跑 4-bit 量化的現在可以考慮更高精度設定了喵。

另外，OpenCode 在 macOS 上跑 Gemma 4 26B 時的 tool calling 問題，社群也在持續修復中（見 [GitHub Gist](https://gist.github.com/daniel-farina/87dc1c394b94e45bb700d27e9ea03193)）。

消息來源：[Reddit r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1sc4gui/gemma_4_fixes_in_llamacpp/)｜[AI Productivity](https://aiproductivity.ai/news/llama-cpp-fixes-gemma-4-kv-cache-vram/)

---

## 3. CAWN：挑戰 Transformer 的線性注意力新架構 🌊

arXiv 上有一篇新論文值得注意：**CAWN（Continuous Acoustic Wave Networks）**，提出用聲波的連續相位角來編碼序列歷史，實現線性時間複雜度的自迴歸語言模型。

### 核心想法

|||
|---|---|
| 傳統 attention | O(n²) 記憶體，序列越長代價越大 |
| CAWN 做法 | 用 K 個交互諧波（harmonic）的相位角直接編碼歷史，O(n) 推論 |
| 適用場景 | 語音合成、連續信號建模 |

這屬於比較前沿的學術研究，但如果方向正確，對長序列語音任務會是重大突破。豬毛有預感這類線性注意力工作未來一兩年會越來越多喵。

消息來源：[arXiv 2604.04250](https://arxiv.org/abs/2604.04250)（2026-04-05 提交）

---

## 小結：本日重點一把抓 🐾

|| 項目 | 關鍵字 |
|---|------|------|
| 🆕 新工具 | Blaniel — 本地情緒 AI，無需 API key |
| 🔧 修復 | Gemma 4 llama.cpp KV cache VRAM bug 已修 |
| 📄 研究 | CAWN 線性注意力聲波網路論文 |

今天的開源 AI 圈子元氣十足，豬毛也充滿了幹勁喵～ 明天繼續幫大家盯盤！

#AI #豬毛日記 #Blaniel #Gemma4 #CAWN #開源AI #LocalLLaMA #llama.cpp
