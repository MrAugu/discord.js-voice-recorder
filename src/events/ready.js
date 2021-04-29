const Discord = require("discord.js"); // eslint-disable-line no-unused-vars

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run () {
    for (const guild of this.client.guilds.cache) {
      await guild[1].members.fetch();
    }

    await this.client.wait(1000);
    this.client.appInfo = await this.client.fetchApplication();
    setInterval( async () => {
      this.client.appInfo = await this.client.fetchApplication();
    }, 60000);

    await this.client.user.setStatus("online");
    await this.client.user.setActivity("Voice Channels | $record", { type: "WATCHING"  });
    this.client.logger.log(`Logged in as ${this.client.user.tag}! Serving ${this.client.guilds.cache.size} Servers and ${this.client.users.cache.size} Users.`);
  }
};