# MAX Messenger — OpenClaw Channel Plugin

Connect [OpenClaw](https://docs.openclaw.ai) to [MAX Messenger](https://max.ru) via Bot API.

## Features

- **Text messages** with Markdown formatting
- **Images, files, audio** via MAX upload API
- **Inline keyboard** (callback buttons)
- **Typing indicator** (heartbeat)
- **DM security**: pairing, allowlist, open, disabled
- **Group chat support** with per-group policies
- **Webhook-based** inbound (no polling)
- **HMAC-SHA256** signature verification

## Installation

```bash
openclaw plugins install github:RuslanStrogov/max-openclaw
```

## Configuration

```json5
{
  channels: {
    "max-messenger": {
      enabled: true,
      token: "YOUR_MAX_BOT_TOKEN",          // Required
      webhookUrl: "https://your-domain.com/max-messenger/webhook",  // Required
      webhookSecret: "optional-secret",     // Optional, for HMAC verification
      apiBaseUrl: "https://platform-api.max.ru",  // Optional
      dmPolicy: "pairing",                  // pairing | allowlist | open | disabled
      allowFrom: [],                        // User IDs allowed to DM (empty = all)
      groupPolicy: "allowlist",             // open | disabled | allowlist
      groups: {
        "group_chat_id": {
          requireMention: true,
          enabled: true,
          allowFrom: []
        }
      },
      homeChannel: ""                      // Chat ID for cron/notification delivery
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MAX_BOT_TOKEN` | Yes | Bot token from MAX partner platform |
| `MAX_WEBHOOK_URL` | No | Public URL for webhook |
| `MAX_WEBHOOK_SECRET` | No | HMAC secret for verification |

## Bot Creation

MAX Bot is created at [max.ru partner platform](https://max.ru/se13320221_bot) for legal entities only (not individuals in RF).

## Architecture

```
max-openclaw/
├── index.ts              # defineChannelPluginEntry + webhook route
├── setup-entry.ts        # defineSetupPluginEntry
├── src/
│   ├── channel.ts        # createChatChannelPlugin (main logic)
│   ├── client.ts         # MAX Bot API HTTP client
│   ├── webhook.ts        # Webhook handler (inbound)
│   └── types.ts          # TypeScript types
└── tests/
    └── channel.test.ts   # Tests
```

## Development

```bash
npm install
npm test
npm run build
```

## License

MIT
