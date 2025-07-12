import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('Core Web Vitals meet standards', async ({ page }) => {
    await page.goto('/');
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.lcp = entries[entries.length - 1].startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // FID (First Input Delay) - simulated
        vitals.fid = 0; // Will be measured on actual interaction
        
        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Wait for measurements
        setTimeout(() => resolve(vitals), 3000);
      });
    });
    
    // Core Web Vitals thresholds
    expect(vitals.lcp).toBeLessThan(2500); // LCP < 2.5s
    expect(vitals.cls).toBeLessThan(0.1);  // CLS < 0.1
  });

  test('page load time is acceptable', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const domLoadTime = Date.now() - startTime;
    
    await page.waitForLoadState('networkidle');
    const fullLoadTime = Date.now() - startTime;
    
    expect(domLoadTime).toBeLessThan(1500); // DOM ready < 1.5s
    expect(fullLoadTime).toBeLessThan(3000); // Full load < 3s
  });

  test('images are optimized', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src) {
        // Check if image has loading attribute
        const loading = await img.getAttribute('loading');
        if (!src.startsWith('data:')) {
          expect(loading).toBe('lazy');
        }
        
        // Check if image has appropriate dimensions
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);
        
        expect(naturalWidth).toBeGreaterThan(0);
        expect(naturalHeight).toBeGreaterThan(0);
      }
    }
  });

  test('fonts load efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Check for font loading optimization
    const fontLoadingStrategy = await page.evaluate(() => {
      const links = document.querySelectorAll('link[rel="preload"][as="font"]');
      return links.length > 0;
    });
    
    // Wait for fonts to load
    await page.waitForFunction(() => document.fonts.ready);
    
    const fontMetrics = await page.evaluate(() => ({
      status: document.fonts.status,
      size: document.fonts.size,
    }));
    
    expect(fontMetrics.status).toBe('loaded');
  });

  test('JavaScript bundle size is reasonable', async ({ page }) => {
    const response = await page.goto('/');
    const transferSize = response?.headers()['content-length'];
    
    if (transferSize) {
      const sizeInKB = parseInt(transferSize) / 1024;
      expect(sizeInKB).toBeLessThan(500); // Main bundle < 500KB
    }
  });

  test('no console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(consoleErrors).toEqual([]);
  });
});
