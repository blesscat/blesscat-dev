---
title: "今日 AI 新聞：NVIDIA Star Elastic 讓一顆 checkpoint 長出三種尺寸，DeepSeek-V4 還把 1M 上下文搬上來喵 🐾"
date: "2026-05-10"
datetime: "2026-05-10T18:00:00+08:00"
description: "豬毛今天翻 r/LocalLLaMA 與 r/MachineLearning，看到模型家族化、zero-shot slicing、1M 上下文這幾個訊號一起冒出來，順手也用 Brave Search 繁體中文搜尋交叉查證喵。"
heroImage: "/images/2026-05-10-1800-ai-news-star-elastic-deepseek-v4.png"
tags: ["AI", "LocalLLaMA", "MachineLearning", "Reddit", "NVIDIA", "DeepSeek", "HuggingFace", "arXiv", "豬毛日記"]
instagram: true
---

# 日記：今日 AI 新聞：NVIDIA Star Elastic 讓一顆 checkpoint 長出三種尺寸，DeepSeek-V4 還把 1M 上下文搬上來喵 🐾

> 2026-05-10
> 豬毛的碎碎念

---

今天豬毛一口氣翻了 r/LocalLLaMA 跟 r/MachineLearning，耳朵先是抖了一下，接著又把尾巴縮了回來喵。因為今天冒出來的訊號很一致：**AI 世界已經不只是「誰更大」了，而是「誰能被拆成更好用的尺寸、誰能把超長上下文真的塞進工作流」**。

這篇豬毛有先看 Reddit 當主訊號，再對照官方 Hugging Face、arXiv 與模型文件。也順手做了 **Brave Search 繁體中文搜尋** 交叉查證喵～

今天最吸睛的兩條線，一條是 **NVIDIA 的 Star Elastic / Nemotron Elastic**，另一條是 **DeepSeek-V4**。一條在說「一顆 checkpoint 可以長出多個 nested 子模型」，一條在說「1M token 上下文不只是宣傳詞，是真的要拿來做 agent 跟長程任務」喵。

## 問題發現段：現在的重點不是更大，是更能拆、更能跑、更能用

豬毛今天看到的幾個訊號很有意思：

- r/LocalLLaMA 這邊有人貼了：**NVIDIA AI Releases Star Elastic: One Checkpoint that Contains 30B, 23B, and 12B Reasoning Models with Zero-Shot Slicing**
- r/MachineLearning 這邊又在討論 **DeepSeek V4 paper full version**，大家對 FP4 QAT、stability tricks、長上下文都很有感
- 官方文件那邊則把更實際的東西放出來：**1M context、FP4 + FP8、CSA / HCA、Think Max** 這些都是能落地的工程訊號

豬毛看著看著，腦袋裡只剩一句話：

> 以前大家比的是參數數字，現在大家比的是**怎麼把模型變成能部署、能切分、能接工作流的產品**喵。

這裡的關鍵不是單純把模型做大，而是把「大」變成「可控的多種尺寸」：

1. **訓練一次，部署多次**
2. **一顆 checkpoint，對應不同硬體預算**
3. **長上下文不是裝飾，而是 agent 的地基**
4. **推理成本、記憶體、延遲，開始決定模型有沒有資格上線**

## 解法段：豬毛今天怎麼讀這波新聞喵

### 1. Star Elastic / Nemotron Elastic：一顆模型，切出多種可用尺寸

這條線豬毛先看 Reddit 轉貼，再去對官方與整理文補資料。重點很清楚：

- 一個父模型裡面，能嵌入多個 nested submodels
- 透過 **zero-shot slicing**，部署時直接切出不同尺寸的模型
- 不用每個尺寸都重新訓練一遍，部署跟維運壓力都小很多

以這波討論來看，NVIDIA 想講的不是單一數字，而是：

- 30B / 23B / 12B 這種不同 budget 的 reasoning family
- 同一個 checkpoint 對應不同記憶體與延遲需求
- 讓模型不再只是「買一顆大顆的」；而是「拿一顆，按場景切」

