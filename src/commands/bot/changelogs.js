const Discord = require("discord.js");

module.exports = async (client, interaction, args) => {
  client.embed(
    {
      title: "📃・Changelogs",
      desc: `_____`,
      thumbnail: client.user.avatarURL({ size: 1024 }),
      fields: [
        {
          name: "📃┆Changelogs",
          value: "15/4/2023 Updated to v14",
          inline: false,
        },
      ],
      type: "editreply",
    },
    interaction
  );
};
