# CopyRaw

Lightweight Discord bot for copying raw message content. Two commands, runs anywhere Docker does.

## Commands

### Copy Raw (message context menu)

Right-click any message, go to Apps, and select "Copy Raw" to get the raw markdown content as an ephemeral `raw.md` file attachment.

### /copyraw (slash command)

Fetches the last 25 messages in the channel, skips bot and system messages, then collects consecutive messages from the most recent author that were sent within 60 seconds of each other. Replies with a `raw.md` file containing the stitched content in chronological order.

## Discord Setup

Before deploying the bot, you need to create a Discord application and configure it.

### 1. Create the application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it "CopyRaw"
3. Upload an avatar under General Information if you have one

### 2. Make the bot private (optional but recommended)

Discord requires you to remove the install link before toggling the public bot setting off.

1. Go to **Installation** in the left sidebar
2. Set **Install Link** to **None** and save
3. Go to **Bot** in the left sidebar
4. Under **Authorization Flow**, toggle **Public Bot** to off

### 3. Create the bot and get the token

1. Go to **Bot** in the left sidebar
2. Click "Reset Token" to generate a bot token
3. Copy the token and save it somewhere safe (you will not be able to see it again)
4. Under **Privileged Gateway Intents**, enable **Message Content Intent**. The `/copyraw` command fetches messages via the REST API, which requires this intent to read content from other users and bots.

### 4. Get the Client ID and Guild ID

1. **Client ID**: Go to **OAuth2** in the left sidebar. The Client ID is shown under Client Information.
2. **Guild ID**: In Discord, enable Developer Mode (Settings > App Settings > Advanced > Developer Mode). Right-click your server name and click "Copy Server ID".

### 5. Add the bot to your server

1. Go to **OAuth2** in the left sidebar
2. Under **Scopes**, check `bot` and `applications.commands`
3. Under **Bot Permissions**, check:
   - Read Message History
   - Send Messages
   - Attach Files
4. Copy the **Generated URL** at the bottom and open it in your browser
5. Select your server and authorize

## Quick Start

```bash
git clone https://github.com/av1155/copyraw-bot.git
cd copyraw-bot
```

Set your environment variables (see `.env.example` for the required keys), then start the bot:

```bash
DISCORD_TOKEN=... CLIENT_ID=... GUILD_ID=... REGISTER_COMMANDS=1 docker compose up -d
```

After the logs show "Registered 2 commands", restart without the flag:

```bash
DISCORD_TOKEN=... CLIENT_ID=... GUILD_ID=... docker compose up -d
```

## Deploy (Portainer)

1. In Portainer, go to Stacks and click "Add stack"
2. Paste the contents of `docker-compose.yml`
3. Scroll to "Environment variables" and add:
   - `DISCORD_TOKEN` (bot token from step 3 above)
   - `CLIENT_ID` (application client ID from step 4 above)
   - `GUILD_ID` (your server ID from step 4 above)
   - `REGISTER_COMMANDS` set to `1`
4. Deploy the stack

Once the logs show "Registered 2 commands" and "Ready as CopyRaw#...", change `REGISTER_COMMANDS` back to `0` and redeploy. Commands only need to be registered once, or again after changing command definitions.

The container restarts automatically unless you stop it. To update after a new image is pushed, click "Pull and redeploy" in Portainer or run `docker compose pull && docker compose up -d`.

## Development

For local development without Docker:

```bash
npm install
export DISCORD_TOKEN="your-bot-token"
export CLIENT_ID="your-application-id"
export GUILD_ID="your-server-id"
node deploy-commands.js   # one-time command registration
node index.js
```

## Architecture

| File | Purpose |
|---|---|
| `index.js` | Bot client, command handlers, message formatting |
| `deploy-commands.js` | One-time slash command and context menu registration |
| `package.json` | Project manifest, discord.js v14 dependency |
| `Dockerfile` | Production container image (node:22-alpine) |
| `docker-compose.yml` | Deployment descriptor, pulls from GHCR |
| `.github/workflows/release.yml` | CI/CD: builds and pushes Docker image on every push to main |

## Required Intents

`Guilds`, `GuildMessages`, and `MessageContent` (privileged). The Message Content intent must be enabled in the Discord Developer Portal under Bot > Privileged Gateway Intents. Without it, the `/copyraw` command cannot read message content from other users.
