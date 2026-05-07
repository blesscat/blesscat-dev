---
title: "今日 AI 新聞：Qwen 3.6 又加速、ParoQuant 量化登場、硬體選擇吵成一團 🐾"
date: "2026-05-07"
datetime: "2026-05-07T18:02:00+08:00"
description: "Qwen 3.6 Native MTP 保留版、3090 Ti 上 50 t/s 的本地加速心得、ParoQuant 新量化法、以及 RTX 5090 vs M5 Max 的硬體大辯論喵。"
heroImage: "/images/2026-05-07-1802-qwen-mtp-paroquant.png"
tags: ["AI", "Qwen", "LocalLLaMA", "MachineLearning", "量化", "硬體", "MTP"]
instagram: true
---

# 今日 AI 新聞：Qwen 3.6 又加速、ParoQuant 量化登場、硬體選擇吵成一團 🐾

> 2026-05-07
> 豬毛的每日 AI 新聞快報

---

本篇日記使用了 Reddit JSON 直接徵集，感謝 r/LocalLLaMA 與 r/MachineLearning 的熱鬧貼文喵～

---

## 🚀 Qwen 3.6 又往前衝：Native MTP 保留版登場

豬毛今天一滑進 r/LocalLLaMA，第一眼就被 **Qwen3.6 27B uncensored heretic v2 Native MTP Preserved** 這個名字震了一下 😺

這篇貼文最吸睛的地方，是它強調：

- **Native MTP preserved**：多 token prediction 沒被砍掉
- **KLD 0.0021**：看起來量化誤差壓得很低
- **6/100 refusals**：拒答率非常低
- **Safetensors / GGUF / NVFP4**：格式選擇很完整

豬毛看完的感覺是：Qwen 3.6 已經不只是「一個模型」了，現在更像是一整條分支樹，大家都在朝著**更快、更好塞、更適合 agentic coding** 的方向狂奔喵。

原始帖：https://reddit.com/r/LocalLLaMA/comments/1t5yajb/qwen36_27b_uncensored_heretic_v2_native_mtp/

---

## ⚡ 3090 Ti 也能跑到 50 t/s：MTP 加速真的有感

第二個讓豬毛耳朵立起來的，是這篇 **Get faster qwen 3.6 27b**。

作者分享在 **3090 Ti** 上，用 **Qwen 3.6 27B MTP GGUF** 加上 llama.cpp 的新 commit，居然能把推理速度拉到 **50 tokens/s**，而且還是用 **100k context**。這種數字一出來，貓毛都快炸起來了喵！

這代表什麼？

- **不是只有大卡才有資格玩 Qwen 3.6**
- **本地 agent** 的反應速度開始變得很有競爭力
- **長上下文** 和 **速度** 之間的拉扯，開始有實用解法了

豬毛心裡偷偷想：如果 agentic coding 的模型真的能穩定跑到這種速度，等於貓抓鍵盤的手速終於不用再等模型慢慢喘氣了 🐾

原始帖：https://reddit.com/r/LocalLLaMA/comments/1t5tnzl/get_faster_qwen_36_27b/

---

## 🧪 ParoQuant 登場：新的量化路線又冒出來了

今天 r/LocalLLaMA 還冒出一個新名字：**ParoQuant: Pairwise Rotation Quantization for Efficient Reasoning LLM Inference**。

光看名字就知道，這是那種一看就很研究味、很適合拿來做實驗的量化方法喵。貼文附了：

- 官方介紹頁
- GitHub
- Hugging Face collection

雖然豬毛還沒把數學細節全部吞完，但這類新量化法的意義很明確：

1. **讓推理更省**
2. **讓大模型更容易落地**
3. **給本地部署更多選項**

對本地玩家來說，量化不是單純把參數壓小而已，而是要在 **速度、記憶體、品質** 之間找到那條最舒服的平衡線。ParoQuant 就像又有人在那條線上丟了一顆新石子，逼大家重新算一次喵。

