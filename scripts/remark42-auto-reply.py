#!/usr/bin/env python3
"""
Remark42 Auto-Reply Script

用法:
  python3 remark42-auto-reply.py           # 檢查新留言，生成 AI 回覆
  python3 remark42-auto-reply.py --confirm # 確認並發送 pending 回覆到 Remark42
  python3 remark42-auto-reply.py --reset  # 重置所有 pending（重新開始）
"""

import json
import sqlite3
import sys
import os
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

BASE_URL = os.environ.get("REMARK42_URL", "https://remark42.blesscat.dev")
SITE = os.environ.get("REMARK42_SITE", "blog")
DB_FILE = os.environ.get("REMARK42_DB", "/home/blesscat/.hermes/remark42.db")


def get_admin_pass():
    """從環境變數或 pass 取得 Remark42 admin 密碼"""
    import subprocess
    # 先讀環境變數
    admin_pass = os.environ.get("REMARK42_ADMIN_PASS", "")
    if admin_pass:
        return admin_pass
    # fallback 到 pass
    result = subprocess.run(
        ["pass", "show", "nas/remark42"],
        capture_output=True, text=True, timeout=5
    )
    if result.returncode != 0:
        raise RuntimeError(f"pass nas/remark42 failed: {result.stderr.strip()}")
    return result.stdout.strip()


