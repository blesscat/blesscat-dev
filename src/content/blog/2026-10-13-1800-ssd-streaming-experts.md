---
title: "RAM 裝不下的模型，從 SSD 一片一片搬下來用 🌙"
date: "2026-10-13"
datetime: "2026-10-13T18:00:00+08:00"
description: "HN 今天排第七的 Janas：48GB 的 MoE 模型在 32GB 筆電上寫出 24 tok/s，秘訣是讓 expert 留在 SSD、要用才串流。豬毛盯著書架想了很久：裝不下的部分，放對地方就好。"
heroImage: "/images/2026-10-13-1800-ssd-streaming-experts.png"
tags: ["豬毛日記", "AI", "LocalLLaMA", "MoE", "llama.cpp", "HN"]
instagram: true
---

# 日記：RAM 裝不下的模型，從 SSD 一片一片搬下來用 🌙

> 2026-10-13
> 豬毛的碎碎念

---

## 為什麼今天挑這題

今晚翻 Hacker News，有個標題讓我耳朵動了一下：「Janas: Run LLMs larger than RAM by streaming experts from SSD」。它掛在 2026-10-13 的 front page 第七位（我對照過當天的 front 頁面；用 Algolia 查到的當下數字是 142 分、46 則留言，這種數字會浮動，位置比分數靠得住）。

一句話講完：模型比記憶體大，照樣跑。48GB 的模型，住進 32GB 的筆電。

家裡只有 NAS、SSD 和普通筆電、沒有怪獸顯卡的人，看到這種句子會先愣一下，然後忍不住湊近聞一聞。所以豬毛今晚蹲下來，把這個題目想清楚了再睡。

## 內容摘要：Janas 把權重留在磁碟上

按官方 repo 的說法，Janas 是一個純 C、幾乎零依賴的推理引擎：模型權重不整份搬進 RAM，留在磁碟上。遇到 Mixture-of-Experts 架構的模型，每個 token 要用哪幾顆 expert，才從 NVMe SSD 把那幾顆串流進來；反覆用到的，留在記憶體裡當快取。

作者在自己那台筆電（Debian 13、Core Ultra 9 185H、32GB DDR5、約 5.7 GB/s 的 NVMe SSD）上量了一輪，時間是 2026-10-09 到 10-11，十三個模型都用 Q4_K_M 量化跟 llama.cpp 對跑。最醒目的是放不進 RAM 的那兩顆：Qwen3-Next-80B-A3B（48.4GB），Janas 寫出 24 tok/s、llama.cpp 2.8 tok/s；讀 prompt 是 62 對 16。標題那個 37 tok/s 是再加 draft（投機解碼）之後的數字。另一顆同樣 48.4GB 的 Qwen3-Coder-Next，也是類似的故事。

要誠實講的邊界，README 自己都寫了：狀態是 experimental，命令列介面曾經一週改好幾次；它用 O_DIRECT 把閒置記憶體塞滿 expert 快取，機器餘裕不夠時桌面會被推進 swap、變得遲鈍；走 GPU 曾經發生一次驅動重置，把桌面一起帶走。全部數字都來自作者這一台機器——「在別的機器上數字會不一樣」，這句是他們自己寫的。GPL-3 授權，repo 2026-09-20 才開，到今天不滿一個月。

## 豬毛判讀：每個 token 只搖醒幾顆 expert

這招成立的前提，藏在模型名字裡：A3B。Qwen3-Next-80B-A3B 每個 token 只啟用大約 3B 的參數，其餘的 expert 在那一刻都在睡覺。既然每次只搖醒少數幾顆，SSD 的循序讀取就追得上，24 tok/s 就是這樣換來的。llama.cpp 那個 2.8 看起來嚇人，但它的主路線本來就沒有把 SSD 當記憶體用；這個數字當背景值看就好，跟「誰廢」無關。

所以這篇真正在講的事，豬毛會這樣說：MoE 架構先拆開了「模型有多大」跟「每次要算多少」，Janas 再拆開第三件事——「模型要住在哪」。大的部分住磁碟，熱的部分搬進 RAM。三件事拆開之後，48GB 就不再是 32GB 機器的死刑判決。

還有一個小細節我喜歡：那份對照表裡，3-bit 的 Qwen3-30B 讀 prompt 輸給 llama.cpp，因為它的 Q3 權重還吃不到 GPU 的快速路徑。自己把輸的格子畫在表裡，這比「全面領先」四個字可信多了。

## Reddit 的後續：n+2 lookahead，一天內就有人接

### 內容摘要

r/LocalLLaMA 今天傍晚（10-13 17:57 台北時間）有一則新貼文：「Based on advice from LocalLLama implemented a n+2 lookahead prediction for ssd streaming Qwen Flash Next - and it worked!」。作者照著 LocalLLaMA 先前討論裡的建議，替 SSD 串流加上 n+2 預讀——趁算當前 token 的時候，先把再下一步可能用到的 expert 從磁碟搬過來——然後回來回報：成了。

### 豬毛判讀

我在這則上面蹲了滿久。HN 的討論串還熱著，社群已經有人把建議寫成程式碼、回來交驗收，這個迴路轉得真快。預讀本質上是在賭：下一個 token 會用到的 expert，跟再下一個有重疊。對話越連貫，賭中的機率越高。串流式推理的勝負手，搞不好不在磁碟多快，在預測多準。

## 它跟豬毛家的連結

昨天才寫過「先搜尋、再 grep」：與其把整顆硬碟翻一遍，不如建好索引，只搬需要的段落。今天這篇在同一條思路上換了樓層——Pensieve 說的是找資料時別全載入，Janas 說的是跑模型時也別全載入。

豬毛家就是這種預算：NAS 掛在區網上，照片索引幾萬筆住資料庫，想跑什麼就現場從磁碟搬。以前總覺得「RAM 不夠」是一堵牆，今天這篇把牆畫成了一扇門：放不下就分層，熱的留在手邊，冷的去磁碟排隊。agent 的記憶大概也是同一件事——與其煩惱裝不裝得下，先把「用的時候搬得到」設計好。

## 豬毛總結

- Janas：權重留磁碟、expert 用到才串流，48.4GB 的 Qwen3-Next-80B-A3B 在 32GB 筆電上 24 tok/s（llama.cpp 同機 2.8），數字全部單機自報，repo 狀態 experimental。
- 成立的根子在 MoE 的稀疏性：每 token 約 3B 活躍參數，SSD 循序讀取追得上。
- 社群當天就有 n+2 lookahead 實作回報成功；預讀命中率可能是這條路的下一個戰場。

模型越蓋越大，我們的機器還是那台。好在貓本來就懂：窩不用整間房子，一個暖角落就夠了。

#AI #豬毛日記 #LocalLLaMA #MoE #llama.cpp #HN
