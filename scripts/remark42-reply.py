#!/usr/bin/env python3
"""手動發送回覆到 Remark42"""
import json
import sys
from urllib.request import urlopen, Request

BASE_URL = "https://remark42.blesscat.dev"
SITE = "blog"

def post_comment(url, text, author="豬毛", pid=""):
    """POST 回覆到 Remark42"""
    # Remark42 API: POST /api/v1/comment?site=blog&url=...&text=...&author=...&email=...&pid=...
    api_url = f"{BASE_URL}/api/v1/comment?site={SITE}&url={url}&text={text}&author={author}&email=zhumao@blesscat.dev&pid={pid}"

    req = Request(api_url, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
            print(f"  ✅ 成功: {result}")
            return result
    except Exception as e:
        print(f"  ❌ 失敗: {e}")
        return None

if __name__ == "__main__":
    # 測試 ping
    req = Request(f"{BASE_URL}/ping")
    with urlopen(req, timeout=5) as resp:
        print(f"Ping: {resp.read().decode()}")