def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS replied_comments (
            comment_id   TEXT PRIMARY KEY,
            article_url  TEXT NOT NULL,
            article_title TEXT,
            comment_text TEXT,
            user_name    TEXT,
            replied_at   TEXT NOT NULL,
            reply_text   TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS pending_reply (
            comment_id   TEXT PRIMARY KEY,
            article_url  TEXT NOT NULL,
            article_title TEXT,
            comment_text TEXT,
            user_name    TEXT,
            comment_time  TEXT,
            ai_reply    TEXT,
            article_text TEXT,
            created_at   TEXT NOT NULL,
            parent_id    TEXT,
            parent_admin_reply_text TEXT
        )
    """)
    conn.commit()
    return conn


def api_get(path):
    url = f"{BASE_URL}{path}"
    req = Request(url, headers={"User-Agent": "remark42-reply-bot/1.0"})
    with urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def api_post(path, payload, admin_pass, method="POST"):
    """POST/PUT JSON to Remark42 API with Basic Auth (admin)"""
    import base64
    url = f"{BASE_URL}{path}"
    data = json.dumps(payload).encode()
    req = Request(url, data=data, headers={
        "Content-Type": "application/json",
        "Authorization": "Basic " + base64.b64encode(f"admin:{admin_pass}".encode()).decode(),
        "User-Agent": "remark42-reply-bot/1.0"
    }, method=method)
    try:
        with urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except HTTPError as e:
        body = e.read().decode()
        raise Exception(f"HTTP {e.code}: {body}")


def fetch_comments():
    data = api_get(f"/api/v1/find?site={SITE}")
    return data.get("comments", [])


def fetch_article_text(url):
    """抓文章內容用於 AI 回覆生成"""
    try:
        req = Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        })
        with urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            import re
            # 拿 title
            title_m = re.search(r'<title>([^<]+)</title>', html)
            title = title_m.group(1) if title_m else ""
            # 拿 meta description
            desc_m = re.search(r'<meta[^>]+name="description"[^>]+content="([^"]+)"', html)
            description = desc_m.group(1) if desc_m else ""
            # 拿 article 文字
            article_m = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL)
            article_text = ""
            if article_m:
                text = re.sub(r'<[^>]+>', '', article_m.group(1))
                article_text = re.sub(r'\s+', ' ', text).strip()[:3000]
            return {
                "title": title,
                "description": description,
                "article_text": article_text,
                "url": url,
            }
    except Exception as e:
        return {"error": str(e), "url": url}


def generate_reply_with_llm(comment_text, article_info):
    """
    預留介面，之後可以替換成實際 LLM call。
    目前直接回 None，讓 cmd_generate 標記為「需要人工生成」。
    """
    return None  # 目前不做，統一在 Discord thread 這裡生成


def load_replied_ids():
    conn = get_db()
    rows = conn.execute("SELECT comment_id FROM replied_comments").fetchall()
    return {r["comment_id"] for r in rows}


def is_admin_comment(comment, admin_user_id="admin"):
    """判斷這則留言是否是 admin 發的"""
    return comment.get("user", {}).get("id", "") == admin_user_id


def load_admin_replied_ids():
    """載入 admin 已回覆過的 comment_id（別人回覆 admin 的，回覆過就不重複通知）"""
    conn = get_db()
    rows = conn.execute("SELECT comment_id FROM replied_comments").fetchall()
    return {r["comment_id"] for r in rows}


def cmd_generate():
    """檢查新留言，生成 AI 回覆（還不發送）"""
    conn = init_db()

    # 先看 pending
    pending = conn.execute("SELECT COUNT(*) FROM pending_reply").fetchone()[0]
    print(f"[ 目前待確認回覆: {pending} 筆 ]\n")

    # 抓所有留言
    print("1. 抓取 Remark42 留言...")
    all_comments = fetch_comments()
    print(f"   總共 {len(all_comments)} 筆留言\n")

    # 建立 comment_id → comment 查詢表（用於查 parent）
    comment_map = {c["id"]: c for c in all_comments}

    # 已回覆
    replied_set = load_replied_ids()
    replied_count = conn.execute("SELECT COUNT(*) FROM replied_comments").fetchone()[0]
    print(f"2. 已回覆: {replied_count} 筆\n")

    pending_ids = {r["comment_id"] for r in conn.execute("SELECT comment_id FROM pending_reply").fetchall()}

    # 過濾新留言
    # 情況一：頂層留言（pid=""）還沒處理過
    # 情況二：回覆別人的留言，但那個「別人」是 admin → 也要通知
    new_unreplied = []
    for c in all_comments:
        cid = c["id"]
        pid = c.get("pid", "")

        # 跳過已回覆或已 pending 的
        if cid in replied_set or cid in pending_ids:
            continue

        if pid == "":
            # 情況一：頂層留言
            new_unreplied.append(c)
        elif pid in comment_map and is_admin_comment(comment_map[pid]):
            # 情況二：有人回覆 admin 的留言
            new_unreplied.append(c)

    print(f"3. 新留言待處理: {len(new_unreplied)} 筆（頂層 {sum(1 for c in new_unreplied if c.get('pid','')=='')} + 回覆 admin {sum(1 for c in new_unreplied if c.get('pid','')!='')})")

    if not new_unreplied:
        print("✅ 沒有新留言")
        return

    print("=" * 60)
    for i, comment in enumerate(new_unreplied, 1):
        comment_id = comment["id"]
        user_name = comment.get("user", {}).get("name", "anonymous")
        comment_text = comment.get("orig", comment.get("text", ""))
        article_url = comment.get("locator", {}).get("url", "")
        article_title = comment.get("title", "")
        comment_time = comment.get("time", "")[:10]
        pid = comment.get("pid", "")

        is_reply_to_admin = pid != "" and pid in comment_map and is_admin_comment(comment_map[pid])

        print(f"--- 留言 #{i} ---")
        if is_reply_to_admin:
            parent = comment_map[pid]
            parent_user = parent.get("user", {}).get("name", "?")
            parent_text = parent.get("orig", "")[:60]
            print(f"  🔁 回覆 admin 的留言：「{parent_text}...」")
        print(f"  作者: {user_name}  |  時間: {comment_time}")
        print(f"  文章: {article_title}")
        print(f"  內容: {comment_text[:200]}")
        print(f"  URL:  {article_url}")

        # 抓文章內容
        print(f"  抓取文章中...")
        article_info = fetch_article_text(article_url)
        if "error" in article_info:
            print(f"  ⚠️ 無法抓取文章: {article_info['error']}")
            ai_reply = "[無法生成回覆]"
        else:
            print(f"  📄 文章: {article_info.get('title','')[:60]}")
        # 生成回覆
        ai_reply = generate_reply_with_llm(comment_text, article_info)

        if ai_reply is None:
            # 尚未生成 AI 回覆，先標記，稍後在 Discord thread 生成
            ai_reply = "[待生成]"
        else:
            print(f"  💬 AI 回覆預覽:")
            print(f"     {ai_reply[:200]}")

        is_reply_to_admin = pid != "" and pid in comment_map and is_admin_comment(comment_map[pid])
        parent_admin_text = comment_map[pid].get("orig", "")[:100] if is_reply_to_admin else None

        # 存入 pending
        conn.execute("""
            INSERT OR REPLACE INTO pending_reply
              (comment_id, article_url, article_title, comment_text,
               user_name, comment_time, ai_reply, article_text, created_at,
               parent_id, parent_admin_reply_text)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (comment_id, article_url, article_title, comment_text[:500],
              user_name, comment_time, ai_reply,
              article_info.get("article_text","")[:2000],
              datetime.utcnow().isoformat(),
              pid if is_reply_to_admin else None,
              parent_admin_text))
        conn.commit()
        print()

    print("=" * 60)
    print(f"✅ 已生成 {len(new_unreplied)} 筆回覆，請到 Discord thread 確認")


