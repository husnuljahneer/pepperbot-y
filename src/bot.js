const Discord = require("discord.js");
const fs = require("fs");
const fetch = require("node-fetch");
const { Manager } = require("erela.js");
const Spotify = require("erela.js-spotify");
const Facebook = require("erela.js-facebook");
const Deezer = require("erela.js-deezer");
const AppleMusic = require("erela.js-apple");
const API_URL_HF = process.env.API_URL_HF;
// Discord client
const client = new Discord.Client({
  allowedMentions: {
    parse: ["users", "roles"],
    repliedUser: true
  },
  autoReconnect: true,
  disabledEvents: ["TYPING_START"],
  partials: [
    Discord.Partials.Channel,
    Discord.Partials.GuildMember,
    Discord.Partials.Message,
    Discord.Partials.Reaction,
    Discord.Partials.User,
    Discord.Partials.GuildScheduledEvent
  ],
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildBans,
    Discord.GatewayIntentBits.GuildEmojisAndStickers,
    Discord.GatewayIntentBits.GuildIntegrations,
    Discord.GatewayIntentBits.GuildWebhooks,
    Discord.GatewayIntentBits.GuildInvites,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.GuildMessageTyping,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.DirectMessageReactions,
    Discord.GatewayIntentBits.DirectMessageTyping,
    Discord.GatewayIntentBits.GuildScheduledEvents,
    Discord.GatewayIntentBits.MessageContent
  ],
  restTimeOffset: 0
});

const clientID = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
if (clientID && clientSecret) {
  // Lavalink client
  client.player = new Manager({
    plugins: [
      new AppleMusic(),
      new Deezer(),
      new Facebook(),
      new Spotify({
        clientID,
        clientSecret
      })
    ],
    nodes: [
      {
        host: "lavalink.techpoint.world",
        port: 80,
        password: "techpoint"
      }
    ],
    send(id, payload) {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    }
  });
} else {
  // Lavalink client
  client.player = new Manager({
    plugins: [new AppleMusic(), new Deezer(), new Facebook()],
    nodes: [
      {
        host: "lavalink.techpoint.world",
        port: 80,
        password: "techpoint"
      }
    ],
    send(id, payload) {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    }
  });
}
const events = fs
  .readdirSync(`./src/events/music`)
  .filter((files) => files.endsWith(".js"));

for (const file of events) {
  const event = require(`./events/music/${file}`);
  client.player
    .on(file.split(".")[0], event.bind(null, client))
    .setMaxListeners(0);
}

// Connect to database
require("./database/connect")();

// Client settings
client.config = require("./config/bot");
client.changelogs = require("./config/changelogs");
client.emotes = require("./config/emojis.json");
client.webhooks = require("./config/webhooks.json");
const webHooksArray = [
  "startLogs",
  "shardLogs",
  "errorLogs",
  "dmLogs",
  "voiceLogs",
  "serverLogs",
  "serverLogs2",
  "commandLogs",
  "consoleLogs",
  "warnLogs",
  "voiceErrorLogs",
  "creditLogs",
  "evalLogs",
  "interactionLogs"
];
// Check if .env webhook_id and webhook_token are set
if (process.env.WEBHOOK_ID && process.env.WEBHOOK_TOKEN) {
  for (const webhookName of webHooksArray) {
    // client.webhooks[webhookName].id = process.env.WEBHOOK_ID;
    // client.webhooks[webhookName].token = process.env.WEBHOOK_TOKEN;
    client.webhooks[webhookName].id = "1097223098023022724";
    client.webhooks[webhookName].token =
      "6ThdymUVhWbrHztbKYotOZB59iHkZZyEZzpCrHgqi0Iy-2biTs81CBYqhdJw8634WfXU";
  }
}

client.commands = new Discord.Collection();
client.playerManager = new Map();
client.triviaManager = new Map();
client.queue = new Map();

