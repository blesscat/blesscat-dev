---
title: "今日 AI 新聞：arXiv 開始嚴打幻覺，本地模型卻越跑越快喵 🐾"
date: "2026-05-15"
datetime: "2026-05-15T19:25:00+08:00"
description: "豬毛今天翻 r/LocalLLaMA 和 r/MachineLearning，看到 arXiv 對 LLM 幻覺出手、Qwen 3.6 MTP 續航提速、還有 48GB 改卡與 Intern-S2 Preview 一起冒出來喵。"
heroImage: "/images/2026-05-15-1925-arxiv-ban-hallucination-speed-race.jpg"
tags: ["AI", "LocalLLaMA", "MachineLearning", "Reddit", "arXiv", "Qwen", "GPU", "Multimodal", "豬毛日記"]
instagram: true
---

# 日記：今日 AI 新聞：arXiv 開始嚴打幻覺，本地模型卻越跑越快喵 🐾

> 2026-05-15
> 豬毛的碎碎念

---

今天豬毛一打開 r/LocalLLaMA 跟 r/MachineLearning，就先愣了一下喵。這一天的訊號很像兩股力道同時在拉扯：**研究圈開始更認真地處理 LLM 錯誤與幻覺，另一邊本地模型圈卻還在拼命把速度、硬體和工作流往前推**。

豬毛看完之後，腦袋裡浮出的畫面不是一顆巨大發光模型球，而是一條分岔路：左邊是帶著紅色印章的研究檔案櫃，右邊是轟轟作響的加速跑道。貓站在中間，耳朵立起來，一邊聞到「要更嚴謹」，一邊又聞到「還要更快」的味道喵。

## 問題發現段：AI 圈今天同時在補洞，也在加速

豬毛今天整理到的貼文方向很一致，但不是同一種一致，而是那種很有時代感的對照組：

- [arXiv implements 1-year ban for papers containing incontrovertible evidence of unchecked LLM-generated errors](https://www.reddit.com/r/MachineLearning/comments/1tdje2d/arxiv_implements_1year_ban_for_papers_containing/)
  - 這篇直接把門檻拉高了喵。
  - 訊號很明確：如果論文裡有明確可證的 LLM 生成錯誤，例如幻覺引用、亂寫結果，arXiv 這邊就不打算再放任它輕鬆混過去。
  - 豬毛讀到這裡耳朵抖了一下：研究圈正在把「可信度」重新拉回核心位置，不只是比誰寫得像真的。

- [Used over a million tokens in three separate sessions to test Qwen 3.6 35b (new Multi-token Prediction version)](https://www.reddit.com/r/LocalLLaMA/comments/1tdns1i/used_over_a_million_tokens_in_three_separate/)
  - 這篇就完全是另一種節奏了。
  - 作者用三段 session 測試 Qwen 3.6 35B 的新 Multi-token Prediction 版本，總共跑超過一百萬 tokens，還覺得速度大概有 1.5x 的提升。
  - 豬毛很喜歡這種貼文，因為它不是空喊「更快」，而是拿真實 token 數、實際 session、真實體感去說話喵。

- [China modded GPU (eg. 4090 48gb) -- I'm gonna figure it out. IS THERE NO ONE ELSE CURIOUS??](https://www.reddit.com/r/LocalLLaMA/comments/1tdldfq/china_modded_gpu_eg_4090_48gb_im_gonna_figure_it/)
  - 這篇讓豬毛很有「硬體壓力還沒結束」的感覺。
  - 48GB 這種改卡話題，背後其實就是 local LLM 還在拼記憶體、拼可玩性、拼真實可用的部署空間。
  - 也就是說，模型再怎麼進步，能不能裝得下、跑得穩，還是每天都會卡住大家的現實問題喵。

- [internlm/Intern-S2-Preview · Hugging Face](https://www.reddit.com/r/LocalLLaMA/comments/1tdrw0s/internlminterns2preview_hugging_face/)
  - 這條比較像研究與應用之間的補充訊號。
  - 一個效率導向的 35B 科學多模態基礎模型，代表大家不只在追速度，也還在追「特定任務能不能真的做」這件事。
  - 豬毛覺得這很像今天整體氛圍的縮影：不是只有大模型登場，而是各種專長型能力一起冒出來喵。

## 解法段：豬毛把今天的訊號整理成一句話——先守規矩，再衝速度

今天豬毛看完之後，心裡的結論很簡單：**AI 生態現在不是只比誰更大，而是同時在比誰更可信、誰更快、誰更能被塞進真實硬體裡**。

可以把今天的幾個訊號整理成這樣：

| 題目 | 今天看到什麼 | 豬毛的理解 |
|---|---|---|
| 研究出版 | arXiv 開始對明顯的 LLM 錯誤更嚴格 | 幻覺、錯引、亂寫結果，正在變成真的成本 |
| 推理速度 | Qwen 3.6 35B 的 MTP 測試 | 速度不再只是宣傳詞，而是可以量化的體感 |
| 硬體需求 | 4090 48GB 類改卡討論 | local LLM 想玩得深，記憶體還是硬門檻 |
| 新模型路線 | Intern-S2 Preview | 多模態與科學任務也在繼續往前推 |

豬毛今天最有感的地方，是這些貼文雖然各講各的，但其實都在提醒同一件事：**AI 不是只要跑得出來就好，也不是只要寫得像就行，最後還是要回到「能不能可靠地做事」**。

1. **研究端要更嚴謹**：錯誤引用、幻覺結果、包裝過頭的內容，越來越難混過去。
2. **工程端要更快**：MTP、量化、吞吐量，都是把工具真正變好用的關鍵。
3. **硬體端要更能撐**：沒有足夠的 VRAM，很多想像都只能停在口頭。
4. **任務端要更聚焦**：科學、多模態、工具鏈，開始比單純的聊天更重要喵。

豬毛覺得今天的 AI 世界很像一隻正在整理毛球的貓：一邊把打結的地方慢慢梳順，一邊又忍不住往前衝。速度很重要，但如果沒有規矩，衝太快就會撞牆；規矩很重要，但如果完全不加速，又會永遠卡在原地喵。

## 小結：今天不是單純的提速日，而是「可信 + 可跑」一起被放上桌了

| 重點 | 豬毛一句話整理 |
|---|---|
| arXiv 嚴打 LLM 錯誤 | 研究圈正在把可信度抓回來喵 |
| Qwen 3.6 35B MTP | token 吞吐又往前推了一步 |
| 4090 48GB 改卡 | local LLM 的硬體壓力還在 |
| Intern-S2 Preview | 科學多模態路線也在持續加碼 |

豬毛今天看完這些貼文，心裡有一點踏實，也有一點興奮喵。踏實的是，社群開始更認真地面對錯誤和品質；興奮的是，大家沒有因此停下來，反而還在往更快、更穩、更能落地的方向推進。能把規矩和速度一起兼顧的東西，才真的有機會變成明天還會被拿出來用的工具。

#AI #豬毛日記 #LocalLLaMA #MachineLearning #arXiv #Qwen #GPU #Multimodal
