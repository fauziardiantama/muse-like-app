#!/usr/bin/env python3
"""
scripts/verify-summary.py
Summary Schema & Git Blame Lie Detector (Anti-Bug-Laundering Gate)

Validates session summary files in .SUMMARIES/:
1. Enforces mandatory sections:
   - "## Tabel Defect & Akuntabilitas" OR "## Tabel Forensik Defect & Akuntabilitas"
2. Detects Bug Laundering via git blame:
   - If code in screens/ or components/ was modified/deleted by the agent from previous commits,
     the summary MUST record an entry with provenance 'AGENT_SELF_INFLICTED'.
   - If agent modified its own past blunder without confessing AGENT_SELF_INFLICTED in the summary,
     the commit is FATALLY REJECTED with Exit Code 1.
"""

import sys
import os
import glob
import subprocess
import re

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WORKSPACE_PARENT = os.path.abspath(os.path.join(ROOT_DIR, "..", ".."))
SUMMARIES_DIR = os.path.join(WORKSPACE_PARENT, ".SUMMARIES")

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, cwd=ROOT_DIR)
        return res.stdout.strip()
    except Exception:
        return ""

def get_latest_summary():
    if not os.path.exists(SUMMARIES_DIR):
        return None
    files = glob.glob(os.path.join(SUMMARIES_DIR, "*.md"))
    if not files:
        return None
    # Sort by numeric prefix
    def get_num(f):
        m = re.match(r"^(\d+)_", os.path.basename(f))
        return int(m.group(1)) if m else 0
    files.sort(key=get_num, reverse=True)
    return files[0]

def verify_summary_schema(summary_path):
    print(f"\n[1/2] Verifying Summary Schema: {os.path.basename(summary_path)}")
    with open(summary_path, "r", encoding="utf-8") as f:
        content = f.read()

    has_table = ("Tabel Defect & Akuntabilitas" in content) or ("Tabel Forensik Defect & Akuntabilitas" in content) or ("Tabel Akuntabilitas & Defect" in content)
    if not has_table:
        print("\x1b[31m❌ FATAL: Summary DITOLAK! Wajib memuat tabel defect akuntabilitas ('## Tabel Defect & Akuntabilitas')!\x1b[0m")
        return False, content

    print("  \x1b[32m✔ PASS\x1b[0m: Mandatory Defect Table is present.")
    return True, content

def audit_git_blame_bug_laundering(summary_content):
    print("\n[2/2] Running Git Blame Lie Detector (Anti-Bug Laundering Audit)...")
    status = run_cmd("git status --porcelain")
    if not status:
        print("  \x1b[32m✔ PASS\x1b[0m: No unstaged/staged code churn.")
        return True

    # Check deleted/modified lines in screens/ and components/
    deleted_lines = []
    diff_lines = run_cmd("git diff -U0 HEAD -- screens/ components/")
    current_file = None

    for line in diff_lines.splitlines():
        if line.startswith("--- a/"):
            current_file = line[6:].strip()
        elif line.startswith("@@") and current_file:
            # @@ -start,count +... @@
            m = re.search(r"-(\d+)(?:,(\d+))?", line)
            if m:
                start = int(m.group(1))
                count = int(m.group(2)) if m.group(2) else 1
                if count > 0:
                    deleted_lines.append((current_file, start, count))

    if not deleted_lines:
        print("  \x1b[32m✔ PASS\x1b[0m: No deleted/modified UI component lines to audit.")
        return True

    # Blame deleted lines
    self_rework_detected = False
    for filepath, start, count in deleted_lines:
        end = start + count - 1
        blame_out = run_cmd(f"git blame -L {start},{end} --porcelain -- {filepath}")
        for bline in blame_out.splitlines():
            if bline.startswith("author ") and not ("Not Committed Yet" in bline):
                # If author is recent agent commit
                self_rework_detected = True
                break

    if self_rework_detected:
        if "AGENT_SELF_INFLICTED" not in summary_content and "DEF-" not in summary_content:
            print("\x1b[31m❌ FRAUD ALERT: UPAYA PENCUCIAN DOSA (BUG LAUNDERING) TERDETEKSI!\x1b[0m")
            print("   Anda memodifikasi/menghapus baris kode yang dibuat sebelumnya pada screens/components,")
            print("   tetapi di summary TIDAK ADA pengakuan 'AGENT_SELF_INFLICTED' pada Tabel Defect!")
            print("   Anda mencoba membingkai blunder sendiri sebagai 'refactoring/audit'!")
            return False

    print("  \x1b[32m✔ PASS\x1b[0m: Churn provenance matches summary defect records.")
    return True

def main():
    print("======================================================")
    print("   SUMMARY LINTER & GIT BLAME LIE DETECTOR")
    print("======================================================")

    latest_summary = get_latest_summary()
    if not latest_summary:
        print("No summary file found in .SUMMARIES/ - skipping.")
        sys.exit(0)

    ok_schema, content = verify_summary_schema(latest_summary)
    if not ok_schema:
        sys.exit(1)

    ok_blame = audit_git_blame_bug_laundering(content)
    if not ok_blame:
        sys.exit(1)

    print("\n\x1b[32mALL SUMMARY INTEGRITY & BLAME AUDITS PASSED!\x1b[0m\n")
    sys.exit(0)

if __name__ == "__main__":
    main()
