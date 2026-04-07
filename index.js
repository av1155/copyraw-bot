const {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  AttachmentBuilder,
} = require('discord.js');

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN environment variable');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Ready as ${c.user.tag}`);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function replyWithContent(interaction, content) {
  if (!content || content.trim().length === 0) {
    return interaction.reply({
      content: 'No text content in this message.',
      flags: MessageFlags.Ephemeral,
    });
  }

  if (content.length <= 1900) {
    return interaction.reply({
      content: `\`\`\`\n${content}\n\`\`\``,
      flags: MessageFlags.Ephemeral,
    });
  }

  const file = new AttachmentBuilder(Buffer.from(content, 'utf-8'), {
    name: 'raw.txt',
  });
  return interaction.reply({
    content: 'Content too long for a code block — attached as a file.',
    files: [file],
    flags: MessageFlags.Ephemeral,
  });
}

// ---------------------------------------------------------------------------
// Interaction handler
// ---------------------------------------------------------------------------

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // --- Context menu: "Copy Raw" ---
    if (interaction.isMessageContextMenuCommand() && interaction.commandName === 'Copy Raw') {
      const msg = interaction.targetMessage;
      return await replyWithContent(interaction, msg.content);
    }

    // --- Slash command: /copyraw ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'copyraw') {
      const channel = interaction.channel;
      if (!channel) {
        return await interaction.reply({
          content: 'Could not access the current channel.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const messages = await channel.messages.fetch({ limit: 25 });
      if (messages.size === 0) {
        return await interaction.reply({
          content: 'No messages found in this channel.',
          flags: MessageFlags.Ephemeral,
        });
      }

      // messages is newest-first; convert to array and keep that order for walking
      const sorted = [...messages.values()]; // newest first
      const authorId = sorted[0].author.id;
      const consecutive = [];

      for (const msg of sorted) {
        if (msg.author.id !== authorId) break;
        consecutive.push(msg.content);
      }

      // Reverse to chronological (oldest first), then stitch
      consecutive.reverse();
      const stitched = consecutive.join('\n\n---\n\n');

      return await replyWithContent(interaction, stitched);
    }
  } catch (error) {
    console.error('Interaction error:', error);
    const reply = {
      content: 'Something went wrong.',
      flags: MessageFlags.Ephemeral,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.login(token);