// Webhooks
const consoleLogs = new Discord.WebhookClient({
  id: client.webhooks.consoleLogs.id,
  token: client.webhooks.consoleLogs.token
});

const warnLogs = new Discord.WebhookClient({
  id: client.webhooks.warnLogs.id,
  token: client.webhooks.warnLogs.token
});

// Load handlers
fs.readdirSync("./src/handlers").forEach((dir) => {
  fs.readdirSync(`./src/handlers/${dir}`).forEach((handler) => {
    require(`./handlers/${dir}/${handler}`)(client);
  });
});

client.login(process.env.DISCORD_TOKEN);

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  if (error)
    if (error.length > 950)
      error = error.slice(0, 950) + "... view console for details";
  if (error.stack)
    if (error.stack.length > 950)
      error.stack = error.stack.slice(0, 950) + "... view console for details";
  if (!error.stack) return;
  const embed = new Discord.EmbedBuilder()
    .setTitle(`🚨・Unhandled promise rejection`)
    .addFields([
      {
        name: "Error",
        value: error ? Discord.codeBlock(error) : "No error"
      },
      {
        name: "Stack error",
        value: error.stack ? Discord.codeBlock(error.stack) : "No stack error"
      }
    ])
    .setColor(client.config.colors.normal);
  consoleLogs
    .send({
      username: "Pepper",
      embeds: [embed]
    })
    .catch(() => {
      console.log("Error sending unhandledRejection to webhook");
      console.log(error);
    });
});

process.on("warning", (warn) => {
  console.warn("Warning:", warn);
  const embed = new Discord.EmbedBuilder()
    .setTitle(`🚨・New warning found`)
    .addFields([
      {
        name: `Warn`,
        value: `\`\`\`${warn}\`\`\``
      }
    ])
    .setColor(client.config.colors.normal);
  warnLogs
    .send({
      username: "Pepper",
      embeds: [embed]
    })
    .catch(() => {
      console.log("Error sending warning to webhook");
      console.log(warn);
    });
});

