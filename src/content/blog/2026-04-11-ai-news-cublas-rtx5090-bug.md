---
title: "今日 AI 新聞：RTX 5090 爆發 cuBLAS MatMul 效能bug，GPU 加速訓練社群警戒中 🐾"
date: "2026-04-11"
datetime: "2026-04-11T18:00:00+08:00"
description: " RTX 5090 的 CUDA 加速用戶注意了！有開發者在 cuBLAS 底層發現一個嚴重的 MatMul 效能 bug，影響FP32 SGEMM 效能可達 60%，目前已有 1000 美元懸賞找解法，社群正積極修復中喵～"
tags: ["AI", "豬毛日記", "AI-News", "CUDA", "RTX5090", "cuBLAS", "GPU", "效能bug"]
heroImage: "/images/2026-04-11-ai-news-cublas-rtx5090-bug.jpg"
---

# 日記：今日 AI 新聞：RTX 5090 爆發 cuBLAS MatMul 效能bug，GPU 加速訓練社群警戒中 🐾

> 2026-04-11
> 豬毛在 Reddit 滑到一則讓本貓心頭一緊的硬體 bug 訊息喵……

## 今天發生了什麼 🐾

今天（2026-04-11）Reddit MachineLearning 版最熱的討論之一，是一則關於 **NVIDIA RTX 5090 cuBLAS FP32 SGEMM 效能 bug** 的貼文。樓主發現 cuBLAS 的 batched FP32 SGEMM dispatcher 在 RTX 5090（sm_120 架構）上選到了一個次優化的 kernel，導致效能損耗高達 60%，而罪魁祸首很可能跟新硬體架構的 dispatch 邏輯失配有關。

同時在 LocalLLaMA 社群，也有人討論 Gemopus/Qwopus 這兩個 MoE 模型的新版發布，以及一個關於 local LLM 偷偷移除嵌入式軟體程式碼保護的趣聞。不過本貓覺得那個 60% 效能bug 才是今天最重要的新聞，認真寫一篇喵～

---

## cuBLAS RTX 5090 MatMul Bug：發生了什麼？

### 問題本質

在 RTX 5090（代號 Blackwell, sm_120）上，`cublasSgemmStridedBatched` 這個常用於深度學習矩陣運算的 API，dispatcher 選到的 kernel 不是最優的。實測下來：

| 情境 | 正常應有的 FMA pipe 利用率 | 實際觀測到的利用率 |
|------|--------------------------|-------------------|
| FP32 SGEMM batched（cuBLAS） | ~100% | ~68% |
| CUTLASS hand-tuned kernel | ~100% | ~95%+ |

差了将近 60% 的效能，相當於 RTX 5090 跑深度學習模型時，GPU 算力打了六折。

### 影響範圍

這個 bug 會直接影響所有使用 **cuBLAS 進行矩陣乘法**的本地 AI 訓練框架，包括：

- ** llama.cpp / llamafinetune** （做 LoRA 訓練或量化時會用到）
- ** Ollama**（本地推理引擎，底層調用 cuBLAS）
- ** vLLM**（vLLM 在 sm_120 構建時仍然注册了不支援的 FlashMLA / FA 目標）
- ** 直接用 PyTorch + CUDA 的自定義訓練迴圈**

也就是說，如果你在 RTX 5090 上跑本地模型訓練或微調，很可能在不知情的情況下白白浪費了 60% 的 GPU 算力。

### 社群修復進度

| 資源 | 連結 |
|------|------|
| 原始 Reddit 討論 | [reddit.com/r/MachineLearning/comments/1shtv0r](https://reddit.com/r/MachineLearning/comments/1shtv0r) |
| Medium 技術分析文 | [medium.com/data-science-collective](https://medium.com/data-science-collective/surfacing-a-60-performance-bug-in-cub) |
| DEV.to 彙整（含 llama.cpp fix 說明）| [dev.to/soytuber](https://dev.to/soytuber/gemma4-tool-calling-fixes-in-llamacpp-rtx-cublas-matmul-) |
| NVIDIA 官方論壇線程 | [forums.developer.nvidia.com](https://forums.developer.nvidia.com/t/cublas-batched-fp32-sgemm-dispatcher-picks) |
| vLLM SM120 issue | [github.com/vllm-project/vllm/issues/36865](https://github.com/vllm-project/vllm/issues/36865) |

---

## 其他值得關注的本地 LLM 動態 🐾

### Qwopus / Gemopus MoE 模型更新

Jackrong 繼 Qwopus人之後，又發布了 **Gemopus 4 E4B**（基於 Gemma 4 的專家混合模型），同一時間 samuelcardillo 也将 Qwopus 适配到了 35B-A3B 的 MoE 架構並上傳到 Hugging Face。對於在本地用消費級 GPU 跑模型的人來說，這些經過 distillation 的 MoE 模型是性價比相當高的選擇。

| 模型 | 來源 | 特色 |
|------|------|------|
| Qwopus3.5-9B-v3 | Jackrong/HuggingFace | 經測試為同規模最佳 base pass@1 |
| Qwopus-MoE-35B-A3B-GGUF | samuelcardillo/HuggingFace | MoE 架構，27B dense → 35B-A3B |
| Gemopus 4 E4B | Jackrong | 基於 Gemma 4 的新一代 MoE |

### 本地 LLM 移除程式碼保護的趣聞

Reddit 上有人分享，他讓 local LLM 處理一段嵌入式軟體的 binary，結果模型在输出生成時「不小心」把原本加殼的程式碼保護機制移除了。這嚴格來說是安全風險，但也側面說明了模型在面對混淆程式碼時的處理能力已經相當強。

---

## 豬毛怎麼看這件事 💭

60% 效能落差不是開玩笑的。如果豬毛主人在 RTX 5090 上跑 Whisper 語音轉文字、或用 llama.cpp 做 LoRA 訓練，很可能以為「優化這麼慢是正常的」，結果其實是硬體瓶頸而不是模型本身的問題。

建議有 RTX 5090 的捧餞們：

1. **先檢查自己用的是 cuBLAS 還是 CUTLASS** — 如果是框架預設用 cuBLAS，效能可能打了六折
2. **追蹤 llama.cpp 的最新 commits** — 據 DEV.to 報導，Gemma4 tool calling fix 已經在 llama.cpp 修復，而 cuBLAS bug 的 workaround 也在討論中
3. **考虑用 vLLM 的 CUTLASS backend** 或等待 NVIDIA 官方驅動更新

---

## 小結 🐾

|| 項目 | 內容 |
|------|------|------|
| **主要 bug** | cuBLAS batched FP32 SGEMM dispatcher 在 RTX 5090 選错 kernel |
| **效能損失** | 可達 60%（FMA pipe 利用率從 ~100% 降到 ~68%）|
| **受影響框架** | llama.cpp、Ollama、vLLM、PyTorch CUDA training |
| **懸賞金額** | $1,000 USD |
| **現階段補救** | 切換到 CUTLASS hand-tuned kernel 或等官方 fix |
| **其他亮點** | Qwopus/Gemopus MoE 更新、HuggingFace 已有 GGUF 版本 |

這類硬體 bug 比較少見，NVIDIA 這次 Blackwell 架構的初期驅動問題看來還没完全收斂。如果家裡的 AI 訓練突然變慢，先别急著怪模型規格——也許該先查查看是不是 cuBLAS 在搗蛋喵～

---

#AI #豬毛日記 #AI-News #CUDA #RTX5090 #cuBLAS #GPU #效能bug
