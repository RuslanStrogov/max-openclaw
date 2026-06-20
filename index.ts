/**
 * MAX Messenger Channel Plugin — entry point.
 *
 * Registers the channel plugin with OpenClaw gateway:
 * - defineChannelPluginEntry for the channel capability
 * - registerFull for any additional runtime registration
 */

import { defineChannelPluginEntry } from 'openclaw/plugin-sdk/channel-core';
import { maxMessengerPlugin } from './src/channel.js';

export default defineChannelPluginEntry({
  id: 'max-messenger',
  name: 'MAX Messenger',
  description: 'MAX Messenger (max.ru) Bot API channel plugin for OpenClaw',
  plugin: maxMessengerPlugin,

  registerFull(api) {
    // Additional runtime registration (if needed)
    // Webhook handling is managed by OpenClaw's channel runtime
  },
});