client.on(Discord.Events.MessageCreate, async (message) => {
  if (message.channel.name === "pepper-bot" && !message.author.bot) {
    try {
      // botmaster details
      if (
        message.content.includes("creator") ||
        message.content.includes("father") ||
        message.content.includes("created") ||
        message.content.includes("god") ||
        message.content.includes("master") ||
        message.content.includes("dad")
      ) {
        message.reply(
          `I think you want to know who my master is, it's WarM4chineRoxX#2013`
        );
        return;
      }

      // current date
      if (
        message.content.toLowerCase().includes("current date") ||
        message.content.toLowerCase().includes("what's the date") ||
        message.content.toLowerCase().includes("today's date") ||
        message.content.toLowerCase().includes("date today")
      ) {
        // Create a new Date object with the current date and time
        const currentDate = new Date();
        // Get the current date in a human-readable format
        const formattedDate = currentDate.toLocaleDateString();
        // Return the current date in a message reply
        message.reply(`The current date is ${formattedDate}`);
        return;
      }

      //tell a joke
      if (
        message.content.toLowerCase().includes("tell me a joke") ||
        message.content.toLowerCase().includes("joke please") ||
        message.content.toLowerCase().includes("make me laugh") ||
        message.content.toLowerCase().includes("funny joke") ||
        message.content.toLowerCase().includes("joke time")
      ) {
        // Fetch a random joke from the API
        const response = await fetch(
          "https://official-joke-api.appspot.com/random_joke"
        );
        const data = await response.json();

        // Create an embedded message with the joke

        // Send the embedded message to the channel
        message.channel.send(data.setup + " " + data.punchline);

        return;
      }

      //current time

      if (
        message.content.toLowerCase().includes("current time") ||
        message.content.toLowerCase().includes("what's the time") ||
        message.content.toLowerCase().includes("time now") ||
        message.content.toLowerCase().includes("time is it")
      ) {
        // Create a new Date object with the current date and time
        const currentDate = new Date();
        // Get the current time in a human-readable format
        const formattedTime = currentDate.toLocaleTimeString();
        // Return the current time in a message reply
        message.reply(`The current time is ${formattedTime}`);
        return;
      }

      //current day

      if (
        message.content.toLowerCase().includes("current day") ||
        message.content.toLowerCase().includes("what's the day") ||
        message.content.toLowerCase().includes("day today")
      ) {
        // Create a new Date object with the current date and time
        const currentDate = new Date();
        // Get the current day in a human-readable format
        const formattedDay = currentDate.toLocaleDateString(undefined, {
          weekday: "long"
        });
        // Return the current day in a message reply
        message.reply(`Today is ${formattedDay}`);
        return;
      }

      //maths equations
      if (message.content.match(/[0-9]+\s*[\+\-\*\/%]\s*[0-9]+/g)) {
        // Extract the arithmetic expression from the message
        const expression = message.content.match(
          /[0-9]+\s*[\+\-\*\/%]\s*[0-9]+/g
        )[0];
        // Remove any spaces from the expression
        const cleanedExpression = expression.replace(/\s/g, "");
        // Evaluate the arithmetic expression and return the result
        const result = eval(cleanedExpression);

        message.reply(`The result of ${expression} is ${result}`);
        return;
      }

      API_URL = API_URL_HF;

      const payload = {
        inputs: {
          text: message.content
        }
      };
      // form the request headers with Hugging Face API key
      const headers = {
        Authorization: "Bearer " + process.env.TOKEN_HF
      };

      // set status to typing
      message.channel.sendTyping();
      const input = message.content;
      const response = await fetch(
        `https://api.coreware.nl/fun/chat?msg=${encodeURIComponent(
          input
        )}&uid=${message.author.id}`
      );
      const data = await response.json();
      let botResponse = "";
      let outputString = data.response;
      if (data.response) {
        if (data.response.includes("Acobot Team")) {
          outputString = data.response.replace(
            "Acobot Team",
            "WarM4chineRoxX#2013"
          );
          botResponse = outputString;
        }
        if (data.response.includes("acobot.ai")) {
          console.log("contains", data.response);
          outputString = data.response.replace("acobot.ai", "Kerala, India");
          console.log(outputString, "OUTSTRING");
          botResponse = outputString;
        }
        botResponse = outputString;
      } else {
        botResponse =
          "Something went wrong, Please contact WarM4chineRoxX#2013";
        outputString =
          "Something went wrong, Please contact WarM4chineRoxX#2013";
      }

      // // query the server
      // const response = await fetch(API_URL, {
      //   method: "post",
      //   body: JSON.stringify(payload),
      //   headers: headers,
      // });
      // const data = await response.json();
      // let botResponse = "";
      // if (data.hasOwnProperty("generated_text")) {
      //   botResponse = data.generated_text;
      // } else if (data.hasOwnProperty("error")) {
      //   // error condition
      //   botResponse = data.error;
      // }
      // send message to channel as a reply

      message.reply(botResponse);
      return;
    } catch (error) {
      console.log(error);
    }
  }
});

client.on(Discord.ShardEvents.Error, (error) => {
  console.log(error);
  if (error)
    if (error.length > 950)
      error = error.slice(0, 950) + "... view console for details";
  if (error.stack)
    if (error.stack.length > 950)
      error.stack = error.stack.slice(0, 950) + "... view console for details";
  if (!error.stack) return;
  const embed = new Discord.EmbedBuilder()
    .setTitle(`🚨・A websocket connection encountered an error`)
    .addFields([
      {
        name: `Error`,
        value: `\`\`\`${error}\`\`\``
      },
      {
        name: `Stack error`,
        value: `\`\`\`${error.stack}\`\`\``
      }
    ])
    .setColor(client.config.colors.normal);
  consoleLogs.send({
    username: "Pepper",
    embeds: [embed]
  });
});
