const { Client, Message } = require("discord.js");

module.exports = {
    name: "remove",
    description: "Supprime l'activité du bot",
    category: "Bot Control",
    argument: "activity",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) {

        if (args[0] !== 'activity' && args[0] !== 'status') return;
        client.config.presence.name = null;
        client.config.presence.type = null;
        client.saveConfig();
        client.user.setActivity(null);
        message.channel.send("L'activité du bot a été **supprimée**");

    },
};
