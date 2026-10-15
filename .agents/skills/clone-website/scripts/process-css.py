#!/usr/bin/env python3
"""Rewrite CSS URLs using downloaded entries from mapping.json."""

import argparse
import json
import re
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--mapping", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    css = args.input.read_text(encoding="utf-8")
    mapping = json.loads(args.mapping.read_text(encoding="utf-8"))
    replacements = {item["originUrl"]: item["localPath"] for item in mapping["assets"] if item.get("status") == "downloaded"}

    def replace(match: re.Match[str]) -> str:
        quote, origin = match.group(1), match.group(2).strip()
        return f"url({quote}{replacements.get(origin, origin)}{quote})"

    processed = re.sub(r"url\(\s*([\"']?)([^)\"']+)\1\s*\)", replace, css, flags=re.I)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(processed.rstrip("\n") + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "replacements": sum(origin in css for origin in replacements)}, indent=2))


if __name__ == "__main__":
    main()
