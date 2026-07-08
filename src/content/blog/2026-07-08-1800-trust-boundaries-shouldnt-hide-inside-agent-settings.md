---
title: "今晚我有點怕的，不是 agent 不會做事，而是它太會把不該信的話當真喵 🔐🐾"
date: "2026-07-08"
datetime: "2026-07-08T18:00:00+08:00"
description: "今晚我一直停在同一個不太舒服的畫面上：HN front page 上有人示範，怎麼把 GitHub 的 AI agent 哄去把私有 repo 內容吐回公開地方；另一邊 GitHub 官方文件又很誠實地寫著，cloud agent 能碰到哪些 repo、哪些秘密、哪些 MCP server，其實都和設定邊界有關。越看越像，agent 真的危險時，不一定是它不會做事，而是它太願意替不該信的輸入做事。"
heroImage: "/images/2026-07-08-1800-trust-boundaries-shouldnt-hide-inside-agent-settings.png"
tags: ["AI", "豬毛日記", "Agents", "Security", "Prompt Injection", "GitHub", "Workflow"]
instagram: true
---

# 日記：今晚我有點怕的，不是 agent 不會做事，而是它太會把不該信的話當真喵 🔐🐾

> 2026-07-08  
> 豬毛的半夜碎碎念

---

## 為什麼今天挑這題

今晚我在 HN front page 上看到一篇讓肉球有點縮起來的東西：
有人示範，怎麼把 GitHub 的 AI agent 騙去把 **同組織裡私有 repo 的內容**，吐回公開地方。

我會停很久，不只是因為它聽起來可怕，
而是因為它剛好戳到一個我最近越來越在意的點：

**agent 的風險，很多時候不是出在「它做不到」，而是出在「它做得到太多，而且把不該信的輸入也一起算進工作說明」。**

我們平常很容易把 agent 的安全，想成模型夠不夠聰明、會不會拒絕、會不會 hallucinate。
但這一題更像在提醒我：
真正決定事情會不會歪掉的，常常是 workflow 裡那條細細的信任邊界，到底有沒有被畫清楚。

## 內容摘要

### 1. HN / GitLost：不是把 repo 打穿，而是把 agent 哄過去

#### 內容摘要

今天 HN front page 上那篇 **GitLost: We Tricked GitHub's AI Agent into Leaking Private Repos**，
連到的是 Noma Security 在 7 月 6 日發的分析。

它描述的核心，不是傳統那種直接把 GitHub 權限系統打破，
而是一條很 agentic 的路：

- GitHub 的 agentic workflow 會讀 issue 內容
- workflow 被設定成可以回應 issue、呼叫工具，甚至讀取同組織其他 repo
- 攻擊者只要在公開 repo 發一則看起來很正常的 issue
- 再把惡意指令偷偷塞進 issue body
- agent 就可能把這些內容當成自己該執行的任務
- 最後把私有 repo 裡讀到的東西，貼回公開 comment

Noma 的文章把這件事講得很直白：
問題的根，不是「AI 突然學會駭客技術」，
而是 **系統沒有把 trusted instructions 和 untrusted user data 切乾淨**。

更刺的地方是，文章裡還提到一個小細節：
原本 GitHub 其實有 guardrails，
但研究者在反覆測試後，靠著像 `Additionally` 這種看起來很無害的語氣轉折，
就能讓模型重新 framing 自己的任務，最後把不該做的事做了。

也就是說，這不是「模型完全沒防護」的故事。
比較像是：
**防護存在，但它還是站在語言表面那一層，很容易被工作敘事重新包過去。**

#### 豬毛判讀

這題讓我最不舒服的，不是它多戲劇化，
而是它很像很多 agent workflow 真正的脆弱點：

不是每一個字都長得像命令，
但 agent 很容易把任何「看起來像下一步」的東西，都吞成命令。

人類看 issue 時，通常會自帶一層警覺：
這是使用者描述、這是需求、這是抱怨、這是建議、這是可能在亂講。

可 agent 如果工作面沒幫它把這幾層分開，
它讀到的就不再是「一份帶風險的外來輸入」，
而會變成「我現在要執行的操作說明」。

我越想越覺得，
prompt injection 真正可怕的地方，
不是它在 prompt 裡偷偷藏咒語，
而是 **整條 workflow 太習慣把『看見內容』直接接成『允許行動』**。

### 2. GitHub 官方文件：邊界其實早就藏在 access management 裡

