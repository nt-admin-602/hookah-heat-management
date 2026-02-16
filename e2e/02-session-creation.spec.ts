import { test, expect } from '@playwright/test';

test.describe('Session Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      indexedDB.deleteDatabase('hookah-heat-db');
    });
    await page.reload();
  });

  test('should create a new session with flavor', async ({ page }) => {
    // セッション追加ボタンをクリック
    await page.getByRole('button', { name: 'セッション追加' }).click();

    // フォームが表示されることを確認
    await expect(page.getByText('新しいセッションを追加')).toBeVisible();

    // モーダル内で操作
    const modal = page.locator('.fixed.inset-0.bg-black\\/50').locator('.bg-slate-800');

    // 台番号ボタンをクリック（1番台）
    await modal.getByRole('button', { name: '1' }).click();

    // フレーバーを入力
    await modal.getByPlaceholder('新規入力または選択').fill('ダブルアップル');

    // 追加ボタンをクリック
    await modal.locator('button[type="submit"]').click();

    // セッションカードが表示されることを確認
    await expect(page.getByText('1番台')).toBeVisible();
    await expect(page.getByText('ダブルアップル')).toBeVisible();

    // 最終メンテ表示を確認
    const maintenanceSection = page.locator('text=最終メンテ:').locator('..');
    await expect(maintenanceSection).toBeVisible();
    await expect(maintenanceSection.getByText('新規追加')).toBeVisible();
    await expect(maintenanceSection.getByText(/\d+分前/)).toBeVisible();

    // 経過時間表示を確認
    const timeSection = page.locator('text=経過時間:').locator('..');
    await expect(timeSection).toBeVisible();
  });

  test('should create a session without flavor', async ({ page }) => {
    // セッション追加ボタンをクリック
    await page.getByRole('button', { name: 'セッション追加' }).click();

    // モーダル内で操作
    const modal = page.locator('.fixed.inset-0.bg-black\\/50').locator('.bg-slate-800');

    // 台番号ボタンをクリック（2番台）
    await modal.getByRole('button', { name: '2' }).click();

    // 追加ボタンをクリック
    await modal.locator('button[type="submit"]').click();

    // セッションカードが表示されることを確認
    await expect(page.getByText('2番台')).toBeVisible();
  });

  test('should not create session without stand number', async ({ page }) => {
    // セッション追加ボタンをクリック
    await page.getByRole('button', { name: 'セッション追加' }).click();

    // モーダル内で操作
    const modal = page.locator('.fixed.inset-0.bg-black\\/50').locator('.bg-slate-800');

    // フレーバーのみ入力
    await modal.getByPlaceholder('新規入力または選択').fill('グレープ');

    // 追加ボタンが無効化されていることを確認
    await expect(modal.locator('button[type="submit"]')).toBeDisabled();

    // フォームが残っていることを確認
    await expect(page.getByText('新しいセッションを追加')).toBeVisible();
  });

  test('should cancel session creation', async ({ page }) => {
    // セッション追加ボタンをクリック
    await page.getByRole('button', { name: 'セッション追加' }).click();

    // フォームが表示されることを確認
    await expect(page.getByText('新しいセッションを追加')).toBeVisible();

    // モーダル内で操作
    const modal = page.locator('.fixed.inset-0.bg-black\\/50').locator('.bg-slate-800');

    // キャンセルボタンをクリック
    await modal.getByRole('button', { name: 'キャンセル' }).click();

    // 空の状態メッセージが表示されることを確認
    await expect(page.getByText('まず、セッションを追加してみてください♪')).toBeVisible();
  });
});
