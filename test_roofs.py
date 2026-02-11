#!/usr/bin/env python3
"""
Test protocol for Plonter roof system.
Runs against local HTTP server, takes screenshots at each step.
Compare screenshots to Amitai's requirements before release.
"""

import http.server
import threading
import time
import os
import json
from playwright.sync_api import sync_playwright

PORT = 8765
APP_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(APP_DIR, 'test_screenshots')

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def start_server():
    os.chdir(APP_DIR)
    handler = http.server.SimpleHTTPRequestHandler
    httpd = http.server.HTTPServer(('localhost', PORT), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd

def screenshot(page, name, step_num):
    path = os.path.join(SCREENSHOTS_DIR, f'{step_num:02d}_{name}.png')
    page.screenshot(path=path, full_page=True)
    print(f'  Screenshot: {path}')
    return path

def run_tests():
    httpd = start_server()
    time.sleep(1)
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 900},
            locale='he-IL'
        )
        page = context.new_page()
        page.goto(f'http://localhost:{PORT}/')
        page.wait_for_load_state('networkidle')
        time.sleep(1)

        # Step 1: Welcome screen loads
        print('\n=== TEST 1: Welcome screen loads ===')
        screenshot(page, 'welcome_screen', 1)
        welcome = page.query_selector('#welcome-screen')
        if welcome:
            print('  PASS: Welcome screen visible')
            results.append(('Welcome screen', True))
        else:
            print('  FAIL: No welcome screen')
            results.append(('Welcome screen', False))

        # Step 2: Click first stage to enter game
        print('\n=== TEST 2: Enter a stage ===')
        stage_cards = page.query_selector_all('.stage-item')
        if stage_cards:
            stage_cards[0].click()
            time.sleep(1)
            screenshot(page, 'game_screen', 2)
            game = page.query_selector('#game-screen')
            visible = game and game.is_visible() if game else False
            print(f'  {"PASS" if visible else "FAIL"}: Game screen {"visible" if visible else "not visible"}')
            results.append(('Enter stage', visible))
        else:
            print('  FAIL: No stage cards found')
            results.append(('Enter stage', False))

        # Step 3: Words are displayed
        print('\n=== TEST 3: Words displayed ===')
        words = page.query_selector_all('.word-block')
        print(f'  Found {len(words)} words')
        screenshot(page, 'words_displayed', 3)
        results.append(('Words displayed', len(words) > 0))

        if len(words) >= 2:
            # Step 4: Click first word — should highlight
            print('\n=== TEST 4: Click word A — highlights ===')
            words[0].click()
            time.sleep(0.5)
            screenshot(page, 'word_a_selected', 4)
            # Re-query after click (DOM may re-render)
            words = page.query_selector_all('.word-block')
            classes_a = words[0].get_attribute('class') or ''
            selected = 'selected' in classes_a or 'active' in classes_a or 'highlighted' in classes_a or 'arch-selected' in classes_a
            print(f'  Word A classes: {classes_a}')
            print(f'  {"PASS" if selected else "CHECK MANUALLY"}: Word A highlight state')
            results.append(('Word A highlights', selected))

            # Step 5: Click second word — syntactic role menu should open
            print('\n=== TEST 5: Click word B — role menu opens ===')
            words = page.query_selector_all('.word-block')
            words[1].click() if len(words) > 1 else None
            time.sleep(0.5)
            screenshot(page, 'role_menu_open', 5)

            # Check for the syntactic role modal
            modal = page.query_selector('#syntactic-role-modal')
            menu_visible = False
            if modal:
                classes = modal.get_attribute('class') or ''
                display = page.evaluate('(el) => window.getComputedStyle(el).display', modal)
                menu_visible = 'show' in classes or display != 'none'
                print(f'  Modal classes: {classes}, display: {display}')
            print(f'  {"PASS" if menu_visible else "FAIL"}: Syntactic role menu {"visible" if menu_visible else "not visible"}')
            results.append(('Role menu opens', menu_visible))

            # Step 6: Check menu has 9 roles
            print('\n=== TEST 6: Menu has 9 syntactic roles ===')
            role_buttons = page.query_selector_all('#syntactic-role-modal .role-btn')
            print(f'  Found {len(role_buttons)} role options')
            if role_buttons:
                for rb in role_buttons[:9]:
                    text = rb.inner_text()
                    print(f'    - {text}')
            has_9 = len(role_buttons) >= 9
            print(f'  {"PASS" if has_9 else "FAIL"}: {len(role_buttons)} roles found (need 9)')
            results.append(('9 syntactic roles', has_9))

            # Step 7: Select a role and save — roof should appear
            print('\n=== TEST 7: Select role — roof created ===')
            if role_buttons:
                role_buttons[0].click()
                time.sleep(0.3)
                # Click Save button to confirm selection
                save_btn = page.query_selector('#save-syntactic-role')
                if save_btn:
                    save_btn.click()
                    print('  Clicked Save button')
                else:
                    print('  WARNING: Save button not found')
                time.sleep(1)
            screenshot(page, 'roof_created', 7)

            # Check for roof/arch elements in DOM (SVG lines, arches)
            roofs = page.query_selector_all('.arch-container, [class*="arch"], svg line, svg path, svg rect')
            print(f'  Found {len(roofs)} roof-related elements')
            # Debug: dump SVG contents
            svg_info = page.evaluate('''() => {
                const svg = document.getElementById("arch-svg");
                if (!svg) return "No arch-svg found";
                const lines = svg.querySelectorAll("line");
                const texts = svg.querySelectorAll("text");
                const rects = svg.querySelectorAll("rect");
                const groups = svg.querySelectorAll("g");
                let info = `SVG: ${lines.length} lines, ${rects.length} rects, ${texts.length} texts, ${groups.length} groups\\n`;
                lines.forEach((l, i) => {
                    info += `  line${i}: (${l.getAttribute("x1")},${l.getAttribute("y1")}) to (${l.getAttribute("x2")},${l.getAttribute("y2")})\\n`;
                });
                texts.forEach((t, i) => {
                    info += `  text${i}: "${t.textContent}" at (${t.getAttribute("x")},${t.getAttribute("y")})\\n`;
                });
                rects.forEach((r, i) => {
                    info += `  rect${i}: at (${r.getAttribute("x")},${r.getAttribute("y")}) ${r.getAttribute("width")}x${r.getAttribute("height")}\\n`;
                });
                return info;
            }''')
            print(f'  SVG debug:\n{svg_info}')
            results.append(('Roof created', len(roofs) > 0))

            # Step 8: Screen NOT frozen — can still interact
            print('\n=== TEST 8: Screen not frozen after first roof ===')
            time.sleep(0.5)
            try:
                # Re-query words (DOM re-renders after roof creation)
                words = page.query_selector_all('.word-block')
                # Try clicking another word
                if len(words) > 2:
                    words[2].click()
                    time.sleep(0.5)
                screenshot(page, 'after_second_click', 8)
                print('  PASS: Can still click after roof creation')
                results.append(('Not frozen', True))
            except Exception as e:
                print(f'  FAIL: Screen frozen — {e}')
                results.append(('Not frozen', False))

            # Step 9: Visual check — take close-up of roof area
            print('\n=== TEST 9: Roof visual inspection ===')
            sentence_container = page.query_selector('#sentence-container, .sentence-container')
            if sentence_container:
                sentence_container.screenshot(path=os.path.join(SCREENSHOTS_DIR, '09_roof_closeup.png'))
                print('  Screenshot of sentence area saved for visual inspection')
            results.append(('Roof visual', 'MANUAL CHECK'))

        # Summary
        print('\n' + '=' * 50)
        print('TEST SUMMARY')
        print('=' * 50)
        passed = sum(1 for _, r in results if r is True)
        failed = sum(1 for _, r in results if r is False)
        manual = sum(1 for _, r in results if r not in (True, False))
        for name, result in results:
            status = 'PASS' if result is True else ('FAIL' if result is False else 'MANUAL')
            print(f'  [{status}] {name}')
        print(f'\nTotal: {passed} passed, {failed} failed, {manual} manual check')
        print(f'Screenshots saved to: {SCREENSHOTS_DIR}')

        browser.close()

    httpd.shutdown()
    return results

if __name__ == '__main__':
    run_tests()
