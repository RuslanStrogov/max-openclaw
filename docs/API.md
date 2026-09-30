# MAX OpenClaw Plugin — API Reference

## MAX Bot API Обёртка

Плагин использует [MAX Bot API](https://dev.max.ru/docs/chatbots/bots-create) для взаимодействия с мессенджером MAX.

### MaxClient

Основной класс для работы с MAX Bot API.

```typescript
class MaxClient {
  constructor(config: MaxClientConfig)
}
```

#### Методы

| Метод | Описание |
|--------|----------|
| `sendMessage(text, target, options?)` | Отправка текстового сообщения |
| `sendPhoto(url, target, caption?)` | Отправка изображения |
| `sendFile(url, target, caption?)` | Отправка файла |
| `sendAudio(url, target, caption?)` | Отправка аудио |
| `sendTyping(target)` | Отправка индикатора «Печатает...» |
| `editMessage(text, target, messageId)` | Редактирование сообщения |
| `deleteMessage(target, messageId)` | Удаление сообщения |
| `answerCallback(callbackId, text, options?)` | Ответ на callback |

#### Target-формат

Target — строка, указывающая куда отправить сообщение:

- `chat:{chat_id}` — чат
- `user:{user_id}` — пользователь (DM)
- `group:{group_id}` — группа

### MaxApiError

```typescript
class MaxApiError extends Error {
  statusCode: number
  code: string
  details?: string
}
```

---

## Webhook Events

Плагин обрабатывает следующие события от MAX Bot API:

### `message_new`

Новое сообщение от пользователя.

```json5
{
  "update_type": "message_new",
  "message": {
    "id": "msg_id",
    "text": "Привет!",
    "sender": { "user_id": 12345, "name": "User" },
    "recipient": { "chat_id": 67890 }
  }
}
```

### `message_callback`

Нажатие на inline-кнопку.

```json5
{
  "update_type": "message_callback",
  "callback": {
    "id": "cb_id",
    "payload": "button_1",
    "text": "Кнопка 1"
  },
  "message": {
    "sender": { "user_id": 12345, "name": "User" },
    "recipient": { "chat_id": 67890 }
  }
}
```

---

## OpenClaw Plugin Interface

Плагин экспортирует стандартный для OpenClaw интерфейс:

```typescript
import { Plugin } from '@openclaw/core'

export default class MaxChannelPlugin implements Plugin {
  name = 'max'
  version = '1.0.0'

  async onLoad(): Promise<void> { /* ... */ }
  async onUnload(): Promise<void> { /* ... */ }
}
```

Плагин регистрируется как **канал** (`channel`) — OpenClaw Gateway маршрутизирует входящие сообщения через этот канал.