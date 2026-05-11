import type { Locator, Page } from '@playwright/test';
import { waitForPageSettled } from '../visual-stability';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly viewTradesLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'React Data Dashboard' });
    this.viewTradesLink = page
      .getByRole('main')
      .getByRole('link', { name: /View trades/ });
  }

  async goto() {
    await this.page.goto('/');
    await waitForPageSettled(this.page);
  }
}
