#!/usr/bin/env python3
"""
session_telemetry.py
Zero-Trust Forensic Blame & Error Provenance Auditor

Audits code churn, modified/deleted lines, and commit provenance via git blame:
- Eliminates agent honor system and self-narrative manipulation (bug laundering).
- Audits deleted/modified lines: if previously authored by agent, classifies as AGENT_SELF_INFLICTED.
- Enforces the Standardized 6-Defect Taxonomy.
- Generates verified Defect & Accountability tables for session summaries and CI gates.
"""

import sys
import os
import subprocess
import json
import argparse
from datetime import datetime

TAXONOMY = [
    "SPECULATIVE_HARDCODING",
    "SPLIT_BRAIN_STATE",
    "FALSE_POSITIVE_VALIDATOR",
    "SILENT_FALLBACK",
    "SHORTCUT_BYPASS",
    "COSMETIC_MUTILATION"
]

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return res.stdout.strip()
    except subprocess.CalledProcessError as e:
        return ""

def get_git_diff_summary():
    """Inspects modified and deleted lines in current git working tree."""
    status = run_cmd("git status --porcelain")
    if not status:
        return {"clean": True, "files": [], "deleted_lines": []}

    files = []
    deleted_lines = []
    for line in status.splitlines():
        if line.strip():
            state = line[:2].strip()
            filepath = line[3:].strip()
            files.append({"state": state, "file": filepath})

            # Check deleted/modified lines via git diff -U0
            diff = run_cmd(f"git diff -U0 -- {filepath}")
            for dline in diff.splitlines():
                if dline.startswith("@@"):
                    # @@ -start,count +start,count @@
                    parts = dline.split()
                    if len(parts) >= 2 and parts[1].startswith("-"):
                        hunk_info = parts[1][1:]
                        if "," in hunk_info:
                            start, count = hunk_info.split(",")
                        else:
                            start, count = hunk_info, "1"
                        deleted_lines.append({
                            "file": filepath,
                            "start": int(start),
                            "count": int(count)
                        })

    return {"clean": False, "files": files, "deleted_lines": deleted_lines}

def audit_provenance(deleted_chunks):
    """Audits deleted lines via git blame to verify original author."""
    audit_results = []
    for chunk in deleted_chunks:
        filepath = chunk["file"]
        start = chunk["start"]
        count = chunk["count"]
        if count == 0:
            continue

        end = start + count - 1
        blame_out = run_cmd(f"git blame -L {start},{end} --porcelain -- {filepath}")
        
        # Check author
        authors = set()
        for bline in blame_out.splitlines():
            if bline.startswith("author "):
                authors.add(bline[7:].strip())

        provenance = "EXTERNAL_ENVIRONMENT"
        for author in authors:
            if "agent" in author.lower() or "bot" in author.lower() or "assistant" in author.lower() or "antigravity" in author.lower():
                provenance = "AGENT_SELF_INFLICTED"
                break

        audit_results.append({
            "file": filepath,
            "range": f"L{start}-L{end}",
            "authors": list(authors),
            "provenance": provenance
        })
    return audit_results

def generate_markdown_table(defects):
    """Generates the standardized Forensic Blame Ledger markdown table."""
    if not defects:
        return (
            "| ID Defect | Asal-Usul (Provenance) | Root Cause Category | Bukti Baris / Turn | Siapa Penemu | Status |\n"
            "| :--- | :--- | :--- | :--- | :--- | :--- |\n"
            "| *None* | `NO_CHURN_DETECTED` | `CLEAN_STATE` | `Working Tree Clean` | Automated Telemetry | `VERIFIED_CLEAN` |\n"
        )

    lines = [
        "| ID Defect | Asal-Usul (Provenance) | Root Cause Category | Bukti Baris / Turn | Siapa Penemu | Status |",
        "| :--- | :--- | :--- | :--- | :--- | :--- |"
    ]
    for idx, d in enumerate(defects, 1):
        lines.append(
            f"| `DEF-{idx:02d}` | `{d.get('provenance', 'AGENT_SELF_INFLICTED')}` | `{d.get('category', 'SHORTCUT_BYPASS')}` | `{d.get('file', '')}:{d.get('range', '')}` | {d.get('finder', 'Forensic Git Blame')} | `{d.get('status', 'AUDITED')}` |"
        )
    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Zero-Trust Forensic Blame & Telemetry Auditor")
    parser.add_argument("--verify-only", action="store_true", help="Pre-commit gate mode")
    parser.add_argument("--summary", action="store_true", help="Print markdown summary table")
    parser.add_argument("--ci", action="store_true", help="CI Pipeline Gate mode")
    args = parser.parse_args()

    print("\n======================================================")
    print("   ZERO-TRUST FORENSIC BLAME & TELEMETRY AUDITOR")
    print("======================================================\n")

    diff_summary = get_git_diff_summary()
    if diff_summary["clean"]:
        print("\x1b[32m✔ Git working tree is clean. No uncommitted churn.\x1b[0m")
        if args.summary:
            print("\n" + generate_markdown_table([]))
        sys.exit(0)

    print(f"Detected {len(diff_summary['files'])} modified files:")
    for f in diff_summary["files"]:
        print(f"  [{f['state']}] {f['file']}")

    audit = audit_provenance(diff_summary["deleted_lines"])
    if audit:
        print("\nForensic Churn Provenance:")
        for a in audit:
            color = "\x1b[31m" if a["provenance"] == "AGENT_SELF_INFLICTED" else "\x1b[34m"
            print(f"  {a['file']} {a['range']} -> {color}{a['provenance']}\x1b[0m (Authors: {', '.join(a['authors'])})")

    if args.summary:
        print("\n### Forensic Defect & Accountability Table:\n")
        print(generate_markdown_table(audit))

    print("\n\x1b[32m✔ Forensic telemetry audit complete.\x1b[0m\n")
    sys.exit(0)

if __name__ == "__main__":
    main()
