#!/usr/bin/env python3
"""
Multi-viewport screenshot tool for Plonter.
Takes screenshots at multiple screen sizes for visual inspection.
"""

import http.server
import threading
import time
import os
from playwright.sync_api import sync_playwright

PORT = 8766  # Different port to avoid conflicts
APP_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(APP_DIR, 'test_screenshots', 'viewports')

VIEWPORTS = [
    {'name': 'desktop_1280',  'width': 1280, 'height': 900,  'mobile': False},
    {'name': 'tablet_768',    'width': 768,  'height': 1024, 'mobile': False},
    {'name': 'phone_large_600', 'width': 600, 'height': 900, 'mobile': True},
    {'name': 'iphone_375',    'width': 375,  'height': 667,  'mobile': True},
    {'name': 'small_phone_320', 'width': 320, 'height': 568, 'mobile': True},
]

def start_server():
    os.chdir(APP_DIR)
    handler = http.server.SimpleHTTPRequestHandler
    httpd = http.server.HTTPServer(('localhost', PORT), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd

def take_all_screenshots():
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    httpd = start_server()
    time.sleep(1)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for vp in VIEWPORTS:
            vp_dir = os.path.join(SCREENSHOTS_DIR, vp['name'])
            os.makedirs(vp_dir, exist_ok=True)
            print(f"\n{'='*50}")
            print(f"Viewport: {vp['name']} ({vp['width']}x{vp['height']}, mobile={vp['mobile']})")
            print(f"{'='*50}")

            context = browser.new_context(
                viewport={'width': vp['width'], 'height': vp['height']},
                locale='he-IL',
                has_touch=vp['mobile'],
                is_mobile=vp['mobile'],
            )
            page = context.new_page()
            page.goto(f'http://localhost:{PORT}/')
            page.wait_for_load_state('networkidle')
            time.sleep(1)

            # 1. Welcome screen
            path = os.path.join(vp_dir, '01_welcome.png')
            page.screenshot(path=path, full_page=True)
            print(f"  Saved: {path}")

            # 2. Enter first stage
            stage_cards = page.query_selector_all('.stage-item')
            if stage_cards:
                stage_cards[0].click()
                time.sleep(1)

                path = os.path.join(vp_dir, '02_game_screen.png')
                page.screenshot(path=path, full_page=True)
                print(f"  Saved: {path}")

                # 3. Close-up of sentence area
                sentence = page.query_selector('#sentence-container, .sentence-container')
                if sentence:
                    path = os.path.join(vp_dir, '03_sentence_area.png')
                    sentence.screenshot(path=path)
                    print(f"  Saved: {path}")

                # 4. Click first word
                words = page.query_selector_all('.word-block')
                if len(words) >= 2:
                    words[0].click()
                    time.sleep(0.5)
                    path = os.path.join(vp_dir, '04_word_selected.png')
                    page.screenshot(path=path, full_page=True)
                    print(f"  Saved: {path}")

                    # 5. Click second word — open role menu
                    words = page.query_selector_all('.word-block')
                    if len(words) > 1:
                        words[1].click()
                        time.sleep(0.5)
                        path = os.path.join(vp_dir, '05_role_menu.png')
                        page.screenshot(path=path, full_page=True)
                        print(f"  Saved: {path}")

                    # 6. Select role and create roof
                    modal = page.query_selector('#syntactic-role-modal')
                    if modal:
                        classes = modal.get_attribute('class') or ''
                        if 'show' in classes:
                            role_buttons = page.query_selector_all('#syntactic-role-modal .role-btn')
                            if role_buttons:
                                role_buttons[0].click()
                                time.sleep(0.3)
                                save_btn = page.query_selector('#save-syntactic-role')
                                if save_btn:
                                    save_btn.click()
                                    time.sleep(1)
                                path = os.path.join(vp_dir, '06_roof_created.png')
                                page.screenshot(path=path, full_page=True)
                                print(f"  Saved: {path}")

                                # 7. Close-up of roof area after creation
                                sentence = page.query_selector('#sentence-container, .sentence-container')
                                if sentence:
                                    path = os.path.join(vp_dir, '07_roof_closeup.png')
                                    sentence.screenshot(path=path)
                                    print(f"  Saved: {path}")

                    # 8. Click + button to open POS modal
                    add_btns = page.query_selector_all('.add-pos-btn')
                    if add_btns:
                        add_btns[0].click()
                        time.sleep(0.5)
                        path = os.path.join(vp_dir, '08_pos_modal.png')
                        page.screenshot(path=path, full_page=True)
                        print(f"  Saved: {path}")

            context.close()

        browser.close()

    httpd.shutdown()
    print(f"\n\nAll screenshots saved to: {SCREENSHOTS_DIR}")
    print("Viewports captured:")
    for vp in VIEWPORTS:
        print(f"  - {vp['name']}: {vp['width']}x{vp['height']}")


if __name__ == '__main__':
    take_all_screenshots()
