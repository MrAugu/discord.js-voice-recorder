const { Client, Collection } = require("discord.js");
const path = require("path");

class DiscordClient extends Client {
  constructor (options) {
    super(options);
    this.commands = new Collection();
    this.aliases = new Collection();
    this.wait = require("util").promisify(setTimeout);
    this.logger = console;
    this.recordingBuffer = new Collection();
    this.vocalBuffer = new Collection();
    this.recordingIntervals = new Collection();
    
    this.awaitReply = async (msg, question, limit = 60000) => {
      const filter = m => m.author.id === msg.author.id;
      await msg.channel.send(question);
      try {
        const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
        return collected.first().content;
      } catch (e) {
        return false;
      }
    };
  
    this.clean = async (client, text) => {
      if (text && text.constructor.name == "Promise") text = await text;
      if (typeof evaled !== "string") text = require("util").inspect(text, {depth: 0});
  
      text = text.replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
        .replace(client.token, null);
  
      return text;
    };
  }
  
  permlevel (message, directives) {
    let permlvl = 0;

    const permOrder = directives.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);
  
    while (permOrder.length) {
      const currentLevel = permOrder.shift();
      if (message.guild && currentLevel.guildOnly) continue;
      if (currentLevel.check(message)) {
        permlvl = currentLevel.level;
        break;
      }
    }
    return permlvl;
  }
  
  loadCommand (commandPath, commandName) {
    try {
      const props = new (require(`${commandPath}${path.sep}${commandName}`))(this);
      this.logger.log(`Loading command ${props.help.name}.`);
      props.conf.location = commandPath;
      if (props.init) {
        props.init(this);
      }
      this.commands.set(props.help.name, props);
      props.conf.aliases.forEach(alias => {
        this.aliases.set(alias, props.help.name);
      });
      return false;
    } catch (e) {
      return `Unable to load command ${commandName}: ${e}`;
    }
  }
  
  async unloadCommand (commandPath, commandName) {
    let command;
    if (this.commands.has(commandName)) {
      command = this.commands.get(commandName);
    } else if (this.aliases.has(commandName)) {
      command = this.commands.get(this.aliases.get(commandName));
    }
    if (!command) return `The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`;
  
    if (command.shutdown) {
      await command.shutdown(this);
    }
    delete require.cache[require.resolve(`${commandPath}${path.sep}${commandName}.js`)];
    return false;
  }
}

module.exports = DiscordClient;