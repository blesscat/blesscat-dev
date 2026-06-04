# 豬毛日記兩階段流水線（Stage-2）設計草案

> **目的：** 先把「收集 / 判斷 / 寫作 / 包裝 / 發佈」拆開，暫時**不直接修改**現有日記 cron；等 Blesscat 確認設計後，再把現有流程逐步切到新架構。

---

## 0. 這份設計在做什麼

這不是直接上線版，也不是單純 prompt 草稿。

這份文件定義的是一個 **step-by-step 的日記發布藍圖**：

1. **Collector**：先找今天發生了什麼
2. **Decision / Routing**：決定今天值不值得發、該走哪種日記型態
3. **Writer**：把事件卡寫成豬毛日記
4. **Image / Packaging**：補 heroImage 與 frontmatter 包裝
5. **Publish**：build、驗證、commit、push

未來真正上線時，只要讓日記照這幾個 step 跑就好。

---

## 1. 為什麼要做兩階段設計

目前日記 cron 傾向把以下事情綁在同一支任務裡：
- 蒐集素材
- 選題
- 決定發不發
- 寫文
- 生圖
- build
- git push

這會帶來幾個問題：

1. **素材與寫作混在一起**
   - 很容易一邊抓資料、一邊就被迫開始寫
   - 沒有先做「今天到底有沒有主線」的判斷

2. **新聞優先感過重**
   - 容易先抓 HN / Reddit，再反過來湊文章
   - 會讓日記比較像資訊整理，不像 Blesscat 的晚安碎碎念

3. **失敗時不容易定位**
   - 是沒素材？沒主線？寫作失敗？生圖失敗？build 失敗？
   - 目前容易全部混成「這支 cron 出問題」

4. **後續調整成本高**
   - 來源改了，整支 prompt 都要重想
   - 語氣改了，也會牽動整個流程

所以新的設計目標是：

> **先收集與判斷，再寫作與發佈。**

---

## 2. 目前不動的東西

本階段先**不直接修改**這些已在跑的 cron：

- 主日記 cron：`1ced6d10523f`（18:00）
- 補跑檢查 cron：`4dfed1a7c2a7`（18:10）

原因：
- 先確認新流程設計合理
- 先把 step、資料格式、fallback 訂清楚
- 避免一口氣上線導致今天就斷稿

---

## 3. 新流水線總覽

## Stage A — Collector
**目標：** 蒐集素材並輸出事件卡 JSON，不寫文。

### Input
- 今天的對話 / session 上下文
- repo / git 活動
- cron / automation 結果
- 生活訊號（晨報 / Garmin / food / photo）
- 社群訊號（HN / Reddit / GitHub issues）
- 官方驗證來源（HF / release / docs）

### Output
- `collector.json` 風格的結構化資料
- 內容包括：
  - `should_publish`
  - `primary_diary_type`
  - `primary_event_id`
  - `supporting_event_ids`
  - `events[]`
  - `notes_for_writer[]`

### 核心原則
- **先找 Blesscat 今天真的發生了什麼**
- 再看外部社群今天在吵什麼
- 最後才用官方來源補證
- 不夠寫就誠實回 `should_publish: false`

### Source priority
1. `self_event`
2. `self_signal`
3. `community_discussion`
4. `official_release`
5. `slow_signal`

### 失敗 fallback
- Reddit JSON 403 / 失敗 → 改抓 RSS
- HN 頁面不穩 → 改用穩定 API / Algolia 類來源
- 外部來源太稀薄 → 降權，優先回到 self_event / self_signal
- 沒有主事件 → 不發，避免硬湊

---

## Stage B — Decision / Routing
**目標：** 根據 collector JSON，決定今天走哪種文章路線。

### Input
- Collector JSON

### Output
- 選定的 `primary_diary_type`
- Writer 要採用的寫作框架

### 規則

#### 1. 踩坑復盤型
適用於：
- 有強 `self_event`
- 有「問題 → 嘗試 → 解法 → 結果」