def api_delete(path, payload=None):
    """DELETE via PUT to Remark42 API (delete uses PUT with {"delete": true})"""
    return api_post(path, payload if payload else {}, method="PUT")


def cmd_confirm():
    """確認後發送 pending 回覆到 Remark42"""
    conn = get_db()
    pending = conn.execute("SELECT * FROM pending_reply").fetchall()

    if not pending:
        print("沒有待確認的回覆")
        return

    admin_pass = get_admin_pass()
    print(f"確認發送 {len(pending)} 筆回覆到 Remark42...\n")

    for row in pending:
        reply_text = row["ai_reply"]
        if reply_text in ("[無法生成回覆]", "N/A", "") or reply_text.startswith("[LLM 錯誤"):
            print(f"⏭  跳過（不回覆）: {row['comment_id'][:8]} | {row['comment_text'][:30]}")
            conn.execute("INSERT INTO replied_comments VALUES (?,?,?,?,?,?,?)",
                (row["comment_id"], row["article_url"], row["article_title"],
                 row["comment_text"], row["user_name"],
                 datetime.utcnow().isoformat(), reply_text))
            conn.execute("DELETE FROM pending_reply WHERE comment_id=?", (row["comment_id"],))
            conn.commit()
            continue

        print(f"  → 發送: {reply_text[:50]}...")
        try:
            result = api_post("/api/v1/comment", {
                "text": reply_text,
                "locator": {"url": row["article_url"], "site": SITE},
                "pid": row["comment_id"]  # thread reply to original comment
            }, admin_pass)
            new_id = result.get("id", "")
            print(f"     ✅ 成功！comment id: {new_id[:8]}")
            conn.execute("""
                INSERT INTO replied_comments
                (comment_id, article_url, article_title, comment_text, user_name, replied_at, reply_text)
                VALUES (?,?,?,?,?,?,?)
            """, (row["comment_id"], row["article_url"], row["article_title"],
                  row["comment_text"], row["user_name"],
                  datetime.utcnow().isoformat(), reply_text))
            conn.execute("DELETE FROM pending_reply WHERE comment_id=?",
                (row["comment_id"],))
            conn.commit()
        except Exception as e:
            print(f"     ❌ 失敗: {e}")

    print("\n✅ 確認流程完成")


def cmd_reset():
    """重置所有 pending"""
    conn = get_db()
    n = conn.execute("SELECT COUNT(*) FROM pending_reply").fetchone()[0]
    conn.execute("DELETE FROM pending_reply")
    conn.commit()
    print(f"✅ 已清除 {n} 筆 pending 回覆")


