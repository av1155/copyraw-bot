# CopyRaw

Lightweight Discord bot for copying raw message content. Two commands, no privileged intents, runs anywhere Docker does.

## Commands

### Copy Raw (message context menu)

Right-click any message, go to Apps, and select "Copy Raw" to get the raw markdown content as an ephemeral code block. Messages over 1900 characters are attached as a `.txt` file instead.

### /copyraw (slash command)

Fetches the last 25 messages in the channel, collects all consecutive messages from the most recent author (oldest first), stitches them with `---` separators, and replies ephemerally.

## Quick Start

```bash
git clone https://github.com/av1155/copyraw-bot.git
cd copyraw-bot
cp .env.example .env
```

Fill in your `.env` with real values from the [Discord Developer Portal](https://discord.com/developers/applications), then start the bot:

```bash
docker compose up -d
```

## Command Registration

Discord slash commands and context menus need to be registered once per guild. Run this after your first deploy or whenever you change the command definitions:

```bash
docker compose run --rm copyraw-bot node deploy-commands.js
```

## Deploy

These steps cover deployment to a Docker host (tested on Ubuntu 24.04 LXC).

1. SSH into the target machine
2. Create the project directory:
   ```bash
   mkdir -p /opt/copyraw-bot && cd /opt/copyraw-bot
   ```
3. Copy `docker-compose.yml` and your `.env` file to that directory
4. Pull the image and start the container:
   ```bash
   docker compose pull && docker compose up -d
   ```
5. Register commands once:
   ```bash
   docker compose run --rm copyraw-bot node deploy-commands.js
   ```

The container restarts automatically unless you stop it. To update after a new image is pushed, run `docker compose pull && docker compose up -d` again.

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

Only `Guilds` and `GuildMessages`. No privileged intents needed.
