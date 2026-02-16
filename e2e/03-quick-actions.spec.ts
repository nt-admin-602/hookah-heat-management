import { test, expect } from '@playwright/test';

test.describe('Quick Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      indexedDB.deleteDatabase('hookah-heat-db');
    });
    await page.reload();

    // テスト用セッションを作成
    await page.getByRole('button', { name: 'セッション追加' }).click();
    const modal = page.locator('.fixed.inset-0.bg-black\\/50').locator('.bg-slate-800');
    await modal.getByRole('button', { name: '1' }).click();
    await modal.getByPlaceholder('新規入力または選択').fill('テストフレーバー');
    await modal.locator('button[type="submit"]').click();
    await expect(page.getByText('1番台')).toBeVisible();
  });

  test('should perform ash action', async ({ page }) => {
    // すす捨てボタンをクリック
    const ashButton = page.locator('button').filter({ hasText: 'すす捨て' }).first();
    await ashButton.click();

    // 少し待機
    await page.waitForTimeout(500);

    // 最終メンテが更新されることを確認
    const maintenanceSection = page.locator('text=最終メンテ:').locator('..');
    await expect(maintenanceSection.getByText('すす捨て')).toBeVisible();
  });

  test('should perform coal action', async ({ page }) => {
    // 炭交換ボタンをクリック
    const coalButton = page.locator('button').filter({ hasText: '炭交換' }).first();
    await coalButton.click();

    // 少し待機
    await page.waitForTimeout(500);

    // 最終メンテが更新されることを確認
    const maintenanceSection = page.locator('text=最終メンテ:').locator('..');
    await expect(maintenanceSection.getByText('炭交換')).toBeVisible();
  });

  test('should perform adjust action', async ({ page }) => {
    // 調整ボタンをクリック
    const adjustButton = page.locator('button').filter({ hasText: '調整' }).first();
    await adjustButton.click();

    // 少し待機
    await page.waitForTimeout(500);

    // 最終メンテが更新されることを確認
    const maintenanceSection = page.locator('text=最終メンテ:').locator('..');
    await expect(maintenanceSection.getByText('調整')).toBeVisible();
  });

  test('should perform multiple actions in sequence', async ({ page }) => {
    const maintenanceSection = page.locator('text=最終メンテ:').locator('..');

    // すす捨て
    await page.locator('button').filter({ hasText: 'すす捨て' }).first().click();
    await page.waitForTimeout(500);
    await expect(maintenanceSection.getByText('すす捨て')).toBeVisible();

    // 炭交換
    await page.locator('button').filter({ hasText: '炭交換' }).first().click();
    await page.waitForTimeout(500);
    await expect(maintenanceSection.getByText('炭交換')).toBeVisible();

    // 調整
    await page.locator('button').filter({ hasText: '調整' }).first().click();
    await page.waitForTimeout(500);
    await expect(maintenanceSection.getByText('調整')).toBeVisible();
  });
});
