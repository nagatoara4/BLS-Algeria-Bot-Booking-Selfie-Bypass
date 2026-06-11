# Telegram + n8n Setup

**Important:** Never put your Telegram bot token inside the public website code. Anyone could steal it.

Use **n8n** as a secure bridge:

```
Website → n8n Webhook → Telegram Bot → Your chat (7095113390)
```

## Step 1 — Create a Telegram bot

1. Open [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the steps
3. Copy the real token (format: `123456789:ABCdef...`)
4. Open your bot and send `/start`
5. Your chat ID is: **7095113390**

> The value `__n8n_BLANK_VALUE_...` is an n8n placeholder, not a real token. Replace it in n8n credentials.

## Step 2 — Import n8n workflow

1. Open your n8n instance
2. Import `n8n-telegram-workflow.json` from this folder
3. In the **Telegram** node:
   - Add your bot token as a credential
   - Set Chat ID: `7095113390`
4. Activate the workflow
5. Copy the **Webhook URL** (path: `bls-algeria-booking`)

## Step 3 — Connect the website

### GitHub Pages (production)

1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. Add secret: `N8N_WEBHOOK_URL` = your full webhook URL
3. Push any change to `website/` — deploy workflow injects `config.js` automatically

### Local testing

```bash
cp website/config.example.js website/config.js
```

Edit `website/config.js`:

```javascript
window.BLS_CONFIG = {
  n8nWebhookUrl: 'https://YOUR-N8N/webhook/bls-algeria-booking',
};
```

## What Telegram receives

When someone generates a script, you get a message with:

- Name and passport details
- Optional Telegram username
- Timestamp

Use this to help users for free.
