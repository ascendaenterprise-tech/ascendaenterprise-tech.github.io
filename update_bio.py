"""
Applies all AEC founder bio updates to index.html automatically.
Uses safe, confirmed exact-text matches -- reports success/failure for
each change so nothing silently fails.

Run from inside the cloned repo folder:
    python3 update_bio.py
"""

import re

FILE = "index.html"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

original = content
changes_applied = []
changes_failed = []

def apply_replace(label, old, new):
    global content
    if old in content:
        content = content.replace(old, new, 1)
        changes_applied.append(label)
    else:
        changes_failed.append(label)

# 1. Founder title line -- add age + philanthropist
apply_replace(
    "Founder title (age + philanthropist)",
    "Founder, Owner & Chief Executive Officer",
    "18-Year-Old Founder, Owner, CEO & Philanthropist"
)

# 2. Main bio opening -- add age
apply_replace(
    "Main bio opening sentence (age)",
    "founder, owner, and CEO of Ascenda Enterprise Capital",
    "18-year-old founder, owner, and CEO of Ascenda Enterprise Capital"
)

# 3. Insert new philanthropist paragraph before the closing "He founded..." line
apply_replace(
    "Insert philanthropist paragraph",
    "<p>He founded Ascenda with one vision:",
    "<p>Beyond the desk, Izaiah is a philanthropist — building AEC's "
    "mentorship program to put real frameworks, real trade reviews, and "
    "real access in the hands of people who wouldn't otherwise get it. "
    "Not a course. Proximity to the actual thing.</p>\n        "
    "<p>He founded Ascenda with one vision:"
)

# 4. Stats row -- swap "Years experience" for "Years old"
apply_replace(
    "Stats row (18 years old)",
    '<div class="fs-val">~5</div><div class="fs-lbl">Years experience</div>',
    '<div class="fs-val">18</div><div class="fs-lbl">Years old</div>'
)

# 5. Any leftover "Since 2016" or "2016" tag references -> 2021 (only if present)
count_2016 = content.count("2016")
if count_2016 > 0:
    content = content.replace("Since 2016", "Since 2021")
    content = content.replace("2016", "2021")
    changes_applied.append(f"Fixed {count_2016} instance(s) of '2016' -> '2021'")

print("=" * 60)
print("APPLIED:")
for c in changes_applied:
    print(f"  [OK] {c}")

if changes_failed:
    print("\nNOT FOUND (no change made -- check these manually):")
    for c in changes_failed:
        print(f"  [!!] {c}")
else:
    print("\nAll targeted changes found and applied successfully.")
print("=" * 60)

if content != original:
    with open(FILE, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n{FILE} updated and saved.")
else:
    print(f"\nNo changes were made -- {FILE} left untouched.")
