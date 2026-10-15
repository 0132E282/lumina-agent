#!/usr/bin/env python3
"""Inject processed CSS and verified media URLs into a clone layout."""

import argparse
import json
import re
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--css", required=True)
    parser.add_argument("--mapping", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    html = args.input.read_text(encoding="utf-8")
    mapping = json.loads(args.mapping.read_text(encoding="utf-8"))
    replacements = {item["originUrl"]: item["localPath"] for item in mapping["assets"] if item.get("status") == "downloaded"}
    media = re.compile(r"(<(?:img|video|audio|source|track)\b[^>]*?\b(?:src|poster)=['\"])([^'\"]+)(['\"])", re.I)
    html = media.sub(lambda match: match.group(1) + replacements.get(match.group(2), match.group(2)) + match.group(3), html)
    link = f'<link rel="stylesheet" href="{args.css.replace(chr(92), "/")}">'
    if link not in html:
        html = re.sub(r"<head\b[^>]*>", lambda match: match.group(0) + "\n    " + link, html, count=1, flags=re.I)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(html.rstrip("\n") + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "cssInjected": link in html}, indent=2))


if __name__ == "__main__":
    main()
