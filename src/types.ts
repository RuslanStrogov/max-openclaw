/**
 * MAX Bot API types for OpenClaw channel plugin.
 *
 * Based on MAX Bot API documentation: https://dev.max.ru/docs/chatbots/bots-create
 */

// Inbound webhook payload types

export interface MaxWebhookUpdate {
  update_type: string;
  message?: MaxMessage;
  callback?: MaxCallback;
}

export interface MaxMessage {
  body?: MaxMessageBody;
  sender?: MaxSender;
  recipient?: MaxRecipient;
  timestamp?: number;
  message_id?: string;
}

export interface MaxMessageBody {
  mid?: string;
  text?: string;
  attachments?: MaxAttachment[];
}

export interface MaxSender {
  user_id?: number;
  name?: string;
  first_name?: string;
}

export interface MaxRecipient {
  chat_id?: number;
  user_id?: number;
}

export interface MaxCallback {
  id?: string;
  payload?: string;
  text?: string;
}

export interface MaxAttachment {
  type: MaxAttachmentType;
  payload: MaxAttachmentPayload;
}

export type MaxAttachmentType =
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'inline_keyboard'
  | 'contact'
  | 'location'
  | 'sticker';

export interface MaxAttachmentPayload {
  url?: string;
  token?: string;
  buttons?: MaxInlineKeyboardButton[][];
}

export interface MaxInlineKeyboardButton {
  text: string;
  payload: string;
}

// API response types

export interface MaxBotInfo {
  id?: number;
  name?: string;
  username?: string;
}

export interface MaxSendResult {
  message?: {
    body?: {
      mid?: string;
    };
  };
}

export interface MaxUploadResult {
  token?: string;
  url?: string;
}

// Outbound message types

export interface MaxOutboundMessage {
  text?: string;
  format?: 'markdown';
  attachments?: MaxAttachment[];
  reply_to?: string;
}

export interface MaxOutboundTarget {
  user_id?: number;
  chat_id?: number;
}

// Config types

export interface MaxMessengerAccount {
  accountId: string;
  token: string;
  allowFrom: string[];
  dmPolicy: 'pairing' | 'allowlist' | 'open' | 'disabled';
  groupPolicy: 'open' | 'disabled' | 'allowlist';
  groups: Record<string, MaxGroupConfig>;
  webhookUrl?: string;
  webhookSecret?: string;
  apiBaseUrl?: string;
  homeChannel?: string;
}

export interface MaxGroupConfig {
  requireMention?: boolean;
  enabled?: boolean;
  allowFrom?: string[];
}

// Resolved account type for OpenClaw

export interface ResolvedMaxAccount {
  accountId: string | null;
  token: string;
  allowFrom: Array<string | number>;
  dmPolicy: string;
  groupPolicy: string;
  groups: Record<string, MaxGroupConfig>;
  webhookUrl?: string;
  webhookSecret?: string;
  apiBaseUrl?: string;
  homeChannel?: string;
}
