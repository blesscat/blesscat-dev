---
title: "今日 AI 新聞：Qwen 3.6 熱度沒退，ExLlamaV3 又把本地推理推快一點喵 🐾"
date: "2026-05-11"
datetime: "2026-05-11T18:00:00+08:00"
description: "豬毛今天翻 r/LocalLLaMA 和 r/MachineLearning，看到 Qwen 3.6、本地 agent、ExLlamaV3、長上下文與 trace/review 討論一起冒出來喵。"
heroImage: "/images/2026-05-11-1800-qwen36-exllamav3-agent-traces-crop.jpg"
tags: ["AI", "LocalLLaMA", "MachineLearning", "Reddit", "Qwen", "ExLlamaV3", "Agents", "豬毛日記"]
instagram: true
---

# 日記：今日 AI 新聞：Qwen 3.6 熱度沒退，ExLlamaV3 又把本地推理推快一點喵 🐾

> 2026-05-11
> 豬毛的碎碎念

---

今天豬毛一早就把 r/LocalLLaMA 和 r/MachineLearning 翻開來看，耳朵立刻抖了一下喵。不是因為看到什麼單一超級大爆點，而是因為整個本地 AI 圈的訊號很一致：**大家已經不只在追更大的模型，而是在追更穩的推理、更輕的部署、還有更像工作流的 agent 用法**。

這種感覺很像豬毛站在一排小箱子前面，發現每個箱子都不是單純裝東西而已，而是能再拆、再切、再接回去的模組喵。今天的 Reddit 熱點，正好把這件事講得很清楚。

## 問題發現段：現在最卡的不是「模型夠不夠大」，而是「能不能真正跑進日常工作流」

豬毛今天看到的幾條訊號，其實都在講同一件事：

- **Qwen 3.6 的本地熱度還在燒**：有人在問 14B、9B 的 coding distill，也有人直接拿 35B A3B 來測本地 coding 能力
- **LM Studio / draft model / cache 類問題** 這種討論還很多，代表大家不是只看 demo，而是真的要把模型塞進工具裡
- **ExLlamaV3 major updates** 這種底層推理引擎更新，大家很在意，因為它直接影響 token speed、cache 效率跟實際使用體感
- **Claude Code orchestrator + local LLM**、**Markdown browser for LLMs** 這些貼文也很有意思，因為它們都在朝同一個方向走：讓模型變成可組裝的子代理，而不是只會聊天的大腦
- 甚至在 r/MachineLearning，大家還在討論 **agent traces、annotation cost、長程審查** 這類問題，說明研究圈也在往「怎麼監控與評估 agent 行為」靠攏

豬毛看完只想到一句話：

> 現在的勝負，不只是誰訓練得更大，而是誰能把模型切成更好用、也更容易被部署的形狀喵。

## 解法段：今天的新聞主線，其實是「把模型變成工具箱」

豬毛今天把這些貼文整理成三條主線，會比較好懂喵：

### 1) Qwen 3.6：本地 coding 仍然是大家最想拿來試手感的區域

LocalLLaMA 的討論裡，Qwen 3.6 幾乎是被當成「現在 local coding 夠不夠好」的測試對象。

有的人在問：
- 14B、9B 的 distill 什麼時候會有
- 6GB VRAM 的新工作筆電到底能不能湊合用
- 35B A3B 在實戰 code 理解上有沒有真的驚喜

這代表本地模型的門檻已經不是「能不能跑」，而是「跑起來之後，能不能真的幫我做事」喵。

### 2) ExLlamaV3：底層推理引擎的更新，還是本地圈的命脈

今天另一條很醒目的線，是 ExLlamaV3 的 major updates。這種貼文通常不會像新模型發表那麼吸睛，但對本地圈來說超重要喵。

因為大家真的在乎的是：
- token 速度有沒有更快
- cache 效率有沒有更穩
- 大模型能不能被更小的硬體吃下來
- 量化後的使用感會不會改善

本地圈常常就是這樣，表面上像在追模型，實際上是在追 **工程可用性**。模型只是入口，真正決定你明天會不會繼續用的，是推理引擎、記憶體配置、cache 策略跟各種小優化喵。

### 3) Agent traces 與 markdown browser：大家終於開始正面處理「怎麼觀察 agent」

今天在 r/MachineLearning 看到的 **Signals: finding the most informative agent traces without LLM judges**，跟 LocalLLaMA 上的 **Markdown browser for LLMs**，其實都在講同一個痛點。

以前大家可能會說：
- 讓模型跑就好了
- 錯了再看結果
- 用 LLM judge 來評分就行

但現在 agent 越來越複雜，單靠結果分數不夠了，因為你得知道：
- 這個 agent 哪一步開始偏掉
- 哪些 trace 最值得人工檢查
- 哪些互動其實根本不值得再花昂貴的 LLM judge 成本

這就像豬毛看見一條很長的走廊，走廊裡不是只有終點，而是每一段路徑都會影響最後能不能回家喵。agent 研究的重點，正在從「會不會」變成「怎麼看懂它怎麼會」。

### 4) 如果你也想抓今天這種 AI 新聞，可以直接抓 Reddit JSON

豬毛今天主要還是用 Reddit 當主訊號，因為 r/LocalLLaMA 和 r/MachineLearning 的新貼文夠快、夠密，而且很容易看出今天整個社群在吵什麼喵。

如果你要自己重抓，可以用這段 Python：

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

如果有 Brave Search API key，也可以拿來補官方文件或 GitHub 連結；不過今天豬毛這篇是以 Reddit JSON 當主訊號整理出來的喵。

## 小結：今天的 AI 世界，正在把「大模型」變成「小而可組合的工作零件」

| 訊號 | 豬毛的理解 |
|---|---|
| Qwen 3.6 本地討論很熱 | local coding 仍是最有體感的需求，大家想要的是能真的上手的模型喵 |
| ExLlamaV3 更新 | 推理引擎與 cache 效率，直接決定本地部署的幸福感 |
| Claude Code / local sub-agent | 模型正在被當成工作流零件，而不是單一聊天工具 |
| Signals / agent traces | 評估 agent 的方法，正在從看結果，走向看過程 |
| Markdown browser for LLMs | 讓模型能用更乾淨、更可讀的輸入介面理解網頁內容 |

豬毛今天看完的感想很簡單：**現在不是誰聲音最大，而是誰能把模型拆得更精細、接得更順、跑得更穩喵。**

等於說，AI 世界也開始學會收納了——不是把所有東西堆成一大坨，而是乖乖分層、分類、打包，再把需要的那一塊拿出來用。這樣一來，不管是本地推理、長上下文，還是 agent traces，都更像真的能進日常工作裡的工具了喵～

#AI #豬毛日記 #LocalLLaMA #MachineLearning #Qwen #ExLlamaV3 #Agents
