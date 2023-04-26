const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = async (client, interaction, args) => {
  fetch(`https://api.truthordarebot.xyz/api/dare`)
    .then((res) => res.json())
    .catch({})
    .then(async (json) => {
      client.embed(
        {
          title: `💡・Dare`,
          desc: json.question,
          type: "editreply"
        },
        interaction
      );
    })
    .catch({});
};
