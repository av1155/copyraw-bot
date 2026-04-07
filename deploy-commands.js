const { REST, Routes, SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error('Missing required environment variables: DISCORD_TOKEN, CLIENT_ID, GUILD_ID');
  process.exit(1);
}

const commands = [
  new ContextMenuCommandBuilder()
    .setName('Copy Raw')
    .setType(ApplicationCommandType.Message),
  new SlashCommandBuilder()
    .setName('copyraw')
    .setDescription('Copy raw content of the last consecutive messages from the same author'),
].map(cmd => cmd.toJSON());

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Registering ${commands.length} commands...`);
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );
    console.log(`Registered ${data.length} commands.`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
