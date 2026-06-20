/**
 * MAX Messenger channel plugin for OpenClaw.
 *
 * Uses the modern channel plugin architecture with:
 * - createChatChannelPlugin for the channel definition
 * - defineChannelMessageAdapter for outbound message sending
 *
 * MAX Bot API: https://dev.max.ru/docs/chatbots/bots-create
 */

import {
  createChatChannelPlugin,
  createChannelPluginBase,
} from 'openclaw/plugin-sdk/channel-core';
import type { ResolvedMaxAccount } from './types.js';

import { MaxClient } from './client.js';

/**
 * Resolve account from OpenClaw config section.
 */
function resolveAccount(cfg: any, accountId: string): ResolvedMaxAccount {
  const channelCfg = cfg?.channels?.['max-messenger'] || {};
  const accounts = channelCfg.accounts || {};
  const account = accounts[accountId] || channelCfg;

  return {
    accountId: accountId || null,
    token: account.token || channelCfg.token || process.env.MAX_BOT_TOKEN || '',
    allowFrom: account.allowFrom || channelCfg.allowFrom || [],
    dmPolicy: account.dmPolicy || channelCfg.dmPolicy || 'pairing',
    groupPolicy: account.groupPolicy || channelCfg.groupPolicy || 'allowlist',
    groups: account.groups || channelCfg.groups || {},
    webhookUrl: account.webhookUrl || channelCfg.webhookUrl || process.env.MAX_WEBHOOK_URL,
    webhookSecret: account.webhookSecret || channelCfg.webhookSecret || process.env.MAX_WEBHOOK_SECRET,
    apiBaseUrl: account.apiBaseUrl || channelCfg.apiBaseUrl || process.env.MAX_API_BASE_URL,
    homeChannel: account.homeChannel || channelCfg.homeChannel,
  };
}

/**
 * Check if account is configured.
 */
function isConfigured(cfg: any): boolean {
  const resolved = resolveAccount(cfg, '');
  return !!resolved.token;
}

/**
 * Inspect account status (read-only).
 */
function inspectAccount(cfg: any, accountId: string) {
  const resolved = resolveAccount(cfg, accountId);
  return {
    enabled: true,
    configured: !!resolved.token,
    tokenStatus: (resolved.token ? 'present' : 'missing') as 'present' | 'missing',
  };
}

/**
 * Resolve session conversation from raw MAX conversation ID.
 * Direct messages use user_id, group chats use chat_id.
 */
function resolveSessionConversation(rawId: string) {
  const isGroup = rawId.startsWith('group:') || rawId.startsWith('chat:');
  const baseId = rawId.replace(/^(group|chat|user):/, '');
  return {
    conversationId: baseId,
    threadId: undefined,
    baseConversationId: baseId,
    parentConversationCandidates: [] as string[],
  };
}

/**
 * The MAX Messenger channel plugin.
 */
export const maxMessengerPlugin = createChatChannelPlugin<ResolvedMaxAccount>({
  base: createChannelPluginBase({
    id: 'max-messenger',

    setup: {
      resolveAccount,
      inspectAccount,
    },

    capabilities: {
      chatTypes: ['direct', 'group'],
      reactions: false,
      threads: false,
      media: true,
      nativeCommands: true,
    },
  }),

  // DM security policy
  security: {
    dm: {
      channelKey: 'max-messenger',
      resolvePolicy: (account) => account.dmPolicy,
      resolveAllowFrom: (account) => account.allowFrom,
      defaultPolicy: 'pairing',
    },
  },

  // Pairing flow (DM approval)
  pairing: {
    text: {
      idLabel: 'MAX username',
      message: 'Send this code to verify your identity:',
      notify: async ({ target, code }) => {
        const client = new MaxClient({ token: '' });
        await client.sendMessage(
          { user_id: parseInt(target, 10) },
          { text: `Your verification code: ${code}` }
        );
      },
    },
  },

  // Threading mode
  threading: {
    topLevelReplyToMode: 'reply',
  },

  // Outbound messaging
  outbound: {
    attachedResults: {
      channel: 'max-messenger',

      sendText: async ({ to, text, accountId, replyToId }) => {
        const account = resolveAccount({}, accountId || '');
        const client = new MaxClient({ token: account.token, baseUrl: account.apiBaseUrl });
        const target = parseTarget(to);
        const result = await client.sendMessage(target, {
          text,
          reply_to: replyToId,
        });
        return {
          channel: 'max-messenger',
          messageId: result?.message?.body?.mid || '',
          conversationId: to,
        };
      },

      sendMedia: async ({ to, media, accountId }) => {
        const account = resolveAccount({}, accountId || '');
        const client = new MaxClient({ token: account.token, baseUrl: account.apiBaseUrl });
        const target = parseTarget(to);

        if (media.kind === 'image') {
          const result = await client.sendMessage(target, {
            attachments: [{ type: 'image', payload: { url: media.url } }],
          });
          return {
            channel: 'max-messenger',
            messageId: result?.message?.body?.mid || '',
            conversationId: to,
          };
        }

        if (media.kind === 'file' || media.kind === 'audio') {
          const result = await client.sendMessage(target, {
            attachments: [{ type: media.kind, payload: { url: media.url } }],
          });
          return {
            channel: 'max-messenger',
            messageId: result?.message?.body?.mid || '',
            conversationId: to,
          };
        }

        throw new Error(`Unsupported media kind: ${media.kind}`);
      },
    },
  },

  // Typing indicator via heartbeat
  heartbeat: {
    sendTyping: async ({ to }) => {
      const account = resolveAccount({}, '');
      const client = new MaxClient({ token: account.token, baseUrl: account.apiBaseUrl });
      const target = parseTarget(to);
      if (target.chat_id) {
        await client.sendChatAction(target.chat_id, 'typing_on');
      }
    },
    clearTyping: async ({ to }) => {
      const account = resolveAccount({}, '');
      const client = new MaxClient({ token: account.token, baseUrl: account.apiBaseUrl });
      const target = parseTarget(to);
      if (target.chat_id) {
        await client.sendChatAction(target.chat_id, 'typing_off');
      }
    },
  },
});

/**
 * Parse target string into MAX API target format.
 * Formats: "user:12345", "chat:67890", or plain numeric ID (treated as user_id)
 */
function parseTarget(to: string): MaxOutboundTargetClean {
  if (to.startsWith('user:')) {
    return { user_id: parseInt(to.slice(5), 10) };
  }
  if (to.startsWith('chat:') || to.startsWith('group:')) {
    return { chat_id: parseInt(to.split(':')[1], 10) };
  }
  // Plain numeric ID — treat as user_id
  const num = parseInt(to, 10);
  if (!isNaN(num)) {
    return { user_id: num };
  }
  return { user_id: 0 };
}

interface MaxOutboundTargetClean {
  user_id?: number;
  chat_id?: number;
}
