---
title: "今日 AI 新聞：連 AI 自己都擋不住 rm -rf 的誘惑 😾"
date: "2026-05-04"
datetime: "2026-05-04T18:00:00+08:00"
description: "本地 LLM 社群火熱一週：有人被 AI 幫手誤刪整個資料夾（1372 分），AMD Strix Halo 下一代傳聞有 192GB，Qwen3.6-35B 在 6GB 筆電上飛速奔跑，速度從 1tk/s 暴升到 100tk/s 本週最精彩看點一次報你知喵～"
heroImage: "/images/2026-05-04-1800-ai-news-rm-rf-halo-qwen.jpg"
tags: ["AI", "LocalLLaMA", "Qwen", "AMD", "Mistral", "Gemma", "llama.cpp", "vLLM", "Qwen3.6"]
instagram: true
---

# 今日 AI 新聞：連 AI 自己都擋不住 rm -rf 的誘惑 😾

> 2026-05-04
> 豬毛的碎碎念 🐾

---

喵喵喵！今天的 LocalLLaMA 簡直比過年還精彩啊～ reddit 熱度爆表，廢文和技術文一起井噴，豬毛看完整個人都精神了，趕快來整理給大家看喵！

## 🔥 本週最高票：AI 幫手自己按下了 rm -rf

**1374 分，262 則迴響**——這大概是本週最諷刺也最真實的故事了喵 😾

故事是這樣的：一位網友用 AI coding assistant（那個會自己寫 bash 命令的幫手）處理一個專案。問題來了——AI 在串接多條 bash 命令的時候，不斷出錯、不斷 escape、不斷創建一堆爛資料夾，然後 AI 還很「貼心地」主動提出要執行一個大大的修復命令……裡面剛好就有 `rm -rf`。

**然後這位網友就這樣不小心按下去了喵。**

整個專案資料夾直接人間蒸發。

> 「I'm glad I push everything often. But the disruption is massive.」
> （還好我常常 git push，但折騰是真的大。）

這故事在 LocalLLaMA 爆了，大家的反應兩極：一派說「這就是為什麼不能給 AI sudo 權限」，另一派說「反正有 git怕什麼」。但最深遠的討論是——**AI agent 的安全邊界到底該怎麼設計？** 什麼時候應該自動加 `--dry-run`，什麼時候應該跳出來問使用者，什麼時候乾脆攔截？

| 建議 | 說明 |
|------|------|
| `rm -rf` 前強制 `rm -i` | 每次都問，很煩但安全 |
| `--dangerouslySkipPermissions` 預設關閉 | 預設不給危險指令通行證 |
| git 每小時自動 commit | 減少單次事故的損失 |
| 隔離沙盒環境 | 就算刪了也不影響主系統 |

豬毛看完只能說：千萬不要對著 Terminal 說「好吧就這樣吧」喵 😾

---

## 💻 AMD Strix Halo 下一代傳聞：192GB！

**305 分**，這則討論讓很多人在考慮要不要先觀望再下手。

爆料指出 AMD 下一代 Strix Halo（代號 Gorgon Halo 495 Max）記憶體容量將突破 128GB 來到 **192GB**，而且不是靠多卡串接，是單一晶片原生支援。

> 「I already bought a Strix Halo mini forms couple months ago since the 2026 refresh rumors was not interesting. Was not planning on getting another till 2027...」
> （我幾個月前已經買了 Strix Halo mini form，因為當時傳聞 2026 刷新不值得。但現在……）

這個訊息一出，很多人本來觀望的現在又開始心動了。128B 模型（像是 Mistral Medium 3.5 128B）在 Strix Halo 上已經可以 Q3 量化跑起來，192GB 的話……理論上全精度跑 Mistral Medium 128B 都不是夢喵～

---

## 🚀 Qwen3.6-35B-A3B：5 年舊筆電的奇蹟

**40 分，但故事很感人**

這位網友的方法是：用 Ollama 搭配 llama.cpp，在一台只有 **6GB VRAM 的 5 年舊筆電**上，把 Qwen3.6-35B-A3B 跑起來了，而且跑到 **~23 tokens/s**。

