module.exports = [
  { level: 0,
    name: "User",
    check: () => true
  },
  
  { level: 2,
    name: "Moderator",
    guildOnly: true,
    check: (message) => {
      try {
        if (message.member.permissionsIn(message.channel).has("MANAGE_MESSAGES") || message.member.permissionsIn(message.channel).has("BAN_MEMBERS") || message.member.permissionsIn(message.channel).has("MANAGE_GUILD")) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  },
  
  {
    level: 3,
    name: "Manager",
    guildOnly: true,
    check: (message) => message.member.permissionsIn(message.channel).has("MANAGE_GUILD")
  },
  
  { level: 4,
    name: "Administrator",
    guildOnly: true,
    check: (message) => {
      try {
        if (message.member.permissionsIn(message.channel).has("ADMINISTRATOR")) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  },
  
  { level: 5,
    name: "Server Owner",
    guildOnly: true,
    check: (message) => {
      if (message.channel.type === "text" && message.guild.ownerID) {
        if (message.guild.ownerID === message.author.id) return true;
      } else {
        return false;
      }
    }
  }
];