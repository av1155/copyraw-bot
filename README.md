# CopyRaw

Lightweight Discord bot for copying raw message content. Two commands, no privileged intents, runs anywhere Docker does.

## Commands

### Copy Raw (message context menu)

Right-click any message, go to Apps, and select "Copy Raw" to get the raw markdown content as an ephemeral code block. Messages over 1900 characters are attached as a `.txt` file instead.

### /copyraw (slash command)

Fetches the last 25 messages in the channel, collects all consecutive messages from the most recent author (oldest first), reconstructs the full message from chunked responses, and replies ephemerally.

## Quick Start

```bash
git clone https://github.com/av1155/copyraw-bot.git
cd copyraw-bot
```

Set your environment variables (see `.env.example` for the required keys), then start the bot:

```bash
DISCORD_TOKEN=... CLIENT_ID=... GUILD_ID=... docker compose up -d
```

## Deploy (Portainer)

1. In Portainer, go to Stacks and click "Add stack"
2. Paste the contents of `docker-compose.yml`
3. Scroll to "Environment variables" and add `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID` with your values
4. Deploy the stack

Slash commands are registered automatically on every container start. No manual registration step needed.

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

Only `Guilds` and `GuildMessages`. No privileged intents needed.
