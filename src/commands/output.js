const Discord = require ("discord.js"); // eslint-disable-line no-unused-vars
const { Command } = require("../../lib/index");
const wavConverter = require("wav-converter");
const { OpusEncoder } = require("@discordjs/opus");

class Output extends Command {
  constructor (client) {
    super(client, {
      name: "output",
      description: "Stops the recording and outputs the resulting sound file.",
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
    if (!voiceChannel) return reply(":x: You can only stop recording of a voice channel.");
    const recordingBuffer = this.client.recordingBuffer.get(voiceChannel.id);
    if (!recordingBuffer) return reply(":x: There is no active recording of that channel.");
    voiceChannel.leave();
    
    let binaryOutput = recordingBuffer.toBuffer();
    //binaryOutput = wavConverter.encodeWav(binaryOutput, {
    //  numChannels: 2,
    //  sampleRate: 48000,
    //  byteRate: 64
    // });

    const attachment = new Discord.MessageAttachment(binaryOutput, "recording.ogg");
    this.client.recordingBuffer.delete(voiceChannel.id);
    clearInterval(this.client.recordingIntervals.get(voiceChannel.id));
    this.client.recordingIntervals.delete(voiceChannel.id);

    reply("Recording stopped, here is the recording:", attachment);
  }
}

module.exports = Output;