import { defineWindowMessaging } from '@webext-core/messaging/page';

export interface WebsiteMessengerSchema {
  exportPdf(data: unknown): void;
  exportImage(data: unknown): void;
}

export const websiteMessenger = defineWindowMessaging<WebsiteMessengerSchema>({
  namespace: 'website-messaging',
}); 