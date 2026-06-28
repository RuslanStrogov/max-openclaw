<div align="center">

  <h3>🛠️ Технологии</h3>

  <p>
    <img src="https://img.shields.io/badge/TypeScript-5.5+-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Node.js-22+-339933?logo=nodedotjs&logoColor=white" alt="Node.js"/>
    <img src="https://img.shields.io/badge/OpenClaw-2026.6+-FF6B00?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0Y2QjAwMCI+PHBhdGggZD0iTTEyIDJMMTggOEwxOCAyMkw2IDIyTDYgOEwxMiAyWiIvPjwvc3ZnPg==&logoColor=white" alt="OpenClaw"/>
    <img src="https://img.shields.io/badge/MAX-Bot%20API-6366F1?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzYzNjZmMSI+PHBhdGggZD0iTTEyIDJMMTggOEwxOCAyMkw2IDIyTDYgOEwxMiAyWiIvPjwvc3ZnPg==&logoColor=white" alt="MAX"/>
    <img src="https://img.shields.io/badge/Vitest-2.0+-6E9F18?logo=vitest&logoColor=white" alt="Vitest"/>
    <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white" alt="GitHub Actions"/>
    <img src="https://img.shields.io/badge/License-MIT-22C55E" alt="MIT"/>
  </p>

  <h3>MAX Messenger — Channel Plugin для OpenClaw</h3>
  <p>Нативный плагин-канал для подключения мессенджера <a href="https://max.ru">MAX</a> через Bot API к AI-агенту <a href="https://docs.openclaw.ai">OpenClaw</a></p>

  <p><sub>🎨 Designed by <a href="https://br-design.ru/">BR-DESIGN</a></sub></p>

</div>

---

## 📋 Содержание