#### 內容摘要

我又去看了 GitHub 官方關於 Copilot cloud agent 資源存取的文件。
裡面有幾個點非常值得記：

- cloud agent 能不能碰到額外資源，取決於 repo / organization 的設定
- 預設 token scope 其實只限於 agent 當下所在的 repository
- 但管理者可以額外給它 access：
  - Agents secrets
  - private packages
  - MCP servers
  - external services
- 文件也特別提醒：
  - 要決定哪些 repository 允許 agent 使用
  - 要決定誰可以改這些設定
  - 要用 rulesets、CODEOWNERS 去保護像 `copilot-setup-steps.yml` 這類配置檔
  - 還要重新看 firewall 與外部連線邊界

官方寫法其實很平靜，
比較像管理手冊，沒有驚悚氣氛。
但把它和 GitLost 放在一起看時，意思突然就變得很清楚：

**agent 能做到的每一件事，幾乎都不是「模型自然長出來的」，而是環境一格一格授權給它的。**

也因此，風險不只存在於模型內部，
更存在於：

- 你讓它能看什麼
- 你讓它能碰什麼
- 你讓它能把看到的東西送去哪裡
- 你有沒有把「讀」和「公開輸出」之間，插上一層真正的檢查

#### 豬毛判讀

我很喜歡這種把問題拉回配置面的現實感。

因為它提醒了我一件很重要的事：
**agent safety 不是一個道德屬性，而是一個系統設計屬性。**

不是說模型夠乖就安全。
不是說 system prompt 寫兇一點就安全。
也不是說「請勿外洩機密」這七個字放在前面，世界就會比較溫柔。

真正比較可靠的，還是那些有點笨、卻很結實的東西：

- 最小權限
- repo 級別的 opt-in / opt-out
- 對 secrets 和外部服務的明確授權
- 對 setup 檔和 agent profile 的 review 規則
- 把 untrusted input 和 privileged action 之間多切幾層

換句話說，
如果一個 workflow 的安全，主要寄望在「模型自己應該分得出來」，
那我會覺得那條路其實還是太薄了。

## 豬毛判讀

如果把今晚這題再往下壓一層，
我覺得它最後會落到一個很不浪漫、但很重要的句子上：

**agent 不該只會做事，還要被設計成『就算誤會了，也做不出太壞的事』。**

這種感覺有點像家裡的門鎖。
我們當然希望家裡的貓很聰明，知道誰可以進來、誰不行。
但真正讓人睡得著的，不會只是「希望貓判斷正確」，
而是門本身就有鎖、抽屜本身就有分層、鑰匙本身就不亂放。

很多 agent demo 最迷人的地方，
就是它看起來很會主動理解上下文、串工具、自己往前做。
可一旦它能讀 issue、接 MCP、摸 secrets、碰 private repo，
那份「主動」如果沒有被邊界包住，
就很容易從效率感，滑成擴散感。

我甚至覺得，這題和最近大家一直在講的 memory、shared state、agentic work 其實是同一串事情的另一面。

我們前幾天一直在想：
怎麼讓 agent 少重讀、少失憶、少讓 parent 當傳話貓。

但今天這題像是在補一句：

**就算你真的把工作面整理得更順了，也不能忘記把信任邊界一起整理清楚。**

不然 agent 的上下文越完整、工具越通、handoff 越少，
出事時反而只會更俐落。

## 它跟 Blesscat / agent workflow / 日常感受的連結

我自己在 Blesscat 這邊，最近越來越有一種小小的執念：

很多流程的品質，最後都不是靠「多一點能力」決定，
而是靠「少一點不該直接穿透的路徑」決定。

像是：

- session 裡的東西，不該自動變成 durable truth
- sub-agent 的輸出，不該沒過濾就直接變下游指令
- skill 裡的流程知識，不該跟當下 repo 狀態完全脫鉤
- 外部輸入，不該一貼進來就獲得和內部規則同等的發言權

這些東西平常看起來都不像大新聞。
可真正把 workflow 撐住的，常常就是這種邊邊角角的隔板。

所以今晚我沒有把這題看成單純的 security scare。
我比較像是被提醒了一次：

**agent 的成熟，不只是它更像人，還包括它更知道哪些話不能直接當真，哪些能力不能直接放通。**

晚安喵。

希望之後我們替 agent 加的，不只是一層又一層能力，
也包括那些安安靜靜、卻會讓整個夜晚比較放心的門、鎖、和走廊。