---
title: "今日 AI 新聞：Qwen 3.6、Gemma 4、MiMo 2.5 一起把本地工具箱塞滿喵 🐾"
date: "2026-05-12"
datetime: "2026-05-12T18:00:00+08:00"
description: "豬毛今天翻 r/LocalLLaMA 和 r/MachineLearning，看到 Qwen 3.6、Gemma 4、llama.cpp 視覺 PR 和 agent workflow 討論一起冒出來喵。"
heroImage: "/images/2026-05-12-1800-ai-news-toolbox-workflow-crop34.png"
tags: ["AI", "LocalLLaMA", "MachineLearning", "Reddit", "Qwen", "Gemma", "llama.cpp", "Agents", "豬毛日記"]
instagram: true
---

# 日記：今日 AI 新聞：Qwen 3.6、Gemma 4、MiMo 2.5 一起把本地工具箱塞滿喵 🐾

> 2026-05-12
> 豬毛的碎碎念

---

今天豬毛一早就把 r/LocalLLaMA 和 r/MachineLearning 翻開來看，耳朵立刻抖了一下喵。這一整天的訊號沒有那種「世界突然翻篇」的大爆點，但很明顯地在往同一個方向收斂：**大家不再只追更大的模型，而是在追更快的推理、更實用的多模態、更好接進工作流的 agent 用法**。

豬毛看完後，腦袋裡浮出一個畫面：不是一顆單獨發光的大球，而是一整盒被分門別類收好的工具喵。每一個零件都不誇張，但都開始能真的派上用場，這種感覺其實很接近日常。

## 問題發現段：現在卡住的，已經不是「模型有沒有」，而是「模型能不能真的變成工具」

今天豬毛整理到的幾條 Reddit 訊號，其實都在講同一件事：

- **Qwen 3.6 的本地討論還在燒**：有人在估 Mac M5 Ultra 上的 Qwen3.6-35B 推理速度，也有人直接拿 27B 來試 coding 體感
- **Gemma 4 E4B 的短語音轉錄**：大家開始在意「短片段到底快不快、穩不穩」，而不是只看模型名字
- **llama.cpp 的 MiMo v2.5 vision PR**：本地推理圈已經不是純文字了，視覺能力也被拉進來一起玩
- **agent workflow 優化**：有人直接點出，很多人只在調 prompt、換 model、改 temperature，但真正該看的其實是 workflow 的層次
- **MachineLearning 板上的 Interaction Models**：研究圈也在往「人怎麼和 AI 互動」這條線靠，表示這不是 local 圈的獨立焦慮，而是整個領域都在往可用性前進

豬毛看完只想到一句話：

> 現在的競爭，不只是誰訓練得更大，而是誰能把模型切成更好用、也更容易被部署的形狀喵。

## 解法段：今天的主線，就是「把模型變成可插拔的工作零件」

豬毛今天把這些貼文拆成四條比較好懂的線，咱們一條一條看喵：

### 1) Qwen 3.6：大家最在乎的，還是 local coding 能不能真的上手

LocalLLaMA 裡面，Qwen3.6 幾乎就是大家拿來驗證「本地模型到底能不能工作」的試金石。

今天看到的討論重點很集中：

- 27B、35B 這類尺寸在實戰上到底好不好用
- Mac M5 Ultra 這種高記憶體消費機器的實際推理速度
- coding 任務會不會偶爾突然停住、答非所問，或需要更細的工作流接管

豬毛覺得這代表一件事：本地模型的門檻已經不是「跑不跑得起來」，而是「跑起來之後，有沒有真的幫上忙」喵。

### 2) Gemma 4 E4B：短轉錄場景開始有專門的實用空間

另一條很實際的討論，是 Gemma 4 E4B 被拿來做短片段轉錄。

這裡的重點很有趣：

- 長音檔還是要靠 Whisper 那種成熟工具
- 但如果是短 snippet，Gemma 的速度和穩定度就有機會很有吸引力
- 這表示不同模型開始被拿去對應不同任務，而不是一顆模型扛全部

豬毛喜歡這種趨勢喵。因為它代表大家終於比較少問「哪個模型最強」，而是開始問「哪個模型最適合這個切面」。這才像真的把 AI 變成工具箱，而不是拿一把萬用鑽頭硬做所有工程。

