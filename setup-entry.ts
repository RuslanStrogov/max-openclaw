/**
 * MAX Messenger setup entry.
 *
 * Registers the setup plugin for wizard/configuration flow.
 */

import { defineSetupPluginEntry } from 'openclaw/plugin-sdk/channel-core';
import { maxMessengerPlugin } from './src/channel.js';

export default defineSetupPluginEntry(maxMessengerPlugin);
