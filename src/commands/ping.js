const Discord = require ("discord.js"); // eslint-disable-line no-unused-vars
const { Command } = require("../../lib/index");

class Ping extends Command {
  constructor (client) {
    super(client, {
      name: "ping",
      description: "Pong!",
      category: "General",
      usage: "",
      enabled: true,
      aliases: [],
      permLevel: "User",
      args: false,
      requiredPermissions: ["SEND_MESSAGES", "VIEW_CHANNEL", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"]
    });
  }

  async run (message, args, level, reply) { // eslint-disable-line no-unused-vars
    const m = await reply("Pong!");
    const tLatency = m.createdTimestamp - message.createdTimestamp;
    m.edit(`*${tLatency}ms*`);
  }
}

module.exports = Ping;