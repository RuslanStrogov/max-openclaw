/**
 * MAX Bot API HTTP client.
 *
 * API docs: https://dev.max.ru/docs/chatbots/bots-create
 * Base URL: https://platform-api.max.ru
 * Auth: Authorization: <token> (NOT Bearer)
 */

import type {
  MaxBotInfo,
  MaxOutboundMessage,
  MaxOutboundTarget,
  MaxSendResult,
  MaxUploadResult,
} from './types.js';

export class MaxApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'MaxApiError';
  }
}

export class MaxClient {
  private readonly token: string;
  private readonly baseUrl: string;

  constructor(opts: { token: string; baseUrl?: string }) {
    if (!opts.token) {
      throw new Error('MAX_BOT_TOKEN is required');
    }
    this.token = opts.token;
    this.baseUrl = (opts.baseUrl || 'https://platform-api.max.ru').replace(/\/$/, '');
  }

  private get authHeader(): string {
    return this.token;
  }

  private async request<T>(
    method: string,
    path: string,
    opts?: { body?: unknown; query?: Record<string, string> }
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    if (opts?.query && Object.keys(opts.query).length > 0) {
      const params = new URLSearchParams(opts.query);
      url = `${url}?${params.toString()}`;
    }

    const headers: Record<string, string> = {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
    };

    const init: RequestInit = {
      method,
      headers,
    };

    if (opts?.body) {
      init.body = JSON.stringify(opts.body);
    }

    const response = await fetch(url, init);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new MaxApiError(
        `MAX API error ${response.status}: ${text || response.statusText}`,
        response.status
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get bot info (used for verification).
   */
  async getBotInfo(): Promise<MaxBotInfo> {
    return this.request<MaxBotInfo>('GET', '/bot');
  }

  /**
   * Subscribe to webhook updates.
   */
  async subscribe(url: string): Promise<boolean> {
    try {
      const result = await this.request<{ ok: boolean }>('POST', '/subscriptions', {
        body: { url, events: ['message_created', 'message_callback'] },
      });
      return result.ok !== false;
    } catch {
      return false;
    }
  }

  /**
   * Send a text message.
   * Uses query params for targeting: ?user_id=X or ?chat_id=X
   */
  async sendMessage(
    target: MaxOutboundTarget,
    message: MaxOutboundMessage
  ): Promise<MaxSendResult> {
    const query: Record<string, string> = {};
    if (target.user_id) {
      query.user_id = String(target.user_id);
    } else if (target.chat_id) {
      query.chat_id = String(target.chat_id);
    } else {
      throw new Error('Either user_id or chat_id must be provided');
    }

    return this.request<MaxSendResult>('POST', '/messages', {
      body: message,
      query,
    });
  }

  /**
   * Send typing indicator.
   */
  async sendChatAction(chatId: number, action: 'typing_on' | 'typing_off' = 'typing_on'): Promise<void> {
    await this.request('POST', `/chats/${chatId}/actions`, {
      body: { action },
    });
  }

  /**
   * Upload a file for attachment.
   */
  async uploadFile(file: Blob, type: 'image' | 'video' | 'audio' | 'file' = 'file'): Promise<MaxUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const url = `${this.baseUrl}/uploads`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new MaxApiError(`Upload failed: ${response.status}`, response.status);
    }

    return response.json() as Promise<MaxUploadResult>;
  }

  /**
   * Answer a callback (inline keyboard button press).
   */
  async answerCallback(callbackId: string, text?: string): Promise<void> {
    await this.request('POST', `/callbacks/${callbackId}/answer`, {
      body: { text: text || '' },
    });
  }

  /**
   * Verify webhook signature (HMAC-SHA256).
   */
  static verifySignature(body: string, signature: string, secret: string): boolean {
    if (!secret || !signature) return false;

    // HMAC-SHA256 computation
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const bodyData = encoder.encode(body);

    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    ).then(key => {
      const sigBytes = hexToBuffer(signature);
      return crypto.subtle.verify('HMAC', key, sigBytes, bodyData);
    }).catch(() => false);
  }
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}
