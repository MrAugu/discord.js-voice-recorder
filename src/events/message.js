const Discord = require("discord.js");// eslint-disable-line
const directives = require("../directives");

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (message) {
    if (message.author.bot) return;

    const reply = (...args) => message.channel.send(...args);
    if (message.channel.type === "dm" || !message.guild) return reply(`${this.client.config.emojis.redTick} Direct message channels are not supported, please invite the bot to your server.`);
    if (message.guild && !message.member) await message.guild.members.fetch(message.author);
  
    const permissionLevel = this.client.permlevel(message, directives);
    var args = message.content.split(/ +/g);
    var command;

    if (message.content.indexOf(process.env.DISCORD_CLIENT_PREFIX) !== 0) return;

    command = args.shift().toLowerCase();
    command = command.slice(process.env.DISCORD_CLIENT_PREFIX.length);

    const cmd = this.client.commands.get(command) || this.client.aliases.get(command);
    if (!cmd) return;
    if (!cmd.conf.enabled) return reply(`${this.client.config.emojis.redInfoTick} This command is currently disabled.`);

    const commandPermLevel = directives.find(directive => directive.name === cmd.conf.permLevel);
    if (commandPermLevel.level > permissionLevel) return reply(`${this.client.config.emojis.redTick} You need **${cmd.conf.permLevel}** permissions in order to use this command.`);

    const clientPermissions = message.channel.permissionsFor(message.guild.me).toArray();
    const clientMissingPermissions = [];
    var hasAllPermissions = true;

    for (const requiredPermission of cmd.conf.requiredPermissions) {
      if (!clientPermissions.includes(requiredPermission)) {
        hasAllPermissions = false;
        clientMissingPermissions.push(requiredPermission);
      }
    }

    if (!hasAllPermissions) return reply(`:x: In order to run \`${cmd.help.name}\`, I need the following permissions:\n▫️ **${clientMissingPermissions.map(perm => perm.replace(/_/g, " ")).map(perm => perm.toProperCase()).join("**\n▫️ **")}**`);

    if (cmd.conf.args && !args.length) return reply(`:x: This command requires additional arguments.\nCorrect Usage: \`${process.env.DISCORD_CLIENT_PREFIX}${cmd.help.name} ${cmd.help.usage}\``);

    try {
      await cmd.run(message, args, permissionLevel, reply);
    } catch (e) {
      reply(":warning: Something went wrong... The developers are already working on squashing this disgusting bug using some insecticides.");
    }
  }
};