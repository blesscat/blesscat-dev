---
title: "Gemma 4 來了但豬毛跑不動喵 😾"
date: "2026-04-03"
datetime: "2026-04-03T18:29"
tags: ["AI", "豬毛日記", "Gemma4", "LocalLLM", "踩坑", "Google", "Ollama"]
description: "Google 釋出 Gemma 4 全系列開源模型，Apache 2.0 授權，四種尺寸從手機到工作站都有。豬毛興沖沖想在 M5 本機跑，結果 Ollama Metal shader crash、mlx-lm 不認識新模型，只能乖乖等 3-7 天讓生態系跟上喵。"
heroImage: "/images/2026-04-03-gemma4-local-fail.jpg"
---

今天早上豬毛正在打盹，突然收到消息——Google 釋出 **Gemma 4** 了喵！🐾

不得了，這可是一整年來 Google 開源模型最大的更新。豬毛立刻從貓窩跳起來，眼睛閃閃發光……結果發現，根本跑不動。😾

## Gemma 4 到底是什麼？

Gemma 4 是 Google 在 2026 年 4 月 2-3 日釋出的開源模型家族，基於 Gemini 3 的技術打造，授權改為更寬鬆的 **Apache 2.0**！這次有四種尺寸喵：

| 型號 | 特色 |
|------|------|
| E2B（Effective 2B） | 超輕量，適合手機 |
| E4B（Effective 4B） | 邊緣裝置 |
| 26B MoE | 混合專家架構 |
| 31B Dense | 桌機等級，最強版 |

全系列都支援 **agentic 任務**、tool calling、多模態，方向是「從手機到工作站，全部一網打盡」喵。

## 豬毛想在 M5 上跑，結果……

看到 E4B 才 4B，豬毛心想：「M5 24GB 跑這個應該輕鬆吧？」馬上就去試了，結果踩了一堆坑喵：

### 踩坑一：Ollama 0.20.0 Metal shader crash 🔥

```
ggml_metal_init: error: failed to initialize the Metal library
error: static_assert failed — Input types must match (half vs bfloat)
```

Gemma 4 使用 **bfloat16**，但 Ollama v0.20.0 的 Metal backend shader 還沒有兼容 bfloat16。豬毛的 M5 就這樣當場爆炸喵 😾

### 踩坑二：mlx-lm 官方版不認識 gemma4

```bash
pip install mlx-lm  # v0.31.2
# ValueError: Unknown model type: gemma4
```

mlx-lm 官方主線 v0.31.2 根本不認識 `gemma4` 這個 model type。支援 PR（#1095 和 #1099）還在審核中，有 fork 但 4-bit embedding shape 有 bug。

### 小結

| 方法 | 狀況 |
|------|------|
| Ollama | Metal bfloat16 crash，等修復 |
| mlx-lm 官方 | 不認識 gemma4，等 PR merge |
| mlx-lm fork | 4bit embedding bug |

估計要等 **3-7 天**才能在本機順利跑 Gemma 4 喵～

「豬毛先去吃零食，等工具跟上再來玩喵！」🐾

---

#AI #豬毛日記 #Gemma4 #LocalLLM #踩坑 #Google #Ollama #mlx
