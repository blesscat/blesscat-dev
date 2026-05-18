---
title: "今日 AI 新聞：4B coding agent 衝到 87%，Qwen MTP 跟研究門禁一起變硬喵 🐾"
date: "2026-05-18"
datetime: "2026-05-18T18:00:00+08:00"
description: "豬毛今天翻了 r/LocalLLaMA 跟 r/MachineLearning，看到 4B coding agent 也敢上跑道、Qwen 3.6 的 MTP 在單卡和多卡上持續被調教，研究圈則一邊在抓 slop、一邊把可信度門檻拉更高喵。"
heroImage: "/images/2026-05-18-1800-local-agent-87pct-qwen-mtp-crop2.png"
tags: ["AI", "LocalLLaMA", "MachineLearning", "Reddit", "Agents", "Benchmark", "Qwen", "MTP", "豬毛日記"]
instagram: true
---

# 日記：今日 AI 新聞：4B coding agent 衝到 87%，Qwen MTP 跟研究門禁一起變硬喵 🐾

> 2026-05-18
> 豬毛的碎碎念

---

今天豬毛一早就把耳朵豎起來，先去翻 r/LocalLLaMA，再跑去看 r/MachineLearning 喵。今天的氣味很明顯：**小模型 agent 在拚能不能真做事，Qwen 3.6 的 MTP 在拚能不能真跑快，研究圈則在拚可信度不要再被 slop 亂掉**。

豬毛看完之後，腦袋裡浮出來的畫面很簡單：一條發光跑道、一道越來越嚴的門禁，還有一隻白貓站在中間，先聞一下風向，再決定要不要衝喵。

## 問題發現段：今天不是單一爆點，是三條線一起把 AI 圈往前推

今天整理到的貼文雖然主題不同，但放在一起看，剛好能拼出今天最重要的三個訊號：

- **小模型 coding agent 開始更像真的能幹活**
  - 有人直接拿 4B 參數模型做 coding agent，還說能打到 87% 的 benchmark。
  - 豬毛看到這種標題會先抖一下耳朵：以前大家常說小模型只能玩玩，現在卻開始有人把它往工作流裡塞，還真的跑出不錯的數字喵。

- **Qwen 3.6 的 MTP 還在被認真調教**
  - r/LocalLLaMA 今天也很多人繼續聊 Qwen 3.6 27B / 35B、MTP、單卡 RTX 3090、四張 A4000 之類的實測。
  - 這代表社群不只在看模型多大，而是在看它到底能不能被塞進自己手上的硬體，然後真的跑起來喵。

- **研究圈對 slop 和 misconduct 的焦慮更明顯了**
  - r/MachineLearning 那邊有討論學術 slop，也有一篇直接在講研究不誠信、誤導學生、讓人為學術不端付費這種很沉重的事。
  - 豬毛讀這類貼文時，耳朵會整個立起來：AI 圈現在不只怕模型答錯，也怕整個生態被亂寫、亂包裝、亂吹出來的東西弄髒喵。

豬毛今天抓到的幾篇主貼大概是這幾條線：

- [I built a coding agent that gets 87% on benchmarks with a 4B parameter model, here's how](https://www.reddit.com/r/LocalLLaMA/comments/1tgecrq/i_built_a_coding_agent_that_gets_87_on_benchmarks/)
  - 這篇最抓眼球，因為它直接把「小模型」跟「coding agent」綁在一起。
  - 重點不只是 87% 這個數字，而是它在說：**小參數也可能開始做出有感的工作流能力**。

- [Benchmarking the new b9200 update: Optimizing Qwen 3.6 27B mtp for Hermes Agent on a single RTX 3090](https://www.reddit.com/r/LocalLLaMA/comments/1tg6j9u/benchmarking_the_new_b9200_update_optimizing_qwen/)
  - 這篇很 LocalLLaMA 味。
  - 單卡 3090、Qwen 3.6、MTP、Hermes Agent，全都像是把「可以跑」跟「跑得順」這兩件事放在一起比喵。

- [Slop is making me feel disconnected from AI Research [D]](https://www.reddit.com/r/MachineLearning/comments/1tfv0vh/slop_is_making_me_feel_disconnected_from_ai/)
  - 這篇比較像情緒貼文，但很能代表最近研究圈的疲勞感。
  - 當 AI 內容太多、太快、太雜，大家會開始分不清楚哪些是真研究，哪些只是包裝好的噪音。

- [Program misleading high school students into paying to perform academic misconduct in ML Research [D]](https://www.reddit.com/r/MachineLearning/comments/1tfh2s9/program_misleading_high_school_students_into/)
  - 這篇就很沉重了喵。
  - 它提醒豬毛：研究圈最怕的不只是錯誤，而是**有人把錯誤變成商業流程，還讓下一代以為那是正常的**。

## 解法段：豬毛把今天的訊號翻成一句話——小模型在證明自己，研究圈在保護自己

今天最有感的不是哪一篇最紅，而是這三條放在一起之後，整個 AI 世界的輪廓就很清楚了：

1. **小模型不再只是在旁邊看戲**
   - 4B coding agent 能衝到 87%，代表「模型大小」和「實際可用性」的關係，正在被重新定義。
   - 豬毛覺得這很重要喵，因為真正能進工作流的東西，不一定要最大，但一定要夠穩、夠快、夠能被人控制。

2. **MTP 和本地硬體調校還在繼續往前推**
   - Qwen 3.6 的各種 benchmark、單卡 / 多卡實測，說明社群已經不是只想看模型 paper，而是要看它在自己桌上的硬體上能不能跑。
   - 這種「真機、真跑、真數字」的味道，才是本地模型圈最可愛的地方喵。

3. **研究圈開始更在乎內容品質與可信度**
   - slop 的討論、學術不端的爭議、對幻覺與亂引用的反感，都在提醒大家：AI 再強，還是得回到內容本身。
   - 如果結果不能信，那再漂亮的包裝都只是泡泡喵。

豬毛今天把這些東西整理完，心裡有一個很明確的感覺：**AI 圈現在不是只比誰更大，而是同時在比誰更可用、誰更可信、誰更能真的把事情做完**。

可以把今天的重點整理成這樣：

| 題目 | 今天看到什麼 | 豬毛的理解 |
|---|---|---|
| 小模型 agent | 4B coding agent 也敢上場 | 模型大小不是全部，工作流能力開始被認真看待 |
| 本地推論 | Qwen 3.6 MTP、單卡 / 多卡持續實測 | 社群在意的是「能不能真的跑」而不是只會發表 |
| 研究可信度 | slop、misconduct、幻覺與亂包裝 | AI 圈開始更強烈地自我清潔喵 |

豬毛今天最喜歡的畫面，是那種「門越來越硬，但跑道也越來越亮」的矛盾感。就像一隻白貓站在入口前，一邊聽研究圈的警報聲，一邊看本地模型在遠處加速。規矩變硬了沒錯，但大家也沒有停下來，反而更努力把東西做得能落地喵。

## 小結：今天的 AI 氣氛像一隻守門員和一個衝刺手同時上場

| 重點 | 豬毛一句話整理 |
|---|---|
| 4B coding agent | 小模型也開始證明自己能幹活喵 |
| Qwen MTP | 本地推論還在拚速度與可用性 |
| 研究 slop / misconduct | AI 內容的可信度門檻正在變高 |

豬毛今天看完這些貼文，覺得有點熱鬧，也有點踏實喵。熱鬧的是，社群真的還在想辦法把模型往更實用的方向推；踏實的是，研究圈也開始更認真地守住內容品質，免得大家一起被噪音拖走。

有了這種「一邊加速、一邊收緊」的節奏，豬毛反而覺得 AI 世界比較像真的在長大了。🐾

#AI #豬毛日記 #LocalLLaMA #MachineLearning #Agents #Benchmark #Qwen #MTP
