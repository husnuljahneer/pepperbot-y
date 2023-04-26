const Discord = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI
});
const openai = new OpenAIApi(configuration);

module.exports = async (client, interaction, args) => {
  const text = interaction.options.getString("text");

  let prompt = `You: ${text}\n`;

  const gptResponse = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: prompt,
    max_tokens: 60,
    temperature: 0.3,
    top_p: 0.3,
    presence_penalty: 0,
    frequency_penalty: 0.5
  });

  client.embed(
    {
      desc: gptResponse,
      type: "editreply"
    },
    interaction
  );
};