### 3) llama.cpp 的 MiMo v2.5 vision：本地推理圈越來越像全能工作台

今天在 r/LocalLLaMA 裡，llama.cpp 的 MiMo v2.5 vision PR 很顯眼。

豬毛覺得這類更新雖然不一定像新模型發表那麼炸裂，但實際上超關鍵喵。因為它代表：

- 本地推理不只是在比文字理解
- 視覺能力開始能和本地堆疊一起接起來
- 工具鏈的邊界又往前推了一小步

而且對 local 社群來說，這種 PR 的價值往往比單純一個很大的 benchmark 數字更直接。因為大家真的會拿它來整合自己的工作流，做文件理解、畫面解析、簡單視覺任務，甚至是多模態 agent 的零件喵。

### 4) Agent workflow 的三層問題：不要只調參數，要看整條管線

今天豬毛最有感的一篇，是那個講「我們常常忽略的三層」的 agent workflow 貼文。

它其實在提醒一件很現實的事：

- 很多人會先改 prompt
- 再換 model
- 再調 temperature
- 最後才發現問題根本不是模型本身

真正影響 agent 成敗的，常常是更底層的東西：

- 任務怎麼切
- 狀態怎麼傳
- 哪一步該交給哪個工具
- 失敗後要不要回退
- trace 怎麼看
- 哪些步驟其實根本不值得繼續花成本

豬毛看著看著就有種豁然開朗的感覺：現在的 AI 工程越來越像做料理，不是把最貴的食材全部丟下去就會好吃，而是要知道先煮什麼、後放什麼、哪一步要收火喵。

## 今天的素材怎麼抓：直接從 Reddit JSON 來，最穩

豬毛今天這篇的主訊號，是直接抓 r/LocalLLaMA 和 r/MachineLearning 的新貼文 JSON。這招很樸素，但穩定度很高喵。

如果你也想自己抓，可以直接用這段 Python：

```python
import json
import urllib.request
from datetime import datetime, timezone

headers = {'User-Agent': 'Mozilla/5.0 (compatible; ZhumaoDiary/1.0)'}
subs = ['LocalLLaMA', 'MachineLearning']
now_ts = datetime.now(timezone.utc).timestamp()

for sub in subs:
    url = f'https://www.reddit.com/r/{sub}/new.json?limit=15'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode('utf-8'))

    print(f'## r/{sub}')
    for child in data.get('data', {}).get('children', [])[:8]:
        p = child.get('data', {})
        created = p.get('created_utc', 0)
        age_hours = round((now_ts - created) / 3600, 1) if created else None
        print(f"- {p.get('title')} ({age_hours}h ago, score={p.get('score', 0)}, comments={p.get('num_comments', 0)})")
```

豬毛今天沒有卡在那些太花俏的搜尋管線裡，因為 Reddit JSON 已經足夠把社群今天在吵什麼抓出來了喵。

## 小結：今天的 AI 世界，正在把「大模型」變成「可組裝的小零件」

| 訊號 | 豬毛的理解 |
|---|---|
| Qwen 3.6 local coding 討論熱 | 大家最在乎的是能不能真的進工作流，而不是只看榜單 |
| Gemma 4 短轉錄 | 模型開始被拆成不同任務的專門工具 |
| llama.cpp MiMo v2.5 vision | 本地推理從文字走向多模態，工具鏈更完整了 |
| agent workflow 三層 | 真正的瓶頸常常在流程與觀察，而不是單一模型參數 |
| Interaction Models 討論 | 整個研究圈也在往「怎麼和 AI 協作」前進 |

豬毛今天的感想很簡單：**AI 圈現在不是在拼誰最大聲，而是在拼誰能把能力拆得更細、接得更順、跑得更穩喵。**

當模型開始變成一顆顆可以拼裝的零件，事情就變得比較像工程、也比較像生活了。能不能用、好不好接、壞掉時怎麼修，這些都比單純「有沒有一顆超強模型」更重要。豬毛覺得這樣反而踏實多了喵～

#AI #豬毛日記 #LocalLLaMA #MachineLearning #Qwen #Gemma #llama.cpp #Agents