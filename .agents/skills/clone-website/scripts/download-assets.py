#!/usr/bin/env python3
"""Download HTML-referenced assets and optionally rewrite a separate HTML file."""

import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("page_url")
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--rewrite-html", type=Path)
    parser.add_argument("--allow-external", action="store_true")
    parser.add_argument("--max-bytes", type=int, default=50 * 1024 * 1024)
    args = parser.parse_args()
    with urlopen(Request(args.page_url, headers={"User-Agent": "clone-website/1.0"}), timeout=30) as response:
        html, final_url = response.read().decode("utf-8", errors="replace"), response.geturl()
    origin = urlparse(final_url).netloc
    raw = re.findall(r'(?:src|poster|data)=["\']([^"\']+)|srcset=["\']([^"\']+)|url\(\s*["\']?([^\)"\']+)', html, re.I)
    urls = set()
    for groups in raw:
        value = next(item for item in groups if item)
        for candidate in value.split(",") if groups[1] else [value]:
            url = urljoin(final_url, candidate.strip().split()[0])
            if urlparse(url).scheme in {"http", "https"}:
                urls.add(url)
    results, replacements = [], {}
    for url in sorted(urls):
        if not args.allow_external and urlparse(url).netloc != origin:
            results.append({"url": url, "status": "skipped", "reason": "external-origin"})
            continue
        if re.search(r"\.m3u8(?:$|\?)", url, re.I):
            results.append({"url": url, "status": "skipped", "reason": "stream-manifest"})
            continue
        try:
            with urlopen(Request(url, headers={"User-Agent": "clone-website/1.0"}), timeout=30) as response:
                data = response.read(args.max_bytes + 1)
                if len(data) > args.max_bytes:
                    raise ValueError(f"asset exceeds {args.max_bytes} bytes")
                content_type = response.headers.get_content_type()
            name = Path(urlparse(url).path).name or "asset"
            path = Path(f"{name}-{hashlib.sha1(url.encode()).hexdigest()[:10]}")
            local = args.output / path
            args.output.mkdir(parents=True, exist_ok=True)
            local.write_bytes(data)
            result = {"url": url, "status": "downloaded", "path": str(local), "bytes": len(data), "contentType": content_type}
            results.append(result)
            replacements[url] = str(local)
        except Exception as error:  # noqa: BLE001
            results.append({"url": url, "status": "failed", "reason": str(error)})
    manifest = {"source": final_url, "assets": results}
    (args.output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    if args.rewrite_html:
        rewritten = html
        for origin_url, local_path in replacements.items():
            rewritten = rewritten.replace(origin_url, local_path)
        args.rewrite_html.parent.mkdir(parents=True, exist_ok=True)
        args.rewrite_html.write_text(rewritten, encoding="utf-8")
    print(f"Downloaded {sum(item['status'] == 'downloaded' for item in results)} asset(s); skipped {sum(item['status'] == 'skipped' for item in results)}; failed {sum(item['status'] == 'failed' for item in results)}.")


if __name__ == "__main__":
    main()
