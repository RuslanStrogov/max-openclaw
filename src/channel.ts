/**
 * MAX Messenger channel plugin for OpenClaw.
 *
 * MAX Bot API: https://dev.max.ru/docs/chatbots/bots-create
 */
import { createChatChannelPlugin } from 'openclaw/plugin-sdk/channel-core';
import type { ResolvedMaxAccount } from './types.js';
import { MaxClient } from './client.js';

/**
 * Resolve account from OpenClaw config section.
 */
function resolveAccount(cfg: any, accountId?: string | null): ResolvedMaxAccount {
  const channelCfg = cfg?.channels?.['max-messenger'] || {};
  const accounts = channelCfg.accounts || {};
  const id = accountId || channelCfg.defaultAccount || '';
  const account = id ? accounts[id] : channelCfg;

  return {
    accountId: id || null,
    token: account?.token || channelCfg.token || process.env.MAX_BOT_TOKEN || '',
    allowFrom: account?.allowFrom || channelCfg.allowFrom || [],
    dmPolicy: account?.dmPolicy || channelCfg.dmPolicy || 'pairing',
    groupPolicy: account?.groupPolicy || channelCfg.groupPolicy || 'allowlist',
    groups: account?.groups || channelCfg.groups || {},
    webhookUrl: account?.webhookUrl || channelCfg.webhookUrl || process.env.MAX_WEBHOOK_URL,
    webhookSecret: account?.webhookSecret || channelCfg.webhookSecret || process.env.MAX_WEBHOOK_SECRET,
    apiBaseUrl: account?.apiBaseUrl || channelCfg.apiBaseUrl || process.env.MAX_API_BASE_URL,
    homeChannel: account?.homeChannel || channelCfg.homeChannel,
  };
}

/**
 * List all account IDs in config.
 */
function listAccountIds(cfg: any): string[] {
  const channelCfg = cfg?.channels?.['max-messenger'] || {};
  const accounts = channelCfg.accounts || {};
  return Object.keys(accounts);
}

/**
 * Check if account is configured.
 */
function isConfiguredFn(account: ResolvedMaxAccount, _cfg: any): boolean {
  return !!account.token;
}

/**
 * Describe account snapshot.
 */
function describeAccount(account: ResolvedMaxAccount, _cfg: any) {
  return {
    accountId: account.accountId || undefined,
    configured: !!account.token,
    enabled: true,
  };
}

/**
 * The MAX Messenger channel plugin.
 */
export const maxMessengerPlugin = createChatChannelPlugin<ResolvedMaxAccount>({
  base: {
    id: 'max-messenger',

    capabilities: {
      chatTypes: ['direct', 'group'],
      reactions: false,
      threads: false,
      media: true,
      nativeCommands: true,
      reply: true,
    },

    reload: {
      configPrefixes: ['channels.max-messenger'],
    },

    config: {
      listAccountIds,
      resolveAccount,
      isConfigured: isConfiguredFn,
      describeAccount,
    },

    setup: {
      applyAccountConfig: ({ cfg, accountId, input }) => {
        const newCfg = structuredClone(cfg);
        if (!newCfg.channels) newCfg.channels = {};
        if (!newCfg.channels['max-messenger']) newCfg.channels['max-messenger'] = {};
        const mmCfg = newCfg.channels['max-messenger'];

        if (input.token) mmCfg.token = input.token;
        if (input.webhookUrl) mmCfg.webhookUrl = input.webhookUrl;
        if (input.webhookPath) mmCfg.webhookPath = input.webhookPath;
        if (input.baseUrl) mmCfg.apiBaseUrl = input.baseUrl;
        if (input.secret) mmCfg.webhookSecret = input.secret;
        if (input.name) mmCfg.name = input.name;

        return newCfg;
      },
    },

    messaging: {
      targetPrefixes: ['max', 'user', 'chat'],
      resolveDeliveryTarget: ({ conversationId }) => {
        return { to: conversationId };
      },
    },
  } as any,

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
      notify: async (params: any) => {
        const client = new MaxClient({ token: '' });
        await client.sendMessage(
          { user_id: parseInt(params.target, 10) },
          { text: `Your verification code: ${params.code}` }
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

      sendMedia: async ({ to, mediaUrl, accountId }) => {
        const account = resolveAccount({}, accountId || '');
        const client = new MaxClient({ token: account.token, baseUrl: account.apiBaseUrl });
        const target = parseTarget(to);

        const result = await client.sendMessage(target, {
          attachments: [{ type: 'image', payload: { url: mediaUrl } }],
        });
        return {
          channel: 'max-messenger',
          messageId: result?.message?.body?.mid || '',
          conversationId: to,
        };
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
