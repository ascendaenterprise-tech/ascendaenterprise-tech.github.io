"""
Places the "Live Market Coverage" section (6 real video feeds) right
below the "Live Market News" bar, before "Market Pulse" begins.

Safe to run whether or not you already ran the previous version of this
script -- it detects and removes any old insertion first, so you never
end up with duplicates.

Run from inside the cloned ascendaenterprise-tech.github.io repo folder:
    python3 add_live_tv.py
"""

FILE = "index.html"

# Real, exact anchor: the end of the "Live Market News" bar's script block,
# immediately followed by the start of the "Market Pulse" / sentiment bar.
NEW_ANCHOR = '''  fetchNews();
  window.addEventListener('resize',setGrid);
  setInterval(fetchNews, 300000);
}();
</script>


<!-- MARKET SENTIMENT BAR -->'''

LIVE_TV_START_MARKER = '<!-- LIVE MARKET COVERAGE -->'
LIVE_TV_END_MARKER = 'id="live-tv"'

NEW_SECTION = '''

<!-- LIVE MARKET COVERAGE -->
<section style="padding:4rem clamp(1rem,5vw,3.5rem) 2rem;background:var(--ink);border-bottom:.5px solid var(--rule)" id="live-tv">
  <div style="max-width:1200px;margin:0 auto">
    <div class="sec-label">Real-Time Coverage</div>
    <h2 class="on-dark">Live Market <em>Coverage</em></h2>
    <p style="font-family:var(--font-mono);font-size:.62rem;color:var(--cream3);margin-top:-.2rem;margin-bottom:3rem;letter-spacing:.06em">Six real-time financial news feeds, streamed directly from their original broadcasters</p>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem">

      <div style="border:.5px solid var(--rule);background:rgba(255,255,255,0.02);overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:.5px solid var(--rule)">
          <span style="font-family:var(--font-mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--white);display:flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:#E74C3C;display:inline-block;box-shadow:0 0 8px #E74C3C;animation:pulse 1.6s ease-in-out infinite"></span>Bloomberg</span>
          <a href="https://www.youtube.com/watch?v=QB5BNdBFujE" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:.48rem;letter-spacing:.06em;text-transform:uppercase;color:var(--cream3);text-decoration:none;border:.5px solid var(--rule);padding:.25rem .6rem">Open &#8599;</a>
        </div>
        <div style="position:relative;padding-bottom:56.25%;height:0">
          <iframe src="https://www.youtube.com/embed/QB5BNdBFujE?autoplay=1&mute=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      </div>

      <div style="border:.5px solid var(--rule);background:rgba(255,255,255,0.02);overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:.5px solid var(--rule)">
          <span style="font-family:var(--font-mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--white);display:flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:#E74C3C;display:inline-block;box-shadow:0 0 8px #E74C3C;animation:pulse 1.6s ease-in-out infinite"></span>Yahoo Finance</span>
          <a href="https://www.youtube.com/watch?v=KQp-e_XQnDE" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:.48rem;letter-spacing:.06em;text-transform:uppercase;color:var(--cream3);text-decoration:none;border:.5px solid var(--rule);padding:.25rem .6rem">Open &#8599;</a>
        </div>
        <div style="position:relative;padding-bottom:56.25%;height:0">
          <iframe src="https://www.youtube.com/embed/KQp-e_XQnDE?autoplay=1&mute=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      </div>

      <div style="border:.5px solid var(--rule);background:rgba(255,255,255,0.02);overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:.5px solid var(--rule)">
          <span style="font-family:var(--font-mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--white);display:flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:#E74C3C;display:inline-block;box-shadow:0 0 8px #E74C3C;animation:pulse 1.6s ease-in-out infinite"></span>LiveNOW (Fox)</span>
          <a href="https://www.youtube.com/watch?v=C96oohpWBGw" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:.48rem;letter-spacing:.06em;text-transform:uppercase;color:var(--cream3);text-decoration:none;border:.5px solid var(--rule);padding:.25rem .6rem">Open &#8599;</a>
        </div>
        <div style="position:relative;padding-bottom:56.25%;height:0">
          <iframe src="https://www.youtube.com/embed/C96oohpWBGw?autoplay=1&mute=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      </div>

      <div style="border:.5px solid var(--rule);background:rgba(255,255,255,0.02);overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:.5px solid var(--rule)">
          <span style="font-family:var(--font-mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--white);display:flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:#E74C3C;display:inline-block;box-shadow:0 0 8px #E74C3C;animation:pulse 1.6s ease-in-out infinite"></span>Reuters</span>
          <a href="https://www.youtube.com/channel/UCjTMxYSAvQ9DNPYjtxNgkCw/live" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:.48rem;letter-spacing:.06em;text-transform:uppercase;color:var(--cream3);text-decoration:none;border:.5px solid var(--rule);padding:.25rem .6rem">Open &#8599;</a>
        </div>
        <div style="position:relative;padding-bottom:56.25%;height:0">
          <iframe src="https://www.youtube.com/embed/live_stream?channel=UCjTMxYSAvQ9DNPYjtxNgkCw&autoplay=1&mute=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      </div>

      <div style="border:.5px solid var(--rule);background:rgba(255,255,255,0.02);overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:.5px solid var(--rule)">
          <span style="font-family:var(--font-mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--white);display:flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:#E74C3C;display:inline-block;box-shadow:0 0 8px #E74C3C;animation:pulse 1.6s ease-in-out infinite"></span>NBC News NOW</span>
          <a href="https://www.youtube.com/channel/UCdUCBzZCacPI61FdL7x9yvQ/live" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:.48rem;letter-spacing:.06em;text-transform:uppercase;color:var(--cream3);text-decoration:none;border:.5px solid var(--rule);padding:.25rem .6rem">Open &#8599;</a>
        </div>
        <div style="position:relative;padding-bottom:56.25%;height:0">
          <iframe src="https://www.youtube.com/embed/live_stream?channel=UCdUCBzZCacPI61FdL7x9yvQ&autoplay=1&mute=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      </div>

      <div style="border:.5px solid var(--rule);background:rgba(255,255,255,0.02);overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:.5px solid var(--rule)">
          <span style="font-family:var(--font-mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--white);display:flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:#E74C3C;display:inline-block;box-shadow:0 0 8px #E74C3C;animation:pulse 1.6s ease-in-out infinite"></span>Fox Business</span>
          <a href="https://www.youtube.com/channel/UC7UQyQ1NRIAIDMKn75WYwlw/live" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:.48rem;letter-spacing:.06em;text-transform:uppercase;color:var(--cream3);text-decoration:none;border:.5px solid var(--rule);padding:.25rem .6rem">Open &#8599;</a>
        </div>
        <div style="position:relative;padding-bottom:56.25%;height:0">
          <iframe src="https://www.youtube.com/embed/live_stream?channel=UC7UQyQ1NRIAIDMKn75WYwlw&autoplay=1&mute=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      </div>

    </div>
  </div>
</section>
'''

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

