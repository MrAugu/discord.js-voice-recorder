const Discord = require ("discord.js"); // eslint-disable-line no-unused-vars
const { Command } = require("../../lib/index");
const { WritableStream } = require("memory-streams");

class Record extends Command {
  constructor (client) {
    super(client, {
      name: "record",
      description: "Starts recording of a channel",
      category: "Sound",
      usage: "",
      enabled: true,
      aliases: [],
      permLevel: "User",
      args: false,
      requiredPermissions: ["SEND_MESSAGES", "VIEW_CHANNEL", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK"]
    });
  }

  async run (message, args, level, reply) { // eslint-disable-line no-unused-vars
    const voiceChannel = message.member.voice ? message.member.voice.channel : undefined;
    if (!voiceChannel) return reply(":x: You can only record voice in a voice channel.");
    var connection;
    try {
      connection = await voiceChannel.join();
    } catch (e) {
      return reply(`:x: I cannot join the voice channel, ${e.message}.`);
    }
    if (!connection) reply(":x: Unable to connect to the voice channel.");
    
    const bufferWritableStream = new WritableStream();
    this.client.recordingBuffer.set(voiceChannel.id, bufferWritableStream);

    this.client.recordingIntervals.set(voiceChannel.id, setInterval(() => reply(`🎹 Recoded ${this.client.recordingBuffer.get(voiceChannel.id).toBuffer().length / 1024 / 1024} Megabytes.`), 5000));

    connection.on("speaking", async (user, speaking) => {
      if (speaking) {
        const stream = connection.receiver.createStream(user, { mode: "opus" });
        stream.pipe(this.client.recordingBuffer.get(voiceChannel.id), { end: false });
      }
    });
    reply("Started recording your beautiful voice.");
  }
}

module.exports = Record;