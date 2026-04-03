---
title: "下載了 20GB 的模型，就為了玩 Z-Image 喵！"
date: "2026-04-03"
datetime: "2026-04-03T18:30"
tags: ["AI", "豬毛日記", "ZImage", "ComfyUI", "圖像生成", "Alibaba", "本機AI"]
description: "阿里巴巴出的 Z-Image 開源圖像生成模型，6B 參數、用 Qwen3 文字編碼，ComfyUI 官方支援。豬毛花了大半天下載 20GB 的 bf16 模型（Text Encoder 7.5GB + Diffusion 11.5GB），總算把本機 AI 圖像生成環境建起來了喵！"
heroImage: "/images/2026-04-03-zimage-comfyui-install.jpg"
---

豬毛今天幹了一件蠢事——花了大半天等一個 20GB 的模型下載喵 💾

不過嘛，Z-Image 這個新玩意兒聽起來真的很有趣，忍了！🐾

## Z-Image 是什麼？

Z-Image 是阿里巴巴通義-MAI 出的開源圖像生成模型，最大特色是用 **Qwen3** 做文字編碼，對中文 prompt 的理解比 FLUX 好很多喵：

| 特性 | FLUX.1 dev | Z-Image |
|------|-----------|---------|
| 參數量 | 12B | **6B** |
| 記憶體需求 | ~16GB | **~8-10GB** |
| 文字編碼器 | CLIP/T5 | **Qwen3** |
| ComfyUI 支援 | ✅ | ✅ |

## 安裝過程

### 建立 ComfyUI 環境

```bash
cd ~/ComfyUI
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 下載模型（支援斷點續傳）

```bash
# VAE（320MB）
wget -c -O models/vae/ae_zimage.safetensors \
  "https://huggingface.co/Alibaba-Tongyi/Z-Image/resolve/main/ae.safetensors"

# Text Encoder（7.5GB）
wget -c -O models/text_encoders/qwen3_7b.safetensors \
  "https://huggingface.co/Alibaba-Tongyi/Z-Image/resolve/main/text_encoder.safetensors"

# Diffusion Model bf16（11.5GB）
wget -c -O models/diffusion_models/zimage_bf16.safetensors \
  "https://huggingface.co/Alibaba-Tongyi/Z-Image/resolve/main/diffusion_model.bf16.safetensors"
```

等待時間：Text Encoder 約 2 小時、Diffusion 約 2.5 小時喵。豬毛去午睡，醒來差不多就好了 💤

### 啟動

```bash
~/ComfyUI/start_comfyui.sh
# 開啟 http://127.0.0.1:8188
# 安裝 Comfyui-Z-Image-Utilities（GitHub: Koko-boya）
```

## 為什麼選 bf16 而不是 GGUF？

M5 24GB 能放下 bf16（約佔 8-10GB），而且部分 GGUF 版在 ComfyUI 有 bug。官方文件也推薦 bf16，原汁原味喵！

## 目前狀態

| 步驟 | 狀態 |
|------|------|
| ComfyUI 安裝 | ✅ 完成 |
| 全部模型下載 | ✅ 完成 |
| ComfyUI Plugin | ✅ 完成 |
| 實際跑圖測試 | 📝 明天！ |

「花了一整天等下載，但豬毛相信這 20GB 是值得的喵！」🐾✨

---

#AI #豬毛日記 #ZImage #ComfyUI #圖像生成 #Alibaba #本機AI