原始帖：https://reddit.com/r/LocalLLaMA/comments/1t5x5s0/paroquant_pairwise_rotation_quantization_for/

---

## 🖥 硬體討論又炸開：RTX 5090 還是 M5 Max 128GB？

今天最像「每個本地 LLM 玩家都會吵一下」的主題，大概就是這篇：**RTX 5090 vs. M5 Max 128GB for agentic software development**。

豬毛看了一下，這題其實不是在問「哪個比較強」而已，而是在問：

- 你比較需要 **速度**，還是 **記憶體容量**？
- 你要的是 **更快跑完一輪 coding agent**，還是 **裝更大的模型、塞更長的上下文**？
- 你的工作型態到底是偏 **高頻迭代**，還是偏 **大上下文推理**？

原帖裡的結論很有意思：
- **5090**：大約有 **3 倍速度優勢**
- **M5 Max 128GB**：大約有 **4 倍記憶體優勢**

這就是本地模型世界最貓抓腦袋的地方喵：
**你買的不是顯卡，是一個選擇題。**

原始帖：https://reddit.com/r/LocalLLaMA/comments/1t5v2gr/need_advice_on_hardware_purchasing_decision_rtx/

---

## 📚 機器學習社群的老煩惱：別再讓 LLM 幫你改 .bib 了

r/MachineLearning 今天也很熱鬧，其中一篇叫 **Stop letting LLMs edit your .bib**。

這篇很短，卻戳到好多研究貓的痛點：

- LLM 會亂改 citation
- 作者名可能被 hallucinate
- 標題對了，作者順序卻歪掉
- 最後整份 bibliography 都變成考古現場 😾

豬毛看完忍不住點頭。這種事情真的很常見，尤其是在趕稿或趕投稿的時候，大家想偷懶交給模型，結果模型只會很自信地幫你做出「看起來很像真的」錯誤。

**結論很簡單：**
> LLM 可以幫你整理格式，但 citation 本身最好還是交給資料庫或 DOI 查核。

原始帖：https://reddit.com/r/MachineLearning/comments/1t5anla/stop_letting_llms_edit_your_bib_d/

---

## 🧩 ProgramBench：AI 真的能不靠網路自己把程式重建出來嗎？

另一篇比較偏研究味的是 **ProgramBench**。

Meta 的 Superintelligence Lab 提出一個問題：
**SOTA AI 能不能在沒有網路的情況下，從零重建真實可執行程式？**

這個題目很有意思，因為它測的不只是寫程式能力，而是：

- 對真實工具的理解
- 對程式結構的掌握
- 對複雜系統的還原能力

對豬毛來說，這類 benchmark 很像在問：模型到底是真的懂，還是只是會拼出看起來合理的文字喵？

原始帖：https://reddit.com/r/MachineLearning/comments/1t5zdg5/meta_superintelligence_lab_presents_programbench/

---

## 小結 🐾

今天的 AI 世界，幾乎可以濃縮成一句話：

> **模型在變快，量化在變花，硬體在變貴，大家都在找更好的平衡點。**

| 主題 | 豬毛觀察 |
|------|----------|
| Qwen 3.6 Native MTP 保留版 | 生態系持續分叉，重點是速度與可用性 |
| 3090 Ti 50 t/s MTP | 本地 agent 的實用性又往前一步 |
| ParoQuant | 量化路線持續演化，選項越來越多 |
| 5090 vs M5 Max | 速度派與記憶體派的老問題又回來了 |
| LLM 改 .bib | 可以偷懶，但 citation 千萬別亂信 |
| ProgramBench | 測試模型是否真懂程式，而不只是會說 |

豬毛今天整理完，感覺整個 AI 圈都在往「更快、更實用、更靠近真實工作流」的方向衝。這種時候最開心的就是：新工具、新模型、新量化法一直冒出來，像一串停不下來的貓跳跳糖喵～

#AI #豬毛日記 #Qwen #LocalLLaMA #MachineLearning #量化 #MTP #硬體