- [Возможности](#-возможности)
- [Требования](#-требования)
- [Установка](#-установка)
- [Настройка](#-настройка)
- [Использование](#-использование)
- [Структура проекта](#-структура-проекта)
- [Архитектура](#-архитектура)
- [Конфигурация](#-конфигурация)
- [MAX Bot API](#-max-bot-api)
- [Сравнение с Telegram Bot API](#-сравнение-с-telegram-bot-api)
- [Разработка](#-разработка)
- [Тестирование](#-тестирование)
- [Релизы и CI/CD](#-релизы-и-cicd)
- [Лицензия](#-лицензия)

---

## ✨ Возможности

### Что уже работает

| Фича | Статус |
|------|--------|
| Приём и отправка текстовых сообщений | ✅ |
| Inline keyboard (кнопки с callback) | ✅ |
| Индикатор «Печатает...» (heartbeat typing) | ✅ |
| Markdown-форматирование | ✅ |
| Белый список пользователей (DM policy) | ✅ |
| Webhook приём сообщений | ✅ |
| HMAC-SHA256 верификация webhook | ✅ |
| Отправка изображений (upload API) | ✅ |
| Отправка файлов (upload API) | ✅ |
| Отправка аудио (upload API) | ✅ |
| Групповые чаты (group/channel/supergroup) | ✅ |
| Per-group политики (allowlist/disabled) | ✅ |
| DM security: pairing, allowlist, open, disabled | ✅ |
| Pairing flow (код верификации) | ✅ |
| Автоматические релизы (GitHub Release) | ✅ |
| CI (тесты + линтер) | ✅ |

---

## 📋 Требования

- [OpenClaw](https://docs.openclaw.ai) >= 2026.6.1
- Node.js >= 22 (для разработки)
- Сервер с публичным IP для приёма webhook
- SSL-сертификат (Let's Encrypt или самоподписанный)

---

## 📦 Установка

### Установка плагина

```bash
# Из GitHub репозитория
openclaw plugins install github:RuslanStrogov/max-openclaw

# Или из локальной копии
git clone https://github.com/RuslanStrogov/max-openclaw.git
openclaw plugins install ./max-openclaw

# Перезапустите gateway
openclaw gateway restart
```

### Из исходников (для разработки)

```bash
git clone https://github.com/RuslanStrogov/max-openclaw.git
cd max-openclaw
npm install
npm run build
openclaw plugins install .
openclaw gateway restart
```

---

## ⚙️ Настройка

### 1. Создайте бота в MAX

> ⚠️ **Важно:** Создание ботов на платформе MAX доступно **только юридическим лицам, ИП и самозанятым** (резидентам РФ). Физическим лицам создание ботов **недоступно**.

| Тип профиля | Кол-во ботов |
|---|---|
| Организация / ИП | Несколько (не ограничено платформой) |
| Самозанятый | Ограничено |

**Пошаговая инструкция:**

1. Перейдите на [портал MAX для партнёров](https://business.max.ru)
2. **Создайте и верифицируйте профиль** организации, ИП или самозанятого
3. В панели управления нажмите **«Добавить бота»**
4. Заполните данные бота (карточку):
   - **Название** — от 1 до 59 символов
   - **Никнейм** — генерируется автоматически (должен заканчиваться на `_bot`)
   - Сайт организации, логотип и описание
5. Нажмите **«Готово»** — бот создан и отправлен на **модерацию**
6. Дождитесь уведомления о прохождении модерации
7. После модерации **получите токен бота**

Подробнее: [MAX для разработчиков — Создание чат-бота](https://dev.max.ru/docs/chatbots/bots-create)

### 2. Настройте конфигурацию OpenClaw

```bash
openclaw config set channels.max-messenger.token "YOUR_MAX_BOT_TOKEN"
openclaw config set channels.max-messenger.webhookUrl "https://your-domain.com/max-messenger/webhook"
openclaw config set channels.max-messenger.dmPolicy "open"
```

Или через JSON конфиг:

```json5
{
  channels: {
    "max-messenger": {
      enabled: true,
      token: "YOUR_MAX_BOT_TOKEN",
      webhookUrl: "https://your-domain.com/max-messenger/webhook",
      webhookSecret: "optional-hmac-secret",
      apiBaseUrl: "https://platform-api.max.ru",
      dmPolicy: "open",
      allowFrom: [],
      groupPolicy: "allowlist",
      groups: {
        "group_chat_id": {
          requireMention: true,
          enabled: true,
          allowFrom: []
        }
      },
      homeChannel: ""
    }
  }
}
```

### 3. Настройте сервер (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location /max-messenger/webhook {
        proxy_pass http://127.0.0.1:18080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Зарегистрируйте webhook в MAX

Плагин автоматически регистрирует webhook при запуске. Если нужно вручную:

```bash
curl -X POST "https://platform-api.max.ru/subscriptions" \
  -H "Authorization: YOUR_MAX_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/max-messenger/webhook", "events": ["message_created", "message_callback"]}'
```

### 5. Перезапустите gateway

```bash
openclaw gateway restart
```

---

## 🚀 Использование

После подключения бот будет автоматически:

1. Принимать сообщения от пользователей MAX
2. Передавать их агенту OpenClaw
3. Отправлять ответы обратно в MAX

### DM Security Policies

| Политика | Описание |
|----------|----------|
| `pairing` | Новые пользователи должны пройти верификацию (код) |
| `allowlist` | Только пользователи из белого списка |
| `open` | Все пользователи могут писать боту |
| `disabled` | DM отключены |

### Group Chat

В групповых чатах бот реагирует на сообщения в зависимости от настроек:
- `requireMention: true` — только при упоминании бота
- `groupPolicy: "allowlist"` — только разрешённые группы

### Inline Keyboard

Агент может отправлять сообщения с кнопками:

```json5
{
  "text": "Выберите действие:",
  "attachments": [{
    "type": "inline_keyboard",
    "payload": {
      "buttons": [
        [{"text": "Да", "payload": "yes"}, {"text": "Нет", "payload": "no"}],
        [{"text": "Отмена", "payload": "cancel", "style": "danger"}]
      ]
    }
  }]
}
```

---

## 📁 Структура проекта

```
max-openclaw/
├── index.ts                  # defineChannelPluginEntry — точка входа
├── setup-entry.ts            # defineSetupPluginEntry — для wizard/setup
├── src/
│   ├── channel.ts            # createChatChannelPlugin — основная логика
│   ├── client.ts             # HTTP-клиент MAX Bot API
│   ├── types.ts              # TypeScript типы
│   └── webhook.ts            # Webhook handler (inbound)
├── dist/                     # Скомпилированный JS
│   ├── index.js
│   ├── setup-entry.js
│   └── src/
│       ├── channel.js
│       ├── client.js
│       ├── types.js
│       └── webhook.js
├── tests/
│   └── channel.test.ts       # Unit тесты
├── .github/workflows/
│   ├── ci.yml                # CI pipeline
│   └── release.yml           # Release automation
├── package.json
├── openclaw.plugin.json      # Plugin manifest
├── tsconfig.json
├── vitest.config.ts
├── CHANGELOG.md
├── LICENSE
└── README.md
```

---

## 🏗️ Архитектура

```
┌──────────┐   webhook    ┌─────────────────┐   native    ┌──────────────┐
│          │ ──────────►  │                 │ ──────────►  │              │
│ MAX Bot  │              │ MAX Messenger   │              │ OpenClaw     │
│ API      │ ◄──────────  │ Plugin          │ ◄──────────  │ Agent        │
│          │  send_msg    │ (TypeScript)    │  response    │              │
└──────────┘              └─────────────────┘              └──────────────┘
```

### Поток сообщений

1. Пользователь пишет боту в MAX
2. MAX API отправляет webhook на плагин
3. Плагин верифицирует HMAC-SHA256 подпись
4. Плагин проверяет DM policy / allowlist
5. Плагин передаёт сообщение в OpenClaw Agent
6. Агент генерирует ответ
7. Плагин отправляет ответ обратно в MAX через Bot API

---

## 📊 Конфигурация

### Поля конфигурации

| Поле | Обязательное | По умолчанию | Описание |
|------|-------------|--------------|----------|
| `token` | ✅ | — | Токен бота MAX |
| `webhookUrl` | ❌ | — | Публичный URL для webhook |
| `webhookSecret` | ❌ | — | HMAC-SHA256 секрет |
| `apiBaseUrl` | ❌ | `https://platform-api.max.ru` | Базовый URL API |
| `dmPolicy` | ❌ | `pairing` | DM политика |
| `allowFrom` | ❌ | `[]` | Белый список user ID |
| `groupPolicy` | ❌ | `allowlist` | Политика групповых чатов |
| `groups` | ❌ | `{}` | Per-group настройки |
| `homeChannel` | ❌ | — | Chat ID для cron/уведомлений |

### DM Policies

| Политика | Поведение |
|----------|-----------|
| `pairing` | Новый пользователь получает код верификации. После подтверждения — добавляется в allowlist |
| `allowlist` | Только пользователи из `allowFrom` могут писать |
| `open` | Все могут писать |
| `disabled` | DM полностью отключены |

### Group Policy

| Политика | Поведение |
|----------|-----------|
| `open` | Все группы разрешены |
| `allowlist` | Только группы с `enabled: true` в `groups` |
| `disabled` | Групповые чаты отключены |

---

## 🔌 MAX Bot API

### Отправка сообщения

```
POST https://platform-api.max.ru/messages?user_id=12345
Authorization: YOUR_BOT_TOKEN
Content-Type: application/json

{
  "text": "Привет!",
  "format": "markdown"
}
```

Для групповых чатов:
```
POST https://platform-api.max.ru/messages?chat_id=67890
```

### Индикатор «Печатает...»

```
POST https://platform-api.max.ru/chats/67890/actions
Authorization: YOUR_BOT_TOKEN
Content-Type: application/json

{"action": "typing_on"}
```

### Загрузка файлов

```
POST https://platform-api.max.ru/uploads?type=image
Authorization: YOUR_BOT_TOKEN
Content-Type: multipart/form-data

file: <binary data>
```

### Inline Keyboard

```json5
{
  "text": "Выберите:",
  "attachments": [{
    "type": "inline_keyboard",
    "payload": {
      "buttons": [
        [{"text": "Кнопка 1", "payload": "btn1"}],
        [{"text": "Кнопка 2", "payload": "btn2", "style": "danger"}]
      ]
    }
  }]
}
```

### Callback от кнопок

При нажатии кнопки MAX отправляет webhook с `update_type: "message_callback"`:

```json5
{
  "update_type": "message_callback",
  "callback": {
    "id": "callback_id",
    "payload": "btn1",
    "text": "Кнопка 1"
  },
  "message": {
    "sender": {"user_id": 12345, "name": "User"},
    "recipient": {"chat_id": 67890}
  }
}
```

Подробнее: [MAX Bot API — Документация](https://dev.max.ru/docs/chatbots/bots-create)

---

## 📊 Сравнение с Telegram Bot API

| Возможность | Telegram | MAX Bot API |
|-------------|----------|-------------|
| Webhook | ✅ | ✅ |
| Long Polling | ✅ | ✅ |
| Inline keyboard | ✅ | ✅ |
| Reply keyboard | ✅ | ❌ (только inline) |
| Callback buttons | ✅ | ✅ |
| Send/Edit/Delete messages | ✅ | ✅ |
| Typing indicator | ✅ | ✅ |
| Read receipts | ✅ | ❌ |
| Bot commands menu | ✅ | ❌ |
| Send images/files | ✅ | ✅ (через upload) |
| Group chats | ✅ | ✅ |
| Channels | ✅ | ✅ |
| DM Policy | ✅ (via code) | ✅ (native) |

---

## 🛠️ Разработка

### Требования

- Node.js >= 22
- TypeScript >= 5.5
- OpenClaw >= 2026.6.1 (для тестирования)

### Установка

```bash
git clone https://github.com/RuslanStrogov/max-openclaw.git
cd max-openclaw
npm install
```

### Сборка

```bash
npm run build
```

### Линтинг

```bash
npm run lint
```

### Локальная установка в OpenClaw

```bash
npm run build
openclaw plugins install .
openclaw gateway restart
```

---

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Запуск в watch режиме
npm run dev

# С покрытием
npx vitest run --coverage
```

Тесты покрывают:
- MaxClient (создание, валидация токена)
- MaxApiError (ошибки)
- Target parsing (user:/chat:/group: префиксы)

---

## 🚀 Релизы и CI/CD

### Git flow

- `main` — стабильная ветка, релизы
- `develop` — ветка разработки, интеграция изменений
- Релизы помечаются тегами `v*` (например `v1.0.0`)

### GitHub Actions

| Workflow | Триггер | Описание |
|----------|---------|----------|
| **CI** | push/PR в `main`, `develop` | Сборка + тесты + линтер |
| **Release** | тег `v*` | Сборка + тесты + GitHub Release |

### Создание релиза

```bash
# Собрать изменения в develop
git checkout develop
# ... коммиты ...

# Слить в main и создать тег
git checkout main
git merge develop --no-ff
git tag -a v1.1.0 -m "Release v1.1.0: описание"
git push origin main --tags
```

---

## 📄 Лицензия

MIT License. См. [LICENSE](LICENSE).

---

## 🔗 Связанные проекты

| Проект | Описание |
|--------|----------|
| [MAX Hermes Bridge](https://github.com/RuslanStrogov/max-hermes) | Python-мост между MAX Bot API и Hermes Agent через CLI с поддержкой webhook, Docker и systemd. |
| [MAX Hermes Plugin](https://github.com/RuslanStrogov/max-hermes-plugin) | Нативный платформенный плагин для Hermes Gateway. Прямая интеграция MAX без моста. |

<div align="center">

  <sub>🎨 Designed by <a href="https://br-design.ru/">BR-DESIGN</a></sub>

</div>

<!-- bumped: 2026-06-29 01:20 -->
