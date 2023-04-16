const Discord = require("discord.js");

module.exports = async (client, interaction, args) => {
  client.embed(
    {
      title: `📘・Owner information`,
      desc: `____________________________`,
      thumbnail: client.user.avatarURL({ dynamic: true, size: 1024 }),
      fields: [
        {
          name: "👑┆Owner name",
          value: `Jahneer`,
          inline: true,
        },
        {
          name: "🏷┆Discord tag",
          value: `WarM4chineRoxX#2013`,
          inline: true,
        },
        {
          name: "🏢┆Organization",
          value: `WarMax`,
          inline: true,
        },
        {
          name: "🌐┆Website",
          value: `[https://husnuljahneer.github.io/](https://husnuljahneer.github.io/)`,
          inline: true,
        },
      ],
      type: "editreply",
    },
    interaction
  );
};
