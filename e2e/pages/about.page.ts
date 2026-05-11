import type { Locator, Page } from '@playwright/test';
import { waitForPageSettled } from '../visual-stability';

export class AboutPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'About' });
  }

  async goto() {
    await this.page.goto('/about');
    await waitForPageSettled(this.page);
  }
}
