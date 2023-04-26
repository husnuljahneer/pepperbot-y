const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = async (client, interaction, args) => {
  fetch(`https://api.truthordarebot.xyz/v1/truth`)
    .then((res) => res.json())
    .catch({})
    .then(async (json) => {
      client.embed(
        {
          title: `💡・Truth`,
          desc: json.question,
          type: "editreply"
        },
        interaction
      );
    })
    .catch({});
};
