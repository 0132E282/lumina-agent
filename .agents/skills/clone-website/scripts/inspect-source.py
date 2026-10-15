#!/usr/bin/env python3
"""Create a read-only HTML/source inventory."""

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin


def values(html: str, pattern: str) -> list[str]:
    return sorted({urljoin("", match) for match in re.findall(pattern, html, re.I) if match})


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("page_url")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    with urlopen(Request(args.page_url, headers={"User-Agent": "clone-website/1.0"}), timeout=30) as response:
        html = response.read().decode("utf-8", errors="replace")
        final_url = response.geturl()
        request = {"inputUrl": args.page_url, "finalUrl": final_url, "status": response.status, "statusText": response.reason, "contentType": response.headers.get_content_type(), "redirected": final_url != args.page_url, "accessible": 200 <= response.status < 300}
    resolve = lambda items: sorted({urljoin(final_url, item) for item in items if urljoin(final_url, item).startswith(("http:", "https:"))})
    tags = ["header", "nav", "main", "section", "article", "aside", "footer", "form"]
    inventory = {
        "pageUrl": final_url,
        "title": next(iter(re.findall(r"<title\b[^>]*>(.*?)</title>", html, re.I | re.S)), "").strip() or None,
        "viewport": next(iter(re.findall(r'<meta\b[^>]*name=["\']viewport["\'][^>]*content=["\']([^"\']+)', html, re.I)), None),
        "html": {"bytes": len(html.encode()), "doctype": bool(re.match(r"\s*<!doctype html", html, re.I)), "semanticTags": {tag: len(re.findall(fr"<{tag}\b", html, re.I)) for tag in tags}},
        "stylesheets": resolve(re.findall(r'<link\b[^>]*rel=["\'][^"\']*stylesheet[^"\']*["\'][^>]*href=["\']([^"\']+)', html, re.I)),
        "inlineStyleBlocks": len(re.findall(r"<style\b", html, re.I)),
        "scripts": resolve(re.findall(r'<script\b[^>]*src=["\']([^"\']+)', html, re.I)),
        "images": resolve(re.findall(r'<(?:img|source|video|audio)\b[^>]*(?:src|poster)=["\']([^"\']+)', html, re.I)),
        "fonts": resolve(re.findall(r"@font-face[\s\S]*?src:\s*url\(\s*[\"']?([^\)\"']+)", html, re.I)),
        "inlineStyleUrls": resolve(re.findall(r"url\(\s*[\"']?([^\)\"']+)", html, re.I)),
        "links": resolve(re.findall(r'<a\b[^>]*href=["\']([^"\']+)', html, re.I)),
    }
    report = {"checkedAt": datetime.now(timezone.utc).isoformat(), "request": request, "inventory": inventory}
    text = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    print(text, end="")
    if not request["accessible"]:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