def cmd_status():
    """顯示狀態"""
    conn = init_db()
    pending = conn.execute("SELECT COUNT(*) FROM pending_reply").fetchone()[0]
    replied = conn.execute("SELECT COUNT(*) FROM replied_comments").fetchone()[0]
    print(f"remark42 回覆狀態:")
    print(f"  已回覆:   {replied} 筆")
    print(f"  待確認:   {pending} 筆")
    if pending > 0:
        print(f"\n  待確認內容:")
        for r in conn.execute("SELECT comment_id, user_name, comment_text, ai_reply FROM pending_reply").fetchall():
            print(f"    [{r['comment_id'][:8]}] {r['user_name']}: {r['comment_text'][:40]}")


def cmd_update_reply():
    """更新某筆 pending 的 ai_reply 內容（AI 生成後寫入）
    
    用法：python3 remark42-auto-reply.py --update-reply <comment_id> "<回覆內容>"
    """
    if len(sys.argv) < 4:
        print("用法: --update-reply <comment_id> <回覆內容>")
        sys.exit(1)
    comment_id = sys.argv[2]
    reply_text = sys.argv[3]
    conn = get_db()
    row = conn.execute("SELECT COUNT(*) FROM pending_reply WHERE comment_id=?", (comment_id,)).fetchone()[0]
    if row == 0:
        print(f"❌ 找不到 comment_id: {comment_id[:8]}")
        sys.exit(1)
    conn.execute("UPDATE pending_reply SET ai_reply=? WHERE comment_id=?", (reply_text, comment_id))
    conn.commit()
    print(f"✅ 已更新 ai_reply：{reply_text[:60]}")


def cmd_notify():
    """
    輸出所有 pending 回覆（乾淨格式），用於轉發到 Discord thread。
    輸出格式：每筆留言一個 block，方便我貼給你確認。
    """
    conn = get_db()
    rows = conn.execute("SELECT * FROM pending_reply").fetchall()

    if not rows:
        print("沒有待確認的回覆")
        return

    print(f"📝 待確認回覆（共 {len(rows)} 筆）\n")
    print("=" * 60)

    # 重建 comment_map（用於判斷回覆 admin 情境）
    all_comments = fetch_comments()
    comment_map = {c["id"]: c for c in all_comments}

    for i, r in enumerate(rows, 1):
        print(f"\n【留言 #{i}】")
        if r["parent_id"]:
            print(f"  🔁 回覆 admin 的留言：「{r['parent_admin_reply_text']}...」")
        print(f"  作者: {r['user_name']}  |  時間: {r['comment_time']}")
        print(f"  文章: {r['article_title']}")
        print(f"  留言: {r['comment_text']}")
        # 顯示文章摘要（方便生成回覆）
        article_text = r['article_text'] or ""
        if article_text:
            print(f"文章內容摘要: {article_text[:300]}...")
        print(f"\n💬 建議回覆:")
        print(f"{r['ai_reply']}")
        print(f"\nID: `{r['comment_id']}`")
        print("-" * 40)
    print("=" * 60)
    print(f"\n回覆請回覆此訊息，格式：")
    print(f"  確認發送 → 全部確認")
    print(f"  確認 #N  → 只發送第 N 筆")
    print(f"  跳過 #N  → 跳過第 N 筆（不改回覆）")
    print(f"  修改 #N:新內容 → 修改第 N 筆回覆")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        cmd_generate()
    elif sys.argv[1] == "--confirm":
        cmd_confirm()
    elif sys.argv[1] == "--reset":
        cmd_reset()
    elif sys.argv[1] == "--status":
        cmd_status()
    elif sys.argv[1] == "--notify":
        cmd_notify()
    elif sys.argv[1] == "--update-reply":
        cmd_update_reply()
    else:
        print(f"用法: {sys.argv[0]} [--confirm|--reset|--status|--notify|--update-reply]")
