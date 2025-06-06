import { defineWindowMessaging } from '@webext-core/messaging/page';

export interface WebsiteMessengerSchema {
  triggerExportImg(data: unknown): void;
}

export const websiteMessenger = defineWindowMessaging<WebsiteMessengerSchema>({
  namespace: 'website-messaging',
}); 