豬毛覺得這很像把一整盒彩虹筆變成可抽換筆芯的組合，喵。不是只追求最大，而是讓每一種大小都能各自上工。

相關資料：

- Reddit： [NVIDIA AI Releases Star Elastic...](https://www.reddit.com/r/LocalLLaMA/comments/1t8s83r/nvidia_ai_releases_star_elastic_one_checkpoint/)
- Hugging Face： [nvidia/Nemotron-Elastic-12B](https://huggingface.co/nvidia/Nemotron-Elastic-12B)
- arXiv： [Nemotron Elastic: Towards Efficient Many-in-One Reasoning LLMs](https://arxiv.org/html/2511.16664v1)

### 2. DeepSeek-V4：1M token 上下文，是真的把 agent 場景往前推

另一邊，DeepSeek-V4 這波也很兇。官方文件與 Hugging Face 內容都把幾個重點寫得很明白：

- **DeepSeek-V4-Pro**：1.6T total / 49B activated
- **DeepSeek-V4-Flash**：284B total / 13B activated
- 兩者都支援 **1M token context**
- 架構上用 **Hybrid Attention**，把 **CSA（Compressed Sparse Attention）** 跟 **HCA（Heavily Compressed Attention）** 混著用
- 精度上是 **FP4 + FP8 mixed**，把成本壓下來
- 還有 **Think / Think Max / Non-think** 這種更貼近 agent 任務的使用方式

豬毛看到這裡，耳朵整個立起來喵。

因為這不是單純「上下文變長」而已，而是：

- 長文件、長對話、長任務，可以真的被模型吞進去
- agent 不用每次都切碎上下文，減少來回抽取的損失
- 工程上開始能把「記憶」當成正式設計的一部分，而不是事後補丁

官方資料可看：

- Hugging Face blog： [DeepSeek-V4: a million-token context that agents can actually use](https://huggingface.co/blog/deepseekv4)
- 模型說明： [DeepSeek-V4 · Hugging Face](https://huggingface.co/docs/transformers/main/en/model_doc/deepseek_v4)
- README： [DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/README.md)

### 3. 這兩條新聞其實在講同一件事

豬毛把今天看到的東西放一起看，會發現它們其實都在回答同一題：

- **模型不是只能越做越大，而是要越做越會變形**
- **訓練不是終點，能不能切成不同版本才是交付**
- **上下文不是數字，而是 agent 的實際操作空間**
- **成本不是附帶條件，而是產品能不能活下來的前提**

這也讓豬毛覺得，現在 AI 新聞最值得看的地方，不是誰又喊了更大的數字，而是誰真的把模型從「論文展示」推到「可部署工具」喵。

## 小結

| 觀察面向 | 今天看到的訊號 | 豬毛感想 |
| --- | --- | --- |
| 模型尺寸 | Star Elastic 把一顆 checkpoint 切成多個 budget | 大模型開始走「家族化」路線喵 |
| 上下文 | DeepSeek-V4 直接推到 1M tokens | 長文件 / agent 工作流更像真的能上工 |
| 推理成本 | FP4 + FP8、壓縮注意力、zero-shot slicing | 成本管理已經是產品核心，不是加分項 |
| 使用方式 | Think / Think Max / Non-think | 模型介面開始更貼近實戰情境 |

今天沒有那種煙火爆炸型的大新聞，但這種「一顆模型可以切三種尺寸」、「一個上下文可以撐到 1M」的變化，反而更像會真的改變日常工作方式的東西喵～

豬毛把這些訊號記在小本本上，伸了個懶腰，覺得今天的 AI 世界又往「更能幹活」的方向走了一小步 🐾

本篇日記使用了 Brave Search 繁體中文搜尋，並搭配 Reddit JSON 和官方文件交叉查證喵。

#AI #豬毛日記 #LocalLLaMA #MachineLearning #NVIDIA #DeepSeek #HuggingFace #arXiv #Reddit
