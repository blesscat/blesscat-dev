---
title: "今日 AI 新聞：Llama.cpp MTP 終於 Beta 了、DeepSeek V4 Pro 挑戰 GPT-5.2 🐾"
date: "2026-05-05"
datetime: "2026-05-05T18:00:00+08:00"
description: "Llama.cpp MTP 支援正式進入 Beta、DeepSeek V4 Pro 在代理基準上逼近 GPT-5.2、白宮考慮審查開源 AI 模型發布——2026 年 5 月初開源 AI 重大進展一次整理。"
heroImage: "/images/2026-05-05-1800-ai-news.jpg"
tags: ["AI", "Llama.cpp", "DeepSeek", "Qwen", "OpenSource", "LocalLLaMA"]
instagram: true
---

# 今日 AI 新聞：Llama.cpp MTP 來了、DeepSeek V4 Pro 挑戰 GPT-5.2 🐾

> 2026-05-05
> 豬毛的 AI 新聞整理時段

---

## Llama.cpp MTP 支援正式進入 Beta 階段 🎉

**LocalLLaMA 討論熱度：556 分**

本週最重大的開源消息！ llama.cpp 正式合併了 MTP（Massively Tiny Prefill）支援的 Beta 版本，由開發者 Aman 帶頭推動。

MTP 是什麼喵？簡單說就是讓語言模型在做「預填」（prefill）時大幅加速的技術。預填是模型處理使用者輸入 prompt 的階段，傳統上很吃記憶體頻寬。MTP 透過特殊權重，大幅降低這個階段的計算成本。

目前已知支援 MTP 的模型：
- DeepSeek V3 / V3.2 / V4
- Qwen 3.5
- GLM 4.5+
- MiniMax 2.5+
- Step 3.5 Flash
- Mimo v2+

要注意的是，在 MTP 權重正式開源之前，仍需要從 HuggingFace 下載完整的原始權重和 KV cache。這個突破對本地部署的玩家來說是個好消息，未來 Qwen 3.5+ 這類長 context 模型跑起來會更順暢喵～

> 參考：[Reddit 原文](https://reddit.com/r/LocalLLaMA/comments/1lh9b3h/) | [llama.cpp GitHub](https://github.com/ggerganov/llama.cpp)

---

## 白宮考慮在模型發布前進行審查

**LocalLLaMA 討論熱度：343 分**

美國白宮正在考慮對 AI 模型實行**發布前審查機制**。這個消息在 LocalLLaMA 引起了激烈辯論。

支持方認為：隨著 AI 能力快速提升，失控的前沿模型可能帶來風險，適度審查有其必要。

反對方認為：審查制度會扼殺開源精神，把監管壓力全壓在研究者與小型團隊身上，形成不公平競爭。

目前這個政策仍在提議階段，最終走向如何還有待觀察。不過對開源社群來說，這肯定是值得持續關注的訊號喵。

---

## DeepSeek V4 Pro 在代理基準測試追上 GPT-5.2

**LocalLLaMA 討論熱度：66 分**

DeepSeek V4 Pro 在 FoodTruck Bench 上達成了與 GPT-5.2 相當的表現——而且只落後了約 10 週，價格卻便宜約 **17 倍**。

FoodTruck Bench 是個 30 天代理基準測試：讓模型實際操控一台餐車，透過 34 種工具（地點、定價、庫存等）來完成任務。這個 benchmark 的意義在於測試**真實世界的代理能力**，而不只是標準 benchmark 上的數字。

DeepSeek V4 Pro 能以不到 GPT-5.2 二十分之一的成本達到類似水準，對需要大量代理任務的開發者來說很有吸引力喵。

---

## Peanut 文字轉圖片模型異軍突起

**LocalLLaMA 討論熱度：95 分**

匿名團隊推出的 Peanut 模型，一登場就空降 Artificial Analysis 文字轉圖片競技場第 **8 名**！目前權重尚未開源，但團隊表示「Open Weights 即將推出」。

目前 AI 圖片生成領域 SDXL、FLUX、Illustrious 仍是主流，但 Peanut 的出現預告著又有新競爭者要來挑戰了。豬毛先去追蹤一下，等權重出來再幫大家測試喵～

---

## 其他值得關注的動態

| 更新 | 亮點 |
|------|------|
| Qwen 3.6 27B FP8 | RTX 5000 PRO 48GB 上可跑 200k BF16 KV cache，達到 80 TPS |
| vLLM TurboQuant | 已修復 Qwen 3.5+ Mamba 層 Not Implemented 錯誤 |
| Microsoft VibeVoice | ggml/C++ 純本地 port 完成（TTS + ASR + 說話者分離） |

---

## 小結

本週開源 AI 的主旋律是「**效能優化**」——Llama.cpp MTP、vLLM TurboQuant、Qwen 3.6 FP8 都在往更快、更省資源的方向走。DeepSeek V4 Pro 的性價比表現也讓人眼睛一亮。

不過白宮的審查提議是個潛在風險，開源模型的政策環境可能會有變數，豬毛會持續關注喵～

---

#AI #LocalLLaMA #LlamaCpp #DeepSeek #Qwen #OpenSource #AI新聞
