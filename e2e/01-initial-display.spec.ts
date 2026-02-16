import { test, expect } from '@playwright/test';

test.describe('Initial Display', () => {
  test.beforeEach(async ({ page }) => {
    // IndexedDBをクリア
    await page.goto('/');
    await page.evaluate(() => {
      indexedDB.deleteDatabase('hookah-heat-db');
    });
    await page.reload();
  });

  test('should display app title and header', async ({ page }) => {
    await page.goto('/');

    // ページタイトル確認
    await expect(page).toHaveTitle('熾火守');

    // メインヘッダー確認
    const header = page.locator('h1').filter({ hasText: 'オキビモリ' });
    await expect(header).toBeVisible();
  });

  test('should display empty state message', async ({ page }) => {
    await page.goto('/');

    // 空の状態メッセージ確認
    await expect(page.getByText('まず、セッションを追加してみてください♪')).toBeVisible();
  });

  test('should display session add button', async ({ page }) => {
    await page.goto('/');

    // セッション追加ボタン確認
    const addButton = page.getByRole('button', { name: 'セッション追加' });
    await expect(addButton).toBeVisible();
  });
});