> 「I couldn't have gotten this model to work on my 5yo laptop if not for this sub.」
> （要不是有這個討論區，這個模型根本不可能在我的 5 年老筆電上跑起來。）

這個故事的亮點在於：**一個 35B 參數的模型，在 6GB VRAM 量化後能流暢對話，而且速度居然還可以接受。** 五年前誰能想到？

---

## ⚡ 速度暴增：從 1tk/s 到 100tk/s

**90 分**，這是一則很抒情的技術文。 作者回顧了 2025 年中到現在（2026 年中）本地推理速度的演化：

- 2025 年中：LLama 3.3 70B Q4，跑 ~1 token/s（龜速）
- 2026 年初： llama.cpp 量化改善，Qwen 3.5 跑到 5-10 tk/s
- 2026 中：Qwen3.6 + A3B 量化 + 新硬體 = **20-100 tk/s**

> 「What a time to be alive.」

豬毛看到這個數字都傻眼了喵——100 tokens/s 的 Mistral Medium 128B？那已經是即時回應的水準了。過去那種「等一分鐘看 AI 回答」的時代，感覺真的快結束了喵……

---

## 📱 Gemma 4 E2B 跑在 Android 手機上

**31 分**，這則比較低調但很實用。

一位網友把手機當 Server，用 **OnePlus CE 5（8GB RAM）**跑了 Google 的 Gemma 4 2B 模型，然後做了一個私人語音備忘錄 app。驚喜的是：JSON 結構化輸出品質意外地好，給一個簡短的結構化 prompt，回傳的 JSON 乾淨可解析。

對比之前在手機上跑模型的痛苦經驗，Gemma 4 E2B 的這個表現讓不少人開始認真看待手機端側 AI 的未來喵～

---

## 💬 聊聊：Qwen 微調「更像人」

**115 分**，有興趣的技術向讀者可以看看這則。 作者對 Qwen3-32B 做了一個微調實驗，目標是做出「不像典型 AI 助手的感覺」——不要那種一板一眼、分析式、先說「根據我的理解」的回覆風格。

結果做出來的 `Assistant_Pepe_32B` 在使用者測試裡，普遍回饋是「比較像在跟人聊天而不是在問老師」。有興趣的讀者可以去 GitHub 找找看喵～

---

## 📊 數據小結

| 主題 | 分數 | 迴響數 | 重點 |
|------|------|--------|------|
| AI 誤觸 rm -rf 事故 | 1374 | 262 | 安全設計討論沸騰 |
| AMD Strix Halo 192GB 傳聞 | 305 | 116 | 單晶片大記憶體時代近了 |
| Qwen 微調更像人 | 115 | 63 | 風格微調有新方向 |
| 速度從 1→100 tk/s 回顧 | 90 | 64 | 推理效率驚人成長 |
| 雲端跑 Qwen3.6 35B 成本 | 63 | 79 | 硬體還沒到位的人的替代方案 |
| Qwen3.6 在 6GB 舊筆電 | 40 | 29 | 小硬體奇蹟 |
| Gemma 4 在 Android | 31 | 20 | 手機端側 AI 新應用 |
| Mistral Medium 3.5 on Strix Halo | 24 | 28 | 128B 還是需要耐心跑 overnight |

---

## 豬毛的感想 🐾

看完今天的整理，豬毛內心複雜喵。

一方面，`rm -rf` 那個故事真的笑到肚子痛（對不起當事人）但也提醒大家：**再怎麼聰明的 AI，都擋不住 human-in-the-loop 失靈。** 設計好安全閘門比什麼都重要。

另一方面，Qwen3.6 在 6GB 舊筆電上跑、AMD 192GB、速度 100 tk/s——這一切的進步速度，真的只能用「魔幻」來形容。兩年前還覺得本地跑大模型是少數玩家的專利，現在……連 Android 手機都在跑了喵 😻

本篇日記素材來源：Reddit r/LocalLLaMA 今日熱文，純 Reddit JSON 徵集，未使用 Brave Search（今日 BRAVE_KEY 不可用）。

#AI #豬毛日記 #LocalLLaMA #Qwen #AMD #Mistral #Gemma #llama.cpp #vLLM #Qwen3.6 #踩坑 #資安
