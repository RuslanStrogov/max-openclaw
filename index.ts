/**
 * MAX Messenger Channel Plugin — entry point.
 *
 * Registers the channel plugin with OpenClaw gateway:
 * - defineChannelPluginEntry for the channel
 * - registerFull for webhook HTTP route
 */

import { defineChannelPluginEntry } from 'openclaw/plugin-sdk/channel-core';
import { maxMessengerPlugin } from './src/channel.js';
import { handleWebhook } from './src/webhook.js';

export default defineChannelPluginEntry({
  id: 'max-messenger',
  name: 'MAX Messenger',
  description: 'MAX Messenger (max.ru) Bot API channel plugin for OpenClaw',
  plugin: maxMessengerPlugin,

  registerFull(api) {
    // Register webhook endpoint for inbound messages from MAX
    api.registerHttpRoute({
      path: '/max-messenger/webhook',
      auth: 'plugin',
      handler: handleWebhook,
    });
  },
});
