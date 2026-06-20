/**
 * MAX Messenger webhook handler.
 *
 * Processes inbound webhook requests from MAX Bot API:
 * - Verify HMAC-SHA256 signature
 * - Parse update type (message_created, message_callback)
 * - Dispatch to OpenClaw gateway
 */

import type { MaxWebhookUpdate } from './types.js';

export async function handleWebhook(req: any, res: any): Promise<void> {
  try {
    const body = await req.text();
    const signature = req.headers['x-max-signature'] || '';
    const secret = process.env.MAX_WEBHOOK_SECRET || '';

    // Verify signature if secret is configured
    if (secret && signature) {
      const valid = await verifySignature(body, signature, secret);
      if (!valid) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    }

    const update: MaxWebhookUpdate = JSON.parse(body);

    // Process update asynchronously (respond immediately to MAX)
    res.status(200).json({ ok: true });

    // Dispatch based on update type
    if (update.update_type === 'message_created' && update.message) {
      await handleMessageCreated(update);
    } else if (update.update_type === 'message_callback' && update.callback) {
      await handleMessageCallback(update);
    }
  } catch (err) {
    console.error('[max-messenger] Webhook error:', err);
    // Already responded, can't change status
  }
}

async function handleMessageCreated(update: MaxWebhookUpdate): Promise<void> {
  const message = update.message!;
  const sender = message.sender || {};
  const recipient = message.recipient || {};
  const body = message.body || {};

  const userId = sender.user_id || 0;
  const chatId = recipient.chat_id || 0;
  const text = body.text || '';
  const messageId = body.mid || message.message_id || '';
  const userName = sender.name || sender.first_name || 'Unknown';

  console.log(`[max-messenger] Message from ${userName} (${userId}): ${text}`);

  // TODO: Dispatch to OpenClaw gateway via runtime.channel.inbound.run
  // This will be implemented when the plugin is loaded in OpenClaw runtime
}

async function handleMessageCallback(update: MaxWebhookUpdate): Promise<void> {
  const callback = update.callback!;
  const message = update.message || {};
  const sender = message.sender || {};

  const userId = sender.user_id || 0;
  const callbackId = callback.id || '';
  const callbackPayload = callback.payload || '';
  const buttonText = callback.text || '';

  console.log(`[max-messenger] Callback from ${userId}: [${buttonText}] ${callbackPayload}`);

  // TODO: Dispatch to OpenClaw gateway
}

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const bodyData = encoder.encode(body);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const expected = await crypto.subtle.sign('HMAC', key, bodyData);
  const expectedHex = bufferToHex(expected);

  return expectedHex === signature;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
