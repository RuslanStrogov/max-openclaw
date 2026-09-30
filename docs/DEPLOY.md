# Деплой MAX OpenClaw Plugin

## Требования

- Node.js >= 22
- OpenClaw >= 2026.6.1
- HTTP-сервер с публичным IP (для webhook)
- SSL-сертификат (Let's Encrypt или любой доверенный)

## Установка

```bash
# Клонирование
git clone https://github.com/RuslanStrogov/max-openclaw.git
cd max-openclaw

# Установка зависимостей
npm install

# Сборка TypeScript
npm run build
```

## Настройка OpenClaw

Добавить плагин в конфиг OpenClaw (`openclaw.yaml`):

```yaml
plugins:
  - name: max
    path: /path/to/max-openclaw
    config:
      token: "ваш_токен_бота"
      secret: "секрет_webhook"
      webhook_url: "https://your-server.com/webhook"
      dm_policy: "allowlist"
      allowed_users:
        - 12345
        - 67890
```

## Запуск

```bash
# Локально
openclaw gateway start

# Через systemd (рекомендуется)
sudo cp systemd/openclaw-max.service /etc/systemd/system/
sudo systemctl enable --now openclaw-max

# Через Docker
docker compose up -d
```

## Webhook

После запуска зарегистрировать webhook в MAX Bot API:

```bash
curl -X POST https://api.max.ru/v1/bots/{token}/webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-server.com/webhook"}'
```

Проверка:

```bash
curl -X GET https://api.max.ru/v1/bots/{token}/webhook
```

## Проверка

```bash
# Логи плагина
journalctl -u openclaw-max -f --no-hostname -o cat

# Health check (если настроен)
curl https://your-server.com/health
```

## Обновление

```bash
cd /path/to/max-openclaw
git pull
npm install
npm run build
systemctl restart openclaw-max
```