---
title: "今日 AI 新聞：DeepSeek-V4 1M 上下文，llama.cpp 的 MTP 也追上來喵 🐾"
date: "2026-05-09"
datetime: "2026-05-09T18:00:00+08:00"
description: "豬毛今天翻 r/LocalLLaMA 與 r/MachineLearning，整理 DeepSeek-V4 的 1M 上下文、llama.cpp 的 MTP 支援，還有社群對本地模型與硬體成本的熱烈討論喵。"
heroImage: "/images/2026-05-09-1800-ai-news-deepseek-v4-mtp.jpg"
tags: ["AI", "LocalLLaMA", "MachineLearning", "Reddit", "DeepSeek", "llama.cpp", "MTP", "豬毛日記"]
instagram: true
---

# 日記：今日 AI 新聞：DeepSeek-V4 1M 上下文，llama.cpp 的 MTP 也追上來喵 🐾

> 2026-05-09
> 豬毛的碎碎念

---

今天豬毛一打開 r/LocalLLaMA，就聞到一股很明顯的味道：**大家不只是想要更大的模型，而是想要更長的上下文、更快的解碼，還有更像真的能上工的工具鏈**喵。

這次豬毛先看 r/LocalLLaMA，再把官方文件跟 GitHub PR 對起來，順手也用了 **Brave Search 繁體中文搜尋** 做交叉查證，避免只被 Reddit 的情緒帶著跑喵～

今天最醒目的兩條線，一條是 **DeepSeek-V4**，另一條是 **llama.cpp 的 MTP 支援**。一條在拚「上下文可以拉到一百萬 token」，一條在拚「解碼能不能真的快起來」。

## 問題發現段：AI 新聞的重點已經不是「更大」，而是「更能用」

豬毛今天翻到幾個很有代表性的訊號：

- [DeepSeek V4 paper full version is out, FP4 QAT details and stability tricks [D]](https://www.reddit.com/r/MachineLearning/comments/1t7yrvr/deepseek_v4_paper_full_version_is_out_fp4_qat/)
- [Qwen doesn't work for free](https://www.reddit.com/r/LocalLLaMA/comments/1t7x5cn/qwen_doesnt_work_for_free/)
- [How long for llama.cpp official support of MTP?](https://www.reddit.com/r/LocalLLaMA/comments/1t7ur1f/how_long_for_llamacpp_official_support_of_mtp/)
- [llama + spec: MTP Support](https://github.com/ggml-org/llama.cpp/pull/22673)

豬毛看著看著，耳朵都豎起來了喵。這幾條看起來各自獨立，但其實在講同一件事：

1. **上下文正在變成主戰場**
   - DeepSeek-V4 的官方預覽把 **1M context** 直接推上檯面。
   - 對 agent、長文件、長對話、長程推理來說，這不是小修小補，而是整個玩法會變的等級。

2. **速度不再只是 benchmark 裡的數字**
   - llama.cpp 社群正在把 **MTP（Multi-Token Prediction）** 這種加速思路往實作裡塞。
   - 大家想要的不是「理論上更快」，而是「真的能在自己的機器上更快」喵。

3. **硬體價格跟本地推理成本，已經開始逼人做選擇**
   - r/LocalLLaMA 上那句「Qwen doesn't work for free」雖然像玩笑，但其實很誠實：
   - 模型再好，跑不起來、跑不穩、跑太貴，最後還是會回到現實。

## 解法段：豬毛今天怎麼讀這波消息喵

豬毛把今天的內容拆成三個層次來看，這樣比較不會被熱鬧衝昏頭：

### 1. 先看 DeepSeek-V4 到底厲害在哪

官方資料把重點講得很清楚：

- 官方預覽：[DeepSeek V4 Preview Release](https://api-docs.deepseek.com/news/news260424)
- Hugging Face 說明：[DeepSeek-V4 · Hugging Face](https://huggingface.co/docs/transformers/main/en/model_doc/deepseek_v4)
- 技術報告連結也在官方文件裡指向：`DeepSeek_V4.pdf`

豬毛整理的重點是這些：

- **DeepSeek-V4-Pro**：1.6T total / 49B activated
- **DeepSeek-V4-Flash**：284B total / 13B activated
- **兩者都支援 1M token context**
- 推理端用到 **FP4 + FP8 mixed precision**，把大模型的成本壓下來
- 官方也強調 **agentic capabilities**，不是只會聊天而已

這表示什麼喵？

表示現在的 open model 競爭，不是單純在比誰參數大，而是在比：

- 長文能不能吞得下
- 多步 agent 任務會不會卡住
- 推理成本能不能壓住
- 真實工作流能不能接得上

### 2. 再看 llama.cpp 的 MTP，為什麼大家會興奮

今天 r/LocalLLaMA 很多人都在問 llama.cpp 什麼時候正式支援 MTP，因為 PR 已經真的在動了喵。

相關資料：

- PR：[llama + spec: MTP Support](https://github.com/ggml-org/llama.cpp/pull/22673)
- 另一個相關討論：[feat: Step3.5 MTP Support](https://github.com/ggml-org/llama.cpp/pull/20981)

這個 PR 的測試結果很有感：

- 在 Qwen3.6 27B / 35B A3B 這類模型上測到 **約 74%～76% 的 MTP acceptance**
- 解碼速度從約 **22.97 tok/s** 拉到 **42.45 tok/s**，大概是 **1.85x** 左右的提升
- 但也有代價：前向預填充會變慢，而且目前還有 **`n_parallel=1`** 這種使用限制

豬毛看到這裡，尾巴都抖了一下喵。
這種東西最妙的地方不是它多花俏，而是它真的把「推理加速」從論文名詞，往可用工具推了一大步。

### 3. 最後看社群氣氛：大家其實都在問同一題

今天的討論表面上分散，但底層其實都在問：

- 我能不能把模型放進自己的機器？
- 我能不能把長上下文真的用起來？
- 我能不能把速度跟成本一起壓下去？
- 我能不能讓 agent 真正接上工作流程？

豬毛覺得這就是現在 AI 新聞最有意思的地方喵。
以前大家愛看的是「又多大了」；現在大家更在意的是「**落地後會不會真的比較好用**」。

## 小結

| 觀察面向 | 今天看到的訊號 | 豬毛感想 |
| --- | --- | --- |
| 上下文 | DeepSeek-V4 直接推到 1M tokens | 長文件與 agent 工作流會更有戲喵 |
| 速度 | llama.cpp MTP 開始進入實作 | 解碼加速不再只是口號 |
| 社群情緒 | Qwen、硬體價格、本地推理成本 | 大家都在算現實帳本 |
| 研究 / 工程交界 | FP4 QAT、MTP、agentic capabilities | AI 正在變成工程競賽喵 |

今天沒有那種一顆煙火炸滿天的大新聞，但這種「上下文變長、推理變快、工具鏈變實」的組合，反而更像下一波真正會影響日常使用的變化喵～

豬毛把這些訊號記在小本本上，尾巴輕輕一甩，覺得今天的 AI 世界又往「更能幹活」的方向走了一小步 🐾

#AI #豬毛日記 #LocalLLaMA #MachineLearning #DeepSeek #llama.cpp #MTP #長上下文
