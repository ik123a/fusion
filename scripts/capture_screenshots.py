#!/usr/bin/env python
"""Capture screenshots of all Fusion routes via Playwright."""
from playwright.sync_api import sync_playwright
import sys
import os

OUT = r"C:\Users\SKV\Desktop\projects\fusion\docs\screenshots"
os.makedirs(OUT, exist_ok=True)

pages = [
    ("http://localhost:3001/", "01-home", "Home — landing page"),
    ("http://localhost:3001/dashboard", "02-dashboard", "Dashboard"),
    ("http://localhost:3001/projects", "03-projects", "Projects list"),
    ("http://localhost:3001/projects/1", "04-project-detail", "Project detail page"),
    ("http://localhost:3001/editor", "05-editor", "Collaborative editor"),
    ("http://localhost:3001/api", "06-api-playground", "API Playground"),
    ("http://localhost:3001/deployments", "07-deployments", "Deployments"),
    ("http://localhost:3001/settings", "08-settings", "Settings"),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()

    results = []
    for url, slug, label in pages:
        print(f"[{label}] visiting {url} ...", end=" ")
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=20000)
            # Give Next.js a moment to compile and hydrate
            try:
                page.wait_for_load_state("networkidle", timeout=10000)
            except Exception:
                pass  # networkidle occasionally times out on Vercel-walled routes
            
            # Use longer wait for home page to compile layout/styles, and reasonable wait for other pages
            wait_time = 10000 if slug == "01-home" else 3000
            page.wait_for_timeout(wait_time)
            
            # Scroll down and up to trigger scroll animations (framer-motion whileInView)
            if slug == "01-home":
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(1500)
                page.evaluate("window.scrollTo(0, 0)")
                page.wait_for_timeout(1000)
            
            out_path = os.path.join(OUT, f"{slug}.png")
            page.screenshot(path=out_path, full_page=True)
            size = os.path.getsize(out_path)
            print(f"OK ({size // 1024} KB)")
            results.append((label, out_path, size, "OK"))
        except Exception as e:
            print(f"FAILED: {e}")
            results.append((label, None, 0, f"FAILED: {e}"))

    browser.close()

print("\n--- Summary ---")
for label, path, size, status in results:
    marker = "[OK]" if "OK" in status else "[FAIL]"
    print(f"{marker} {label:40s} {status}")