changes = []

# Step 1: If an old live-tv section exists anywhere, remove it first
# (handles both the case where it doesn't exist yet, and where the
# previous version of this script already added it in the wrong spot)
if LIVE_TV_START_MARKER in content:
    start_idx = content.find(LIVE_TV_START_MARKER)
    # Find the matching closing </section> for this specific section
    end_marker = "</section>\n"
    end_idx = content.find(end_marker, start_idx)
    if end_idx != -1:
        end_idx += len(end_marker)
        # Also eat the blank lines we added before it
        old_block = content[start_idx:end_idx]
        # Remove the block plus the two blank lines we added before it
        removal_start = start_idx
        while removal_start > 0 and content[removal_start-1] in ('\n',):
            removal_start -= 1
        content = content[:removal_start] + content[end_idx:]
        changes.append("Removed old Live Market Coverage section from its previous location")

# Step 2: Insert fresh at the new, correct location
if NEW_ANCHOR not in content:
    print("ERROR: Could not find the expected anchor text (end of Live Market News bar) in index.html.")
    print("This means the file may have changed since this script was written.")
    print("No changes were made. Send Claude the current index.html to fix this.")
else:
    content = content.replace(NEW_ANCHOR, NEW_ANCHOR + NEW_SECTION, 1)
    changes.append("Inserted Live Market Coverage section right below the Live Market News bar")

    with open(FILE, "w", encoding="utf-8") as f:
        f.write(content)

    print("SUCCESS:")
    for c in changes:
        print(f"  - {c}")
