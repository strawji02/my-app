import { test } from '@playwright/test';

test.describe('스크린샷 캡처', () => {
  test('메인 페이지 스크린샷', async ({ page }) => {
    // 메인 페이지로 이동
    await page.goto('/');
    
    // 페이지가 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    
    // 전체 페이지 스크린샷 캡처
    await page.screenshot({ 
      path: 'screenshots/main-page.png',
      fullPage: true 
    });
  });

  test('업로드 페이지 스크린샷', async ({ page }) => {
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'screenshots/upload-page.png',
      fullPage: true 
    });
  });

  test('데이터 리뷰 페이지 스크린샷', async ({ page }) => {
    await page.goto('/data-review');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'screenshots/data-review-page.png',
      fullPage: true 
    });
  });

  test('굴착 페이지 스크린샷', async ({ page }) => {
    await page.goto('/excavation');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'screenshots/excavation-page.png',
      fullPage: true 
    });
  });

  test('결과 페이지 스크린샷', async ({ page }) => {
    await page.goto('/result');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'screenshots/result-page.png',
      fullPage: true 
    });
  });

  test('모바일 뷰 스크린샷', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'screenshots/mobile-main-page.png',
      fullPage: true 
    });
  });
});