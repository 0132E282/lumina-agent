#!/usr/bin/env python3
"""Compare structural HTML inventory; this does not prove pixel parity."""

import argparse
import json
import re
from pathlib import Path


def inventory(html: str) -> dict:
    tags = ["header", "nav", "main", "section", "article", "aside", "footer", "form", "img", "video", "script", "link", "h1", "h2", "h3", "button"]
    text = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>|<[^>]+>", "", html, flags=re.I)
    return {"bytes": len(html.encode()), "title": next(iter(re.findall(r"<title\b[^>]*>(.*?)</title>", html, re.I | re.S)), "").strip() or None, "textLength": len(" ".join(text.split())), "tags": {tag: len(re.findall(fr"<{tag}\b", html, re.I)) for tag in tags}}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source")
    parser.add_argument("clone")
    args = parser.parse_args()
    source, clone = inventory(Path(args.source).read_text(encoding="utf-8")), inventory(Path(args.clone).read_text(encoding="utf-8"))
    differences = [{"field": key, "source": source[key], "clone": clone[key]} for key in ("bytes", "title", "textLength") if source[key] != clone[key]]
    differences += [{"field": f"tags.{tag}", "source": source["tags"][tag], "clone": clone["tags"][tag]} for tag in source["tags"] if source["tags"][tag] != clone["tags"][tag]]
    print(json.dumps({"source": source, "clone": clone, "differences": differences, "structuralMatch": not differences}, indent=2))
    if differences:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
