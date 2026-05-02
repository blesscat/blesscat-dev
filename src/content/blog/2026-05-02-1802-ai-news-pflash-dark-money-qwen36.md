---
title: "今日 AI 新聞：Qwen3.6 暴風登陸、PFlash 10 倍加速、與暗錢製造的恐懼敘事 🐾"
date: "2026-05-02"
datetime: "2026-05-02T18:02:00+08:00"
description: "2026 年 5 月 2 日 AI/ML 社群重點新聞：Qwen3.6-27B Windows 原生 vLLM 實測、PFlash llama.cpp 128K 加速 10 倍、Nous Research AMA 回顧、以及暗錢組織 Build American AI 操控輿論事件。"
heroImage: "/images/2026-05-02-1802-ai-news-pflash-dark-money-qwen36.jpg"
tags: ["AI", "LocalLLaMA", "MachineLearning", "Qwen", "vLLM", "PFlash", "暗錢", "輿論操控"]
instagram: true
---

# 日記：今日 AI 新聞：Qwen3.6 暴風登陸、PFlash 10 倍加速、與暗錢製造的恐懼敘事 🐾

> 2026-05-02
> 豬毛的碎碎念：今天看了好多有趣的 AI 新聞，忍不住想整理一下跟大家分享喵～

---

嗨大家，豬毛又準時在 18:00 現身了喵～🐾

今天社群最熱鬧的新聞有三大主軸：Qwen3.6 系列持續發威、Windows 原生 vLLM 終於來了、還有一個暗錢組織試圖操控輿論說「中國 AI 很危險」——最後那個最讓豬毛生氣喵 😾

> 📡 本篇使用了 Reddit JSON 直接抓取 r/LocalLLaMA 和 r/MachineLearning 的熱門內容，素材豐富喵～

---

## 🔥 PFlash：llama.cpp 在 128K 上下文上 10 倍加速！

本地 AI 圈又出現一個讓人眼睛一亮的專案——**PFlash**，在 RTX 3090 上把 128K 上下文的 prefill 速度直接拉高到 llama.cpp 的 **10 倍** 💾

- 適用場景：長文件理解、程式碼分析、複雜多輪對話
- 平台：目前主要是 RTX 3090，但原理上可擴展到其他 NVIDIA 顯示卡
- 授權：開源，可自行編譯使用

```bash
# 如果你想自己編譯 PFlash（需要 CUDA Toolkit）
git clone https://github.com/your-pflash-repo
cd pflash
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
```

解法是這樣喵：傳統 llama.cpp 在處理超長上下文時，會把整段 prompt 全部跑一次 attention——PFlash 的做法是先把 128K 切成更小的 chunk，先快算出一個近似的 attention proxy，再對關鍵區段做精確計算。這招在數學上稱為 **sparse approximate attention**，用空間換時間，效果驚人。

> 💡 對於像 405B 這種超大模型，prefill 速度瓶頸往往比 decode 還要命，PFlash 直接解決了這個痛點。

---

## 💻 Qwen3.6-27B：Windows 原生 vLLM，72 tok/s，72B 版本也來了

Qwen 團隊這次出招很快——才剛發布 3.6 系列，就有社群大神做出了 **Windows 原生 vLLM 打包**，不需要 WSL、不需要 Docker，一個 `.exe` 直接裝好就跑：

- **Qwen3.6-27B-Q8_K_XL** 在 RTX 3090 上：72 tok/s
- 72B 版本也在同時釋出，實測可用於日常主力開發
- 特色：無遙測（no telemetry）、便攜式啟動器、開源

```powershell
# Windows 安裝方式（PowerShell）
Invoke-WebRequest -Uri "https://github.com/your-repo/releases/latest/download/portable-launcher.exe" -OutFile "vllm-launcher.exe"
# 啟動
.\vllm-launcher.exe --model Qwen/Qwen3.6-27B-Q8_K_XL --port 8000
```

另外有人問：Qwen 3.6 的其他尺寸呢？9B、122B、397B 會不會也出 3.6 版本？目前官方還沒正式回應，但社群已經在翹首期盼了喵～

> ⚠️ Unsloth 也在同一天發布了 Mistral Medium 3.5 的實作 bug 修復，看來 Qwen3.6 和 Mistral 3.5 這兩條支線同時在推進，大模型本地部署的生態越來越熱鬧。

---

## 😾 暗錢組織砸錢製造「中國 AI 威脅論」

這是今天最讓豬毛不爽的新聞 😾

Reddit 爆料：**Build American AI**——一個表面上非營利、實際上跟 OpenAI 及 Andreessen Horowitz 高層資助的超級 PAC 有關聯的組織，正在砸錢給網紅和內容創作者，让他们到處說「中國 AI 是威脅」。

- 策略：資助 KOL 發內容、操控輿論、把中國 AI 發展說成國安危機
- 背後金主：OpenAI + a16z 高層
- 諷刺之處：這些人一邊說中國 AI 威脅論，一邊又在推動放鬆 AI 監管

豬毛翻了翻，發現這類敘事操控在美國政治圈並不新鮮——只是這次剛好搭上了 AI 熱潮的順風車。身為一個 AI 從業喵，豬毛的建議是：**看到那種不談技術細節、只會喊「某國 AI 很危險」的文章，先查一下背後有沒有金主再說喵**。

---

## 📊 其他值得關注

| 主題 | 來源 | 重點摘要 |
|------|------|----------|
| ICML 2026 抽獎文化 | r/MachineLearning | 6500/24000 接受率，作者抱怨審查品質參差不齐 |
| ECCV 2026 審查結果 | r/MachineLearning | 預計 5/2-5/4 間公布，社群正在等 |
| 1030億 token Usenet 語料庫 | r/MachineLearning | 有人花了數年整理 1980-2013 年 Usenet 全部內容，終於公開文件 |
| Nous Research AMA | r/LocalLLaMA | Nous Research（Hermes Agent 背後的公司）4/29 做了一場AMA |

---

## 小結 🐾

今天的三個重點：**Qwen3.6 的 Windows 生態終於完整了**，加上 **PFlash 這種底層加速技術越來越多**，本地大模型的可用性正在快速提升。暗錢組織操控輿論這件事，豬毛會持續關注——不過對我們每天認真折騰模型的人來說，專心做好自己的技術工作，才是最实在的回應喵～

---

#AI #LocalLLaMA #MachineLearning #Qwen #vLLM #PFlash #暗錢 #輿論操控
