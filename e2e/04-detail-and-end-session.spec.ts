import { test, expect } from '@playwright/test';

test.describe('Detail Page and Session End', () => {
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
    await modal.getByPlaceholder('新規入力または選択').fill('ダブルアップル');
    await modal.locator('button[type="submit"]').click();
    await expect(page.getByText('1番台')).toBeVisible();
  });

  test('should navigate to detail page', async ({ page }) => {
    // 詳細ボタンをクリック
    await page.getByRole('button', { name: '詳細' }).click();

    // URLを確認
    await expect(page).toHaveURL(/\/stands\/[a-zA-Z0-9]+/);

    // 詳細ページの要素を確認
    await expect(page.getByText('1番台')).toBeVisible();
    await expect(page.getByText('ダブルアップル')).toBeVisible();
    await expect(page.getByRole('button', { name: '戻る' })).toBeVisible();
    await expect(page.getByText('履歴 (最新10件)')).toBeVisible();
  });

  test('should perform action in detail page', async ({ page }) => {
    // 詳細ページへ移動
    await page.getByRole('button', { name: '詳細' }).click();
    await expect(page).toHaveURL(/\/stands\/[a-zA-Z0-9]+/);

    // クイックアクションを実行
    await page.locator('button').filter({ hasText: 'すす捨て' }).first().click();
    await page.waitForTimeout(500);

    // 履歴に追加されることを確認
    const historySection = page.locator('text=履歴 (最新10件)').locator('..');
    await expect(historySection.getByText('すす捨て')).toBeVisible();
  });

  test('should go back to main page', async ({ page }) => {
    // 詳細ページへ移動
    await page.getByRole('button', { name: '詳細' }).click();
    await expect(page).toHaveURL(/\/stands\/[a-zA-Z0-9]+/);

    // 戻るボタンをクリック
    await page.getByRole('button', { name: '戻る' }).click();

    // メインページに戻ることを確認
    await expect(page).toHaveURL('/');
    await expect(page.getByText('1番台')).toBeVisible();
  });

  test('should cancel session end', async ({ page }) => {
    // 詳細ページへ移動
    await page.getByRole('button', { name: '詳細' }).click();

    // セッション終了ボタンをクリック
    await page.getByRole('button', { name: 'セッション終了' }).click();

    // 確認モーダルが表示されることを確認
    await expect(page.getByText('セッション終了の確認')).toBeVisible();
    await expect(page.getByText('1番台 ダブルアップル')).toBeVisible();

    // キャンセルボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // モーダルが閉じ、詳細ページに残ることを確認
    await expect(page.getByText('セッション終了の確認')).not.toBeVisible();
    await expect(page.getByText('1番台')).toBeVisible();
  });

  test('should end session successfully', async ({ page }) => {
    // 詳細ページへ移動
    await page.getByRole('button', { name: '詳細' }).click();

    // セッション終了ボタンをクリック
    await page.getByRole('button', { name: 'セッション終了' }).click();

    // 確認モーダルで終了するをクリック
    await page.getByRole('button', { name: '終了する' }).click();

    // メインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/');

    // セッションが削除され、空の状態になることを確認
    await expect(page.getByText('まず、セッションを追加してみてください♪')).toBeVisible();
  });
});
