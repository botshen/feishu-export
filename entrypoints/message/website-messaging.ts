import { defineWindowMessaging } from '@webext-core/messaging/page';

export interface WebsiteMessengerSchema {
  triggerExportMarkdown(data: unknown): void;
  triggerExportHtml(data: unknown): void;
}

export const websiteMessenger = defineWindowMessaging<WebsiteMessengerSchema>({
  namespace: 'website-messaging',
}); 