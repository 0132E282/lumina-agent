#!/usr/bin/env python3
"""Download same-origin clone assets and write a traceable mapping.json."""

import argparse
import hashlib
import json
import mimetypes
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

MAX_BYTES = 50 * 1024 * 1024
URL_RE = re.compile(r"(?:src|poster|data|href)=[\"']([^\"']+)|url\(\s*[\"']?([^\)\"']+)", re.I)
SRCSET_RE = re.compile(r"srcset=[\"']([^\"']+)[\"']", re.I)


def fetch(url: str) -> tuple[bytes, str, str]:
    with urlopen(Request(url, headers={"User-Agent": "clone-website/1.0"}), timeout=30) as response:
        data = response.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            raise ValueError(f"asset exceeds {MAX_BYTES} bytes")
        return data, response.headers.get_content_type(), response.geturl()


def resolve(raw: str, base: str) -> str | None:
    value = raw.strip()
    if not value or value.startswith("#") or re.match(r"(?:data|blob|javascript):", value, re.I):
        return None
    result = urljoin(base, value)
    return result if urlparse(result).scheme in {"http", "https"} else None


def kind(url: str, content_type: str) -> str:
    value = f"{url} {content_type}".lower()
    if "video/" in value or re.search(r"\.(mp4|webm|ogv|mov)(?:$|\?)", value):
        return "videos"
    if "font" in value or re.search(r"\.(woff2?|ttf|otf|eot)(?:$|\?)", value):
        return "fonts"
    if "image/" in value or re.search(r"\.(avif|gif|jpe?g|png|svg|webp)(?:$|\?)", value):
        return "images"
    return "other"


def save_asset(root: Path, origin: str, data: bytes, content_type: str) -> dict:
    bucket = kind(origin, content_type)
    name = Path(urlparse(origin).path).name or "asset"
    suffix = Path(name).suffix or mimetypes.guess_extension(content_type) or ""
    stem = Path(name).stem or "asset"
    digest = hashlib.sha1(origin.encode()).hexdigest()[:10]
    local = Path("temp") / bucket / f"{stem}-{digest}{suffix}"
    (root / local).parent.mkdir(parents=True, exist_ok=True)
    (root / local).write_bytes(data)
    return {"originUrl": origin, "localPath": local.as_posix(), "kind": bucket, "status": "downloaded", "bytes": len(data), "contentType": content_type}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("page_url")
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--allow-external", action="store_true")
    args = parser.parse_args()
    page_data, _, final_url = fetch(args.page_url)
    html = page_data.decode("utf-8", errors="replace")
    base_origin = urlparse(final_url).netloc
    urls = set()
    for match in URL_RE.finditer(html):
        value = match.group(1) or match.group(2)
        resolved = resolve(value, final_url)
        if resolved:
            urls.add(resolved)
    for match in SRCSET_RE.finditer(html):
        for candidate in match.group(1).split(","):
            resolved = resolve(candidate.strip().split()[0], final_url)
            if resolved:
                urls.add(resolved)
    results = []
    css_sources = []
    for origin in sorted(urls):
        if not args.allow_external and urlparse(origin).netloc != base_origin:
            results.append({"originUrl": origin, "status": "skipped", "reason": "external-origin"})
            continue
        if re.search(r"\.m3u8(?:$|\?)", origin, re.I):
            results.append({"originUrl": origin, "status": "skipped", "reason": "stream-manifest"})
            continue
        try:
            data, content_type, redirected = fetch(origin)
            result = save_asset(args.output, redirected, data, content_type)
            results.append(result)
            if content_type == "text/css":
                css_sources.append((redirected, data.decode("utf-8", errors="replace")))
        except Exception as error:  # noqa: BLE001 - keep per-asset failures in the manifest
            results.append({"originUrl": origin, "status": "failed", "reason": str(error)})
    for stylesheet_url, css in css_sources:
        for match in re.finditer(r"url\(\s*[\"']?([^\)\"']+)", css, re.I):
            resolved = resolve(match.group(1), stylesheet_url)
            if resolved and not any(item["originUrl"] == resolved for item in results):
                try:
                    data, content_type, redirected = fetch(resolved)
                    results.append(save_asset(args.output, redirected, data, content_type))
                except Exception as error:  # noqa: BLE001
                    results.append({"originUrl": resolved, "status": "failed", "reason": str(error)})
    args.output.mkdir(parents=True, exist_ok=True)
    mapping = {"version": 1, "sourceUrl": final_url, "assets": results}
    (args.output / "mapping.json").write_text(json.dumps(mapping, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"mapping": str(args.output / 'mapping.json'), "assets": len(results), "downloaded": sum(item["status"] == "downloaded" for item in results)}, indent=2))


if __name__ == "__main__":
    main()