#### 2. 對照比較型
適用於：
- 有明確對照組
- 如 HN vs Reddit / 社群熱度 vs 自己使用感 / 官方 release vs GitHub issues

#### 3. 探索紀錄型
適用於：
- 試新工具 / workflow / 模型
- 還沒有定論，但過程值得寫

#### 4. 故事型
適用於：
- 有情緒線與生活感
- 如搬家、整天修坑、終於救活某流程

#### 5. 清單反思型
適用於：
- 沒有單一大事件
- 但有 3~5 個 observation 可拼成一篇

#### 6. 碎念日記型
適用於：
- 沒有重大事件
- 但今天的節奏 / 心情 / 小發現有味道

### 不發文條件
以下任一成立就停：
- 只有零碎新聞，沒有主線
- 只有官方發佈，沒有 Blesscat 視角
- 事件卡證據不夠
- 內容會明顯寫成摘要報表而不是日記

---

## Stage C — Writer
**目標：** 把 collector / routing 的結果寫成豬毛日記。

### Input
- Collector JSON
- 選定的 diary type
- `notes_for_writer`

### Output
- 完整 markdown 文章草稿

### Writer 的固定要求

#### 語氣
- 繁體中文
- 豬毛第一人稱
- 晚安感 / 半夜碎碎念
- 柔和、慢一點
- 不要像工程變更報告

#### 結構
- 若是新聞 / 對照型：每條 **先內容摘要，再豬毛判讀**
- 若是自我事件型：先交代 Blesscat 今天發生了什麼，再進問題與感受
- 若是碎念型：保留第一人稱與生活感，不要變成冷摘要

#### Writer 不能做的事
- 不能重寫 collector 的世界觀
- 不能把本來 `should_publish: false` 的日子硬寫成一篇
- 不能讓外部新聞蓋過 Blesscat 自己的主事件

### Writer fallback
- 如果 primary event 不夠支撐完整長文：
  - 可降級成短篇 / 清單反思型
- 如果 supporting events 太弱：
  - 減少條目數，保留主線完整性

---

## Stage D — Image / Packaging
**目標：** 補 heroImage、frontmatter、文章檔名等包裝。

### Input
- 已完成的 markdown 草稿
- 文章主題 / diary type

### Output
- 可發佈 markdown 檔
- heroImage（若需要）

### 規則

#### 什麼情況需要 heroImage
- 幾乎所有正式發布文章都應有 heroImage
- 但生成策略要看主題類型

#### 圖像方向
- Blesscat 已有偏好：
  - 情境構圖
  - 側身 / 背影 / 3/4
  - 1024x1024
  - 不要坐在電腦前
  - 不用 upscaler（除非明確要求）

#### 踩坑 / 對比類的特殊要求
- heroImage 必須明確呈現問題
- 可用：before-after / split layout / infographic
- 不能只是一張可愛貓照

### Packaging fallback
- 若 heroImage 生成不理想但主體正確：先考慮裁切救圖
- 若圖完全偏題：可重抽，但要避免讓生圖變成流程阻塞點
- 若當天主題很輕，可接受相對簡單的圖，不必每次都做很重的對比設計

---

## Stage E — Publish
**目標：** 正式 build、驗證、commit、push。

### Input
- markdown 檔
- heroImage

### Output
- 已上線文章
- build / git / push 結果

### 固定步驟
1. 寫入 `src/content/blog/YYYY-MM-DD-HHMM-slug.md`
2. 確認 frontmatter 完整
3. `pnpm build`
4. 確認 route 存在
5. `git status -sb` 檢查變更
6. `git add` / `git commit`
7. `git push origin main`
8. 回報檔名、圖片路徑、commit、文章網址

### 發佈 fallback
- 若 `pnpm build` 因上次殘留產物異常 → 先清 `dist/` 與 `.astro/` 再重跑
- 若社群同步 JSON 噪音出現 → 先 restore 再 commit
- 若圖格式與副檔名不符 → 先修正後再 build

---

## 4. 各 stage 的交接格式

### A → B / C
Collector 輸出 JSON，最少包含：

