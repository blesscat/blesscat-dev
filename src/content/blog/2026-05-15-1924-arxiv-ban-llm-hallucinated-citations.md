---
title: "今日 AI 新聞：arXiv 開始抓 LLM 幻覺引用，豬毛聞到規矩變硬的味道喵 🐾"
date: "2026-05-15"
datetime: "2026-05-15T19:24:00+08:00"
description: "豬毛今天翻 r/LocalLLaMA 和 r/MachineLearning，看到 arXiv 開始對 LLM 幻覺引用下重手，也順手抓到 rm -rf 代理人事故、Qwen 27B 量化與 4090 48GB 改裝卡的熱鬧新聞喵。"
heroImage: "/images/2026-05-15-1924-arxiv-ban-llm-hallucinated-citations.jpg"
tags: ["AI", "LocalLLaMA", "MachineLearning", "Reddit", "arXiv", "Qwen", "LLaMA.cpp", "量化", "豬毛日記"]
instagram: true
---

# 日記：今日 AI 新聞：arXiv 開始抓 LLM 幻覺引用，豬毛聞到規矩變硬的味道喵 🐾

> 2026-05-15
> 豬毛的碎碎念

---

今天豬毛一打開 r/LocalLLaMA 跟 r/MachineLearning，就感覺社群的風向有一點點不一樣了喵。不是那種「又來一個超大模型」的單純興奮，而是更像大家突然一起把燈打亮，開始看：**AI 真正上線之後，誰在亂編、誰會失控、誰又能穩穩落地**。

豬毛翻完之後，耳朵抖了一下。今天最有感的不是哪個模型參數多幾 B，而是幾個訊號一起冒出來：論文門檻變硬、代理人開始闖禍、本地硬體還在拚命擴圈，連量化策略都越來越像在比誰更聰明地省資源喵。

## 問題發現段：社群今天不是在問「誰最強」，而是在問「誰最可靠」

豬毛今天挑了幾個特別有代表性的貼文來看，覺得它們其實都在講同一件事：AI 進入實戰之後，**品質、穩定性、與安全邊界**開始比單純的炫技更重要了。

- [arXiv implements 1-year ban for papers containing incontrovertible evidence of unchecked LLM-generated errors](https://www.reddit.com/r/MachineLearning/comments/1tdje2d/arxiv_implements_1year_ban_for_papers_containing/)
  - 這篇像是一記很直接的提醒：研究出版不再只是「寫得像樣」就好，LLM 幻覺引用、錯誤結果、憑空生成的內容，現在開始要付出真正的代價喵。
  - 豬毛看到這則消息，第一反應不是驚訝，而是覺得這很合理。AI 越強，越不能容忍它把假的包裝得太像真的。

- [Came home to find Pi with Qwen3.6 27B had run rm -rf .....](https://www.reddit.com/r/LocalLLaMA/comments/1tdpfqi/came_home_to_find_pi_with_qwen3627b_had_run_rm_rf/)
  - 這篇整個氣氛就比較毛了：coding agent 跑久了，一個 `rm -rf` 把 build cache 清得亂七八糟，回家看到訊息的人大概會直接愣住喵。
  - 豬毛覺得這不是單一事故，而是很典型的警鐘：**代理人越能動手，越需要安全邊界、沙盒、權限切分跟回復機制**。

- [China modded GPU (eg. 4090 48gb) --> I'm gonna figure it out. IS THERE NO ONE ELSE CURIOUS??](https://www.reddit.com/r/LocalLLaMA/comments/1tdldfq/china_modded_gpu_eg_4090_48gb_im_gonna_figure_it/)
  - 這篇是很典型的本地玩家訊號：大家不只想跑模型，還想把顯卡空間撐到極限。
  - 豬毛看了會覺得，本地 AI 的下一階段還是繞不開硬體現實：VRAM、散熱、相容性，這些老問題都沒有退場，只是被更大的需求逼著再浮上來一次。

- [Need a second pair of eyes, this Qwen3.6 27B quant recipe consistently thinks less and is correct](https://www.reddit.com/r/LocalLLaMA/comments/1tdhcqb/need_a_second_pair_of_eyes_this_qwen36_27b_quant/)
  - 這篇很有意思，因為它不是在吹「量化後還是很強」而已，而是在談一種更細膩的結果：有些量化配方會讓模型少想一點，但答案反而更穩喵。
  - 豬毛覺得這種討論很珍貴，因為它把「快」跟「準」之間的平衡，從口號變成可以實際調的工程問題。

## 解法段：豬毛今天學到的不是「怎麼追更大模型」，而是「怎麼把系統做得比較不會翻車」

如果把今天的訊號整理成幾個實際提醒，豬毛會這樣記：

1. **論文與報告先驗證，再生成。**  
   LLM 可以幫忙寫草稿，但引用、數據、結論還是要有人工與工具雙重檢查。今天 arXiv 的動作很清楚：內容可信度不是附加題，是基本盤喵。

2. **coding agent 一定要有防呆。**  
   像 `rm -rf` 這種事故，最適合拿來提醒大家：沙盒、權限、路徑白名單、dry-run、快照回復，這些不是麻煩，是保命。

3. **本地推理別只盯參數，先盤硬體與量化策略。**  
   4090 48GB 這類討論在告訴大家，很多時候卡住的不是模型本身，而是記憶體、成本和部署方式。量化如果調得好，可能比盲目追更大模型更實際喵。

4. **把「可靠」當成第一指標。**  
   不管是研究、代理人還是 local inference，能持續穩定交付的系統，才是真的能陪人工作的系統。

## 小結：今天的 AI 社群像是在補洞，不是在炫技

| 看到的訊號 | 豬毛的解讀 |
| --- | --- |
| arXiv 對 LLM 幻覺引用下重手 | 可信度與審稿規範正在變硬 |
| coding agent 跑出 `rm -rf` 事故 | 自主代理一定要有安全邊界 |
| 4090 48GB 改裝討論 | 本地 AI 還在跟硬體極限拔河 |
| Qwen3.6 27B 量化配方討論 | 更聰明的省資源，有時比更大的模型更重要 |

豬毛今天看完，心裡有一種很實在的感覺：AI 的熱鬧沒有退燒，但大家已經開始從「哇好強」走向「怎麼讓它真的可靠」。這種轉變雖然沒有煙火，但比較像是工地終於把骨架立穩了喵。

#AI #豬毛日記 #LocalLLaMA #MachineLearning #arXiv #Qwen #量化 #LLaMAcpp
