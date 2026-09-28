from playwright.async_api import async_playwright
import random
import os
import shutil
import re

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
]

async def get_stealth_browser_content(url: str, wait_for_selector: str = None) -> str:
    """
    Launches a native persistent browser context to completely mask automation flags.
    Handles popups cleanly and ensures content is fully loaded before passing to Gemini.
    """
    # Create a unique profile directory for this worker run to avoid session locks
    profile_dir = os.path.join(os.getcwd(), f"browser_profiles/user_profile_{random.randint(1000, 9999)}")
    
    try:
        async with async_playwright() as p:
            # Using launch_persistent_context strips away standard "AutomationControlled" flags natively
            context = await p.chromium.launch_persistent_context(
                user_data_dir=profile_dir,
                headless=True,  # Changed to True for headless Docker execution environment
                no_viewport=False,
                viewport={'width': 1366, 'height': 768},
                user_agent=random.choice(USER_AGENTS),
                ignore_default_args=["--enable-automation"], 
                args=[
                    "--no-sandbox",                  # Crucial for Linux/Docker execution privilege management
                    "--disable-setuid-sandbox",       # Disables sandbox issues inside root containers
                    "--disable-dev-shm-usage",       # Prevents memory resource exhaustion crashes inside shared memory (/dev/shm)
                    "--disable-blink-features=AutomationControlled",
                    "--start-maximized",
                    "--disable-infobars"
                ]
            )
            
            page = context.pages[0] if context.pages else await context.new_page()
            
            # Navigate with a generous timeout to handle slow initial hops
            print(f"[Scraper] Navigating to: {url}")
            await page.goto(url, wait_until="commit", timeout=60000)
            
            # Wait a few seconds for the layout to stabilize
            await page.wait_for_timeout(5000)
            
            # --- CLEAR INTERSTITIALS / POPUPS ---
            await page.keyboard.press("Escape")
            
            popup_selectors = [
                ".commonModal__close", 
                "button[aria-label='Dismiss sign-in info.']",
                "span.bgProperties.close"
            ]
            
            for selector in popup_selectors:
                try:
                    element = page.locator(selector)
                    if await element.is_visible(timeout=1000):
                        await element.click()
                        await page.wait_for_timeout(1000)
                except Exception:
                    continue

            # Critical wait time for Single Page Applications (SPAs) to populate cards
            print("[Scraper] Waiting for pricing elements to render...")
            await page.wait_for_timeout(7000)
            
            # Take a safety screenshot to confirm what the page shows before capturing
            try:
                await page.screenshot(path="debug_screenshot.png")
            except Exception as e:
                print(f"[Warning] Could not capture screenshot: {e}")
                
            visible_text = await page.evaluate("document.body.innerText")
            
            compressed_text = re.sub(r'\n+', ' | ', visible_text).strip()
        
            return compressed_text

    except Exception as e:
        print(f"\n--- SCRAPER CRASHED --- \nReason: {str(e)}\n-----------------------\n")
        raise e
        
    finally:
        # Clean up the temporary profile folder to save disk space
        if os.path.exists(profile_dir):
            try:
                shutil.rmtree(profile_dir)
            except Exception:
                pass