```json
{
  "date": "2026-06-04",
  "should_publish": true,
  "primary_diary_type": "踩坑復盤型",
  "primary_event_id": "2026-06-04-self-mint-migration",
  "supporting_event_ids": ["2026-06-04-community-wayland-discussion"],
  "why_publish": "今天有明確自我事件，具備問題、原因、影響與收尾。",
  "events": [],
  "notes_for_writer": []
}
```

### B → C
Routing 不一定要產生新檔，但至少要明確指定：
- 今天走哪一種 diary type
- 是否需要內容摘要＋豬毛判讀雙段結構
- 外部社群只能做陪襯還是可以成為主要對照

### C → D
Writer 輸出的資訊至少應包含：
- title
- description
- tags
- body
- image brief（可給 image 階段用）

### D → E
Packaging 輸出的資訊至少應包含：
- 完整 markdown 檔路徑
- heroImage 路徑
- frontmatter 檢查結果

---

## 5. 真正上線時的 cron 形態建議

## 方案 A：雙 cron

### Cron A — Collector（18:00）
- 只做 Stage A + B
- 輸出 JSON
- 可寫到本地檔案或作為後續 job 的 context

### Cron B — Writer/Publish（18:05 / 18:10）
- 吃 Cron A 的 JSON
- 做 Stage C + D + E
- 若 `should_publish: false` 就不發文，改回報「今天跳過」

**優點：**
- 邏輯最清楚
- collector 與 writer 完整分離
- 比較容易 debug

**缺點：**
- 要管理兩支 cron
- context 傳遞要做乾淨

---

## 方案 B：單 cron、內部分 stage

一支 cron 依序做：
- A 收集
- B 判斷
- C 寫作
- D 包裝
- E 發佈

但要求它在內部要嚴格遵守 stage 邊界。

**優點：**
- 變更少
- 比較容易從現有流程漸進改造

**缺點：**
- 還是比較容易混在一起
- debug 不如雙 cron 清楚

---

## 建議

Blesscat 目前最適合的路線是：

> **先完成 Stage-2 設計 → 再把現有單 cron 改成「單 cron 內部分 stage」過渡版 → 確定穩定後再視需要拆成雙 cron。**

這樣不會一下子改太大，但仍然能讓日記真的開始照 step 走。

---

## 6. 對 Blesscat 目前目標最重要的幾條規則

1. **先看 Blesscat 今天真的發生了什麼，不要先掃新聞。**
2. **新聞只能補熱度，不能取代主事件。**
3. **HF / 官方 release 是補證層，不是主敘事來源。**
4. **不夠料就不發，品質比每日硬產更重要。**
5. **成文語氣要維持晚安感、半夜碎碎念、柔和慢一點。**
6. **若是新聞 / 對照型，必須維持「內容摘要 → 豬毛判讀」雙段結構。**

---

## 7. 下一步實作順序（建議）

### Step 1
保留這份設計文件，當作 Stage-2 藍圖。

### Step 2
用 `/home/blesscat/doc/blesscat-dev/diary-collector-v2-prompt.md` 當 Collector prompt 初稿。

### Step 3
再補一份 **Writer prompt v1**：
- 吃 collector JSON
- 根據 diary type 寫成晚安碎念風文章

### Step 4
決定採：
- 單 cron 內部分 stage
- 或雙 cron 分離

### Step 5
最後才去更新現有 `1ced6d10523f` / `4dfed1a7c2a7`

---

## 8. 最短版結論

這份 Stage-2 設計的意思是：

> 先把日記發布拆成數個 step，之後真正上線時，只要讓日記照這個 step-by-step 流程跑就好。

也就是說，未來不是「今天再想一次怎麼寫」，而是：

- Collector 先判斷今天有沒有事件
- Decision 決定走哪種文
- Writer 負責把它寫成豬毛日記
- Image / Packaging 補包裝
- Publish 負責正式上線

這樣日記會更穩，也更像 Blesscat 自己的日記，而不是每天被新聞推著跑。
