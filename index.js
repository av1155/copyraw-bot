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
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Ready as ${c.user.tag}`);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function replyWithContent(interaction, content, label) {
  if (!content || content.trim().length === 0) {
    return interaction.reply({
      content: 'No text content in this message.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const file = new AttachmentBuilder(Buffer.from(content, 'utf-8'), {
    name: 'raw.md',
  });
  return interaction.reply({
    content: label,
    files: [file],
    flags: MessageFlags.Ephemeral,
  });
}

function extractContent(msg) {
  const parts = [];

  if (msg.content?.trim()) {
    parts.push(msg.content);
  }

  for (const embed of msg.embeds) {
    if (embed.title) parts.push(embed.title);
    if (embed.description) parts.push(embed.description);
    for (const field of embed.fields) {
      parts.push(`${field.name}\n${field.value}`);
    }
    if (embed.footer?.text) parts.push(embed.footer.text);
  }

  if (msg.attachments.size > 0) {
    const names = msg.attachments.map(a => a.name).join(', ');
    parts.push(`[Attachments: ${names}]`);
  }

  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Interaction handler
// ---------------------------------------------------------------------------

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // --- Context menu: "Copy Raw" ---
    if (interaction.isMessageContextMenuCommand() && interaction.commandName === 'Copy Raw') {
      const msg = interaction.targetMessage;
      return await replyWithContent(interaction, extractContent(msg), 'Copied 1 message.');
    }

    // --- Slash command: /copyraw ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'copyraw') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const channel = interaction.channel;
      if (!channel) {
        return await interaction.editReply({ content: 'Could not access the current channel.' });
      }

      const messages = await channel.messages.fetch({ limit: 25 });
      const sorted = [...messages.values()]; // newest first
      const filtered = sorted.filter(m => m.author.id !== client.user.id && !m.system);

      if (filtered.length === 0) {
        return await interaction.editReply({ content: 'No messages found in this channel.' });
      }

      const authorId = filtered[0].author.id;
      const authorName = filtered[0].author.displayName;
      const consecutive = [];

      for (const msg of filtered) {
        if (msg.author.id !== authorId) break;
        consecutive.push(extractContent(msg));
      }

      // Reverse to chronological (oldest first), then stitch
      consecutive.reverse();
      const stitched = consecutive.filter(c => c.trim()).join('\n\n');
      const count = consecutive.length;

      if (!stitched.trim()) {
        return await interaction.editReply({ content: 'No text content in this message.' });
      }

      const file = new AttachmentBuilder(Buffer.from(stitched, 'utf-8'), { name: 'raw.md' });
      return await interaction.editReply({
        content: `Stitched ${count} message${count === 1 ? '' : 's'} from ${authorName}.`,
        files: [file],
      });
    }
  } catch (error) {
    console.error('Interaction error:', error);
    const reply = {
      content: 'Something went wrong.',
      flags: MessageFlags.Ephemeral,
    };
    if (interaction.replied) {
      await interaction.followUp(reply);
    } else if (interaction.deferred) {
      await interaction.editReply(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.login(token);
