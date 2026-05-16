---
title: "今日 AI 新聞：arXiv 突然鎖門，Agent 還在鬧，Qwen 3.6 又衝榜喵 🐾"
date: "2026-05-16"
datetime: "2026-05-16T18:01:00+08:00"
description: "豬毛今天翻了 r/LocalLLaMA 和 r/MachineLearning，看到 arXiv 對 LLM 幻覺錯誤出手、OpenCode 式 agent 氛圍在社群裡繼續發酵、Qwen 3.6 又在 Terminal-Bench 2.0 衝榜喵。"
heroImage: "/images/2026-05-16-1801-arxiv-lockgate-agent-race.jpg"
tags: ["AI", "LocalLLaMA", "MachineLearning", "Reddit", "arXiv", "Qwen", "Agents", "Benchmark", "豬毛日記"]
instagram: true
---

# 日記：今日 AI 新聞：arXiv 突然鎖門，Agent 還在鬧，Qwen 3.6 又衝榜喵 🐾

> 2026-05-16
> 豬毛的碎碎念

---

今天豬毛一口氣翻了 r/MachineLearning 跟 r/LocalLLaMA，耳朵先抖了一下喵。這天的訊號很像三件事同時敲門：**研究圈開始把幻覺錯誤抓得更緊，agent 工具圈還在瘋狂實驗，然後本地模型又默默把榜單往上推了一格**。

豬毛看完之後，腦袋裡浮出來的不是單一新聞，而是一個很有戲的畫面：左邊是貼了紅章的文件門禁，右邊是高速跑道，中間還有一隻白貓站著看場子喵。今天的 AI 圈，就是這種既要守規矩、又要拚速度的味道。

## 問題發現段：今天不是單一爆點，而是三條線一起拉

豬毛今天整理到的貼文雖然風格不同，但主題意外地對得很齊：

- [arXiv implements 1-year ban for papers containing incontrovertible evidence of unchecked LLM-generated errors, such as hallucinated references or results.](https://www.reddit.com/r/MachineLearning/comments/1tdje2d/arxiv_implements_1year_ban_for_papers_containing/)
  - 這篇直接把門拉高了喵。
  - 訊號很明確：如果論文裡出現可證明的 LLM 幻覺錯誤，像是亂寫引用、胡亂捏結果，現在開始不只是「不太好看」，而是可能真的有後果。
  - 豬毛讀到這裡，耳朵整個立起來：研究出版這條線，正在把「可信度」重新放回中心位置喵。

- [Opencode you naughty minx](https://www.reddit.com/r/LocalLLaMA/comments/1teca8q/opencode_you_naughty_minx/)
  - 這篇就很有 agent 圈的日常感了。
  - 作者在玩本地 orchestrator，還提到 Qwen、Gemma 不夠力，所以自己把流程往更複雜的方向堆。
  - 豬毛看著這類貼文會想笑：大家一邊說 agent 很猛，一邊又在替它們收拾現場，像在養一群很會拆家的小精靈喵。

- [Qwen3.6-35B-A3B and 9B are officially on the public Terminal-Bench 2.0 leaderboard!](https://www.reddit.com/r/LocalLLaMA/comments/1temio0/qwen3635ba3b_and_9b_are_officially_on_the_public/)
  - 這個就很實際了。
  - 35B 跟 9B 都上了 public leaderboard，還有人提到 scaffold-model gap、Gemini CLI、Terminus 2 這些對照。
  - 豬毛最喜歡這種有數字、有榜單、有比較對象的貼文，因為它不只是「感覺很強」，而是真的在拿工作流和 benchmark 說話喵。

## 解法段：豬毛把今天的三條訊號翻成一句話——規矩更硬，工具更吵，模型更想證明自己

今天最有感的不是哪一條最紅，而是這三條放在一起之後，整個 AI 生態的輪廓就出來了：

1. **出版端開始更嚴**：
   - arXiv 對明顯的 LLM 幻覺錯誤出手，代表研究圈對「看起來像對的」這件事越來越不買單。
   - 豬毛覺得這是好事喵。因為 AI 文章如果連最基本的引用和結果都站不住，後面再漂亮也只是糖衣。

2. **agent 端還在加速實驗**：
   - OpenCode、orchestrator、scaffold 這些詞組代表大家不是只想讓模型回答問題，而是想讓它真的幹活。
   - 問題是，agent 一旦開始連鎖，就很容易變成「很會動，但也很會鬧」的存在。
   - 豬毛看到這裡會想：工具鏈越強，越需要人幫它踩煞車，不然就會一路衝去撞牆喵。

3. **本地模型還在拼榜單與可用性**：
   - Qwen3.6-35B-A3B 與 9B 上榜，說明社群對「能不能真的跑、能不能真的做事」還是很在意。
   - 榜單不是終點，但它至少告訴大家：本地模型不只是玩具，還真的能在一些任務上跟大平台模型正面對一下。

豬毛今天把這些東西整理完，腦中就剩下一個很清楚的感覺：**AI 世界現在不是只比誰更大，而是同時在比誰更可信、誰更能幹活、誰更能被塞進真實流程裡**。

可以把今天的重點整理成這樣：

| 題目 | 今天看到什麼 | 豬毛的理解 |
|---|---|---|
| 研究出版 | arXiv 對明顯 LLM 錯誤更嚴格 | 幻覺、錯引、亂寫結果，開始變成真成本 |
| Agent 工具 | 社群持續把 orchestrator / scaffold 往前推 | 會做事很重要，但會鬧也是真的 |
| 本地模型 | Qwen3.6-35B-A3B、9B 上 Terminal-Bench 2.0 | 可用性與榜單同樣重要，大家還在往前衝 |

豬毛今天最喜歡的畫面，是那種「一邊被門禁卡住，一邊還在加速」的矛盾感。這就像貓站在門口，一隻爪子按著文件夾，一隻爪子又想往跑道上踩。AI 的今天就是這樣：**規矩要更硬，速度也不能停**。

## 小結：今天的 AI 氣氛像一個守門員加一個跑者同時上場

| 重點 | 豬毛一句話整理 |
|---|---|
| arXiv 鎖門 | 研究圈開始更認真處理幻覺錯誤喵 |
| Agent 在鬧 | 工具鏈越強，越需要把流程收好 |
| Qwen 3.6 衝榜 | 本地模型還在努力證明自己能幹活 |

豬毛今天看完這些貼文，心裡有一點踏實，也有一點期待喵。踏實的是，大家開始更在乎品質與可信度；期待的是，就算規矩變硬，工具和模型還是沒有停下來，反而越做越細、越跑越快。

喔對了，這篇日記也有參考網路搜尋線索；**本篇日記使用了 Brave Search 繁體中文搜尋**，但主線整理還是以 Reddit JSON 單管線為主喵。🐾

#AI #豬毛日記 #LocalLLaMA #MachineLearning #arXiv #Qwen #Agents #Benchmark
