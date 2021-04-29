const { join } = require("path");
require("dotenv").config({
  path: join(__dirname, "../.env")
});
const { DiscordClient } = require("../lib/index");
const path = require("path");
const klaw = require("klaw");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);

const environmentVariables = [
  process.env.DISCORD_CLIENT_TOKEN,
  process.env.GOOGLE_CLOUD_KEY,
  process.env.DISCORD_CLIENT_PREFIX
];
if (environmentVariables.some((variable => !variable))) return console.error("Missing environment variables.");

const Client = new DiscordClient({
  ws: {
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_BANS",
      "GUILD_VOICE_STATES",
      "GUILD_PRESENCES",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
      "GUILD_MESSAGE_TYPING",
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_TYPING"
    ]
  }
});

const init = async () => {
  klaw("./src/commands").on("data", (item) => {
    const cmdFile = path.parse(item.path);
    if (!cmdFile.ext || cmdFile.ext !== ".js") return;
    const response = Client.loadCommand(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
    if (response) Client.logger.error(response);
  });
  
  const evtFiles = await readdir("./src/events/");
  Client.logger.log(`Loading a total of ${evtFiles.length} events.`);
  evtFiles.forEach(file => {
    if (file.split(".")[1] !== "js") return;
    const eventName = file.split(".")[0];
    Client.logger.log(`Loading event ${eventName}.`);
    const event = new (require(`./events/${file}`))(Client);
    Client.on(eventName, (...args) => event.run(...args));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
  
  Client.login(process.env.DISCORD_CLIENT_TOKEN);
};
  
init();
module.exports.Client = Client;
