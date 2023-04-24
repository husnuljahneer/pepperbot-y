const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help with the bot"),

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */

  run: async (client, interaction, args) => {
    await interaction.deferReply({ fetchReply: true });
    const row = new Discord.ActionRowBuilder().addComponents(
      new Discord.StringSelectMenuBuilder()
        .setCustomId("Bot-helppanel")
        .setPlaceholder("❌┆Nothing selected")
        .addOptions([
          {
            label: `Commands`,
            description: `Show the commands of Bot!`,
            emoji: "💻",
            value: "commands-Bothelp"
          },
          {
            label: `Invite`,
            description: `Invite Bot to your server`,
            emoji: "📨",
            value: "invite-Bothelp"
          },
          {
            label: `Support server`,
            description: `Join the suppport server`,
            emoji: "❓",
            value: "support-Bothelp"
          },
          {
            label: `Changelogs`,
            description: `Show the bot changelogs`,
            emoji: "📃",
            value: "changelogs-Bothelp"
          }
        ])
    );

    return client.embed(
      {
        title: `❓・Help panel`,
        desc: `Welcome to Bot's help panel! We have made a small overview to help you! Make a choice via the menu below`,
        image: "https://i.imgur.com/EpbeZYr.png",
        fields: [
          {
            name: `:thought_balloon: ┆ Pepper chat bot!`,
            value: `Create a channel named #pepper-bot and start chatting!`
          },
          {
            name: `❌┆Menu doesn't work?`,
            value: `Try resending the command. If you get no reaction, make sure you report the bug!`
          },
          {
            name: `🪲┆Found a bug?`,
            value: `Report this with \`/report bug\``
          },
          {
            name: `🔗┆Links`,
            value: `[Website](https://husnuljahneer.github.io/) | [Invite](${client.config.discord.botInvite}) | [Vote](https://discordbotlist.com/bots/pepper)`
          }
        ],
        components: [row],
        type: "editreply"
      },
      interaction
    );
  }
};
