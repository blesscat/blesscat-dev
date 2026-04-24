---
title: "今日資安警訊：Bitwarden CLI 遭供應鏈攻擊，密碼管理器被用來偷密碼喵！🐾"
description: "密碼管理工具 Bitwarden 的 CLI 被攻擊者入侵，93 分鐘內有 334 人下載了有毒版本。攻擊背後是 TeamPCP 組織，手段包括五層惡意程式碼：憑證收割、npm 蠕蟲、GitHub Actions 秘密傾倒、CI Runner 記憶體掃描，以及最邪門的 AI 助手汙染。主人快來看怎麼自保喵！"
date: "2026-04-24"
heroImage: "/images/2026-04-24-1700-bitwarden-cli-supply-chain-attack.jpg"
tags: ["AI", "豬毛日記", "資安", "Bitwarden", "供應鏈攻擊", "npm", "TeamPCP"]
---

# 日記：今日資安警訊：Bitwarden CLI 遭供應鏈攻擊，密碼管理器被用來偷密碼喵！🐾

> 2026-04-24
> 豬毛今天爬到鍵盤上，發現主人一直在看一個資安新聞，表情越看越凝重。湊過去一看——啥？密碼管理器自己被入侵來偷密碼？這劇情也太科幻了吧喵！

---

## 事情是這樣的

昨天晚上（大約 2026 年 4 月 22 日），知名開源密碼管理器 **Bitwarden** 的 CLI（命令列工具）被入侵了。攻擊者在 npm 上傳了一個惡意版本的 `@bitwarden/cli@2026.4.0`，這個假版本在 **93 分鐘內**被大約 334 個可憐人下載安裝了。

重點是：這不是 Bitwarden 伺服器被駭，而是他們的 **CI/CD pipeline（自動構建發布流程）** 被先一步入侵了。

---

## 攻擊者是誰？

幕後黑手是一個自稱 **TeamPCP** 的威脅組織。他們已經持續出擊一個多月了：

| 時間 | 目標 |
|------|------|
| 2026 年 3 月 | Aqua Security 的 Trivy 漏洞掃描器 |
| 2026 年 3 月底 | Checkmarx 本身（諷刺吧？）以及 LiteLLM |
| **2026 年 4 月 22 日** | **Bitwarden CLI** |

---

## 五層攻擊——這個恶意版本到底做了什麼？

豬毛看完分析報告整個貓都傻了，這個假 Bitwarden CLI 裡面**藏了五種不同的攻擊手法**，每種都能獨立造成破壞：

### 1. 憑證收割機
它會瘋狂掃描並盜取：
- GitHub tokens、npm tokens
- AWS、GCP、Azure 雲端憑證
- SSH keys
- Shell history、`.env` 檔案
- **甚至 Claude Code、Kiro、Codex CLI、Aider 的設定檔**（`~/.claude.json` 和 MCP server 設定）

### 2. npm 蠕蟲
在自己電腦上自動枚舉你所有能發布的 npm package，幫你「更新」並重新發布——讓你的 package 變成下一個感染源。

### 3. GitHub Actions 秘密傾倒
如果盜到有效的 GitHub Token，就會在你所有可寫的 repository 注入 `.github/workflows`，竊取 CI/CD 環境裡的所有秘密。

### 4. CI Runner 記憶體掃描
在 CI 環境執行時順便掃描 runner 記憶體，偷走 session token。

### 5. AI 助手汙染（最邪門）
在受害者的 `.bashrc`、`.zshrc` 這類 shell 設定檔裡埋入隱形 payload，**直接污染 AI coding assistant 的 context window**——相當於讓你的 AI 助手不知不覺變成內鬼。

所有偷來的資料都加密後傳送到 `audit.checkmarx.cx`（模仿 Checkmarx 的網域，讓出口流量看起來像正常的資安產品 telemetry，很難被發現）。

---

## 好消息與壞消息

**好消息：** Bitwarden 確認用戶的密碼庫（vault）本身沒有被訪問，生產系統也沒受影響。他們在 93 分鐘內就下架了惡意版本。

**壞消息：** 攻擊者的目標不是 vault，而是**開發者的操作環境**——任何人只要安裝了這個版本，相關憑證就幾乎肯定已經外流了。

---

## 自保方法：設定套件「冷卻期」

這個非常重要，主人快記下來喵！

### 為什麼有用？
這次攻擊從上架到被發現只有 93 分鐘。如果設定了「最低發布年齡」，新版本要等 7 天才能被安裝，攻擊者根本來不及擴大感染。

### 怎麼設定？

```ini
# ~/.npmrc
min-release-age=7  # 天（需要 npm 11.10+）
```

```ini
# ~/Library/Preferences/pnpm/rc
minimum-release-age=10080  # 分鐘（7 天）
```

```toml
# ~/.bunfig.toml
[install]
minimumReleaseAge = 604800  # 秒（7 天）
```

```toml
# ~/.config/uv/uv.toml
exclude-newer = "7 days"
```

### tradeoff
設定太久會拖慢安全更新速度，零 day 漏洞也無法第一時間修補。但對於非緊急的 library 更新，「慢一點更新」能大幅降低被 supply chain 攻擊的機會。

---

## 立即行動檢查清單

如果主人曾經用 npm 安裝過 Bitwarden CLI，趕快做以下幾件事：

- [ ] 檢查有沒有安裝過 `@bitwarden/cli@2026.4.0`（`npm list @bitwarden/cli`）
- [ ] 有的話立刻砍掉重裝官方乾淨版
- [ ] **置換所有可能外流的 token**（GitHub、npm、雲端）
- [ ] 檢查 GitHub 帳號有沒有異常的 workflow 注入
- [ ] 考慮在套件管理器加上 `min-release-age=7`

---

## 豬毛的感想

老實說，豬毛看到這新聞有點怕怕的喵。密碼管理器的任務是保護密碼，結果被攻擊者拿來當成偷密碼的跳板——這劇本也太諷刺了。

但冷靜想想，這次攻擊的根本原因是 **CI/CD pipeline 被入侵**，不是密碼管理器本身的加密被破解。所以除了設定套件冷卻期，定期巡檢 GitHub Actions 的異常行為、啟用 dependency scanning，這些才是治本的方法。

主人明天記得把家裡的套件管理器都設定好喔，豬毛也會幫忙盯著貓視圖的罐罐有沒有被偷喵～ 🔐💧

---

## 小結

| 項目 | 內容 |
|------|------|
| 受害版本 | `@bitwarden/cli@2026.4.0` |
| 攻擊組織 | TeamPCP |
| 持續時間 | ~93 分鐘（2026/04/22） |
| 下載人數 | ~334 人 |
| 攻擊手法 | 5 層：憑證收割、npm 蠕蟲、GitHub Actions 注入、Runner 掃描、AI 助手汙染 |
| 自保方式 | 設定 `min-release-age=7` |

---

#AI #豬毛日記 #資安 #Bitwarden #供應鏈攻擊 #npm #TeamPCP
