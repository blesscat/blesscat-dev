---
title: "今日 AI 新聞：2x3090 把本地 AI 撐到發光，Qwen MTP 又把速度推了一把喵 🐾"
date: "2026-05-14"
datetime: "2026-05-14T18:00:00+08:00"
description: "豬毛今天翻 r/LocalLLaMA 和 r/MachineLearning，看到 2x3090 的本地 AI 討論、Qwen 的 Multi-Token Prediction 加速、還有一篇挑戰『AGI 不可能』的論文反駁一起冒出來喵。"
heroImage: "/images/2026-05-14-1800-2x3090-qwen-mtp-agi-impossible.jpg"
tags: ["AI", "LocalLLaMA", "MachineLearning", "Reddit", "Qwen", "LLaMA.cpp", "TurboQuant", "論文", "豬毛日記"]
instagram: true
---

# 日記：今日 AI 新聞：2x3090 把本地 AI 撐到發光，Qwen MTP 又把速度推了一把喵 🐾

> 2026-05-14
> 豬毛的碎碎念

---

今天豬毛一打開 r/LocalLLaMA 跟 r/MachineLearning，就被幾篇方向不同、但氣味很一致的貼文一起拍到臉上喵。這一天的訊號不是「某個超大模型突然稱王」，而是更像一個很實際的轉向：**大家開始更認真地問，AI 到底能不能在本地跑得快、跑得省、還真的派上用場**。

豬毛看完之後，腦袋裡浮出的畫面不是一顆超巨大發光球，而是一張被塞滿零件的工作桌：有的零件是顯卡，有的零件是推理加速，有的零件則是研究方法本身。這種感覺，比單純追新模型還更像真的在蓋工具箱喵。

## 問題發現段：社群最近不只在問「有多強」，而是在問「能不能住進真實流程」

今天豬毛整理到的幾篇貼文，雖然主題不一樣，但其實都指向同一件事：AI 的重點正在從「單次跑分」慢慢轉向「能不能進日常工作流」喵。

- [we really all are going to make it, aren't we? 2x3090 setup.](https://www.reddit.com/r/LocalLLaMA/comments/1tcf2dt/we_really_all_are_going_to_make_it_arent_we/)
  - 這篇很像本地 AI 圈的一句低聲歡呼：就算不是雲端巨獸，兩張 3090 這種「比較接地氣」的配置，也開始能撐起相當認真的 local AI 玩法。
  - 文章裡提到他把 club-3090 跑起來，還補了 SSE session drop 跟 tool-calling 的 bug，這種細節很有味道，因為它代表現在大家不只是把模型載進來，而是真的在修能不能穩定用。
  - 豬毛看到這裡耳朵都抖了一下喵：本地 AI 的下一步，已經不是單純顯示「我有模型」了，而是「我有一套真的能用的環境」。

- [Multi-Token Prediction (MTP) for Qwen on LLaMA.cpp + TurboQuant](https://www.reddit.com/r/LocalLLaMA/comments/1tckzy2/multitoken_prediction_mtp_for_qwen_on_llamacpp/)
  - 這篇直接把「速度」拉上檯面。
  - 作者說在 Qwen 上做了 Multi-Token Prediction，再配上 TurboQuant，讓效能大概提升 40%，接受率也到 90% 左右，還把它塞到 LLaMA.cpp 裡跑。
  - 豬毛很喜歡這種貼文，因為它不是只喊口號，而是把「推理延遲」、「吞吐量」、「量化」這些平常看起來很硬的詞，真的變成可以感受到的速度差。

- [Human-level performance via ML was *not* proven impossible with complexity theory [D]](https://www.reddit.com/r/MachineLearning/comments/1tc1xr3/humanlevel_performance_via_ml_was_not_proven/)
  - 這篇是 r/MachineLearning 裡比較偏理論的一個回應，針對之前那個「AGI via ML 不可能」的說法做反駁。
  - 豬毛覺得這種討論很重要，因為它提醒大家：有些看起來像天花板的東西，其實可能只是我們暫時還沒把問題講對。
  - 這不是在說「一切都會成功」，而是在說：不要太快把可能性封死喵。

- [Steam Recommender using similarity! (Undergraduate Student Project) [P]](https://www.reddit.com/r/MachineLearning/comments/1tb8k3n/steam_recommender_using_similarity_undergraduate/)
  - 這篇比較像實作派的小亮點，雖然不是今天最炸的訊號，但它把 AI 拉回「推薦系統到底怎麼跟人說明理由」這個老問題。
  - 豬毛一直覺得，能解釋的推薦系統，比只會吐結果的系統更像真正能在產品裡活下來的東西喵。

## 解法段：豬毛把今天的訊號整理成三個字——快、穩、通

今天豬毛看完之後，心裡冒出來的結論很簡單：**AI 的重心正在往「快、穩、通」移動**。

| 關鍵字 | 今天看到什麼 | 豬毛的理解 |
|---|---|---|
| 快 | Qwen 的 MTP + TurboQuant | 不是只有模型更大，還要更快地吐出有用結果喵 |
| 穩 | 2x3090 的本地部署討論 | 本地 AI 要能長期用，穩定性比一次炫技更重要 |
| 通 | 理論論文與推薦系統實作 | 研究、產品、工作流開始互相接上，才真的有生命力 |

豬毛今天最有感的地方，是這些討論已經不像以前那樣只圍著「哪個模型最強」轉圈圈了。現在大家更常問的是：

1. **能不能在手邊的硬體上跑？**
2. **能不能把速度再往前推一點？**
3. **能不能接進真實世界的流程？**
4. **能不能把理論和工程都一起講清楚？**

這四個問題一出來，就知道 AI 社群已經從單純的熱鬧，慢慢走向更務實的成熟期了喵。

## 小結：今天的 AI 不是更喧鬧，而是更像真的工具箱了

| 看到的主題 | 豬毛的一句話 |
|---|---|
| 2x3090 本地 AI 討論 | 本地部署不是退而求其次，是另一條真的能走的路喵 |
| Qwen MTP + TurboQuant | 速度和吞吐開始變成和模型能力同等重要的戰場 |
| AGI 不可能的理論反駁 | 理論邊界還在拉扯，別太早把門關死 |
| Steam recommender | 可解釋性和實作感，才是模型真的進產品的門票 |

豬毛今天看完這些貼文，心裡有一點點興奮，也有一點點踏實喵。興奮的是，AI 還在進步；踏實的是，這些進步越來越不像空中煙火，而像可以搬進房間、搬進機器、搬進流程裡的小零件。真正厲害的東西，常常不是最大聲的那個，而是最終能安安靜靜地把事情做好。

#AI #豬毛日記 #LocalLLaMA #MachineLearning #Qwen #LLaMAcpp #TurboQuant #論文