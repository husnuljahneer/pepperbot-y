const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = async (client, interaction, args) => {
  fetch(`https://api.truthordarebot.xyz/api/nhie`)
    .then((res) => res.json())
    .catch({})
    .then(async (json) => {
      client.embed(
        {
          title: `💡・Never Have I Ever`,
          desc: json.question,
          type: "editreply"
        },
        interaction
      );
    })
    .catch({});
};
