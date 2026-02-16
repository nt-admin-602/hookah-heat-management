import { test, expect } from '@playwright/test';

test.describe('Advanced Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      indexedDB.deleteDatabase('hookah-heat-db');
    });
    await page.reload();
  });

  test('should manage flavor history', async ({ page }) => {
    // 1つ目のセッション作成（グレープ）
    await page.getByRole('button', { name: 'セッション追加' }).click();
    let modal = page.locator('.fixed.inset-0.bg-black\\/50').locator('.bg-slate-800');
    await modal.getByRole('button', { name: '1' }).click();
    await modal.getByPlaceholder('新規入力または選択').fill('グレープ');
    await modal.locator('button[type="submit"]').click();
    await expect(page.getByText('グレープ')).toBeVisible();

    // 2つ目のセッション作成開始
    await page.getByRole('button', { name: 'セッション追加' }).click();
    modal = page.locator('.fixed.inset-0.bg-black\\/50').locator('.bg-slate-800');

    // フレーバー入力欄をクリックしてドロップダウンを確認
    const flavorInput = modal.getByPlaceholder('新規入力または選択');
    await flavorInput.click();

    // ドロップダウンに "グレープ" が含まれることを確認
    await expect(modal.locator('button').filter({ hasText: 'グレープ' })).toBeVisible();

    // 新しいフレーバー（ミント）を入力
    await flavorInput.fill('ミント');
    await modal.getByRole('button', { name: '2' }).click();
    await modal.locator('button[type="submit"]').click();
    await expect(page.getByText('ミント')).toBeVisible();

    // 3つ目のセッション作成開始
    await page.getByRole('button', { name: 'セッション追加' }).click();
    modal = page.locator('.fixed.inset-0.bg-black\\/50').locator('.bg-slate-800');

    // ドロップダウンに両方のフレーバーが含まれることを確認
    await flavorInput.click();
    await expect(modal.locator('button').filter({ hasText: 'グレープ' })).toBeVisible();
    await expect(modal.locator('button').filter({ hasText: 'ミント' })).toBeVisible();
  });

  test('should persist data after page reload', async ({ page }) => {
    // セッション作成
    await page.getByRole('button', { name: 'セッション追加' }).click();
    const modal = page.locator('.fixed.inset-0.bg-black\\/50').locator('.bg-slate-800');
    await modal.getByRole('button', { name: '1' }).click();
    await modal.getByPlaceholder('新規入力または選択').fill('ダブルアップル');
    await modal.locator('button[type="submit"]').click();
    await expect(page.getByText('1番台')).toBeVisible();

    // アクション実行
    await page.locator('button').filter({ hasText: 'すす捨て' }).first().click();
    await page.waitForTimeout(500);

    // ページリロード
    await page.reload();

    // データが保持されることを確認
    await expect(page.getByText('1番台')).toBeVisible();
    await expect(page.getByText('ダブルアップル')).toBeVisible();
    const maintenanceSection = page.locator('text=最終メンテ:').locator('..');
    await expect(maintenanceSection.getByText('すす捨て')).toBeVisible();

    // 詳細ページへ移動
    await page.getByRole('button', { name: '詳細' }).click();

    // 履歴が保存されていることを確認
    await expect(page.getByText('履歴 (最新10件)')).toBeVisible();
    const historySection = page.locator('text=履歴 (最新10件)').locator('..');
    await expect(historySection.getByText('すす捨て')).toBeVisible();
  });

  test('should manage multiple sessions', async ({ page }) => {
    // 3つのセッションを作成
    for (let i = 1; i <= 3; i++) {
      await page.getByRole('button', { name: 'セッション追加' }).click();
      const modal = page.locator('.fixed.inset-0.bg-black\\/50').locator('.bg-slate-800');
      await modal.getByRole('button', { name: String(i) }).click();
      await modal.getByPlaceholder('新規入力または選択').fill(`フレーバー${i}`);
      await modal.locator('button[type="submit"]').click();
      await expect(page.getByText(`${i}番台`)).toBeVisible();
    }

    // すべてのセッションが表示されることを確認
    await expect(page.getByText('1番台')).toBeVisible();
    await expect(page.getByText('2番台')).toBeVisible();
    await expect(page.getByText('3番台')).toBeVisible();

    // 2番台のアクションを実行
    const standCards = page.locator('.p-4.bg-slate-800');
    const stand2Card = standCards.filter({ hasText: '2番台' });
    await stand2Card.locator('button').filter({ hasText: 'すす捨て' }).click();
    await page.waitForTimeout(500);

    // 2番台の最終メンテが更新されることを確認
    const maintenance2Section = stand2Card.locator('text=最終メンテ:').locator('..');
    await expect(maintenance2Section.getByText('すす捨て')).toBeVisible();
  });

  test('should check PWA manifest', async ({ page }) => {
    // マニフェストの存在を確認
    const manifestResponse = await page.goto('/manifest.webmanifest');
    expect(manifestResponse?.status()).toBe(200);

    // マニフェストの内容を確認
    const manifestContent = await manifestResponse?.json();
    expect(manifestContent.name).toBe('熾火守');
    expect(manifestContent.short_name).toBe('熾火守');
  });

  test('should load PWA icons', async ({ page, context }) => {
    await page.goto('/');

    // アイコンの読み込みを確認
    const iconResponse = await context.request.get('/icon.png');
    expect(iconResponse.status()).toBe(200);

    const appleIconResponse = await context.request.get('/apple-icon.png');
    expect(appleIconResponse.status()).toBe(200);
  });
});
