const { Client, Message } = require("discord.js");

module.exports = {
    name: "hideall",
    description: "Cache tous les salons du serveur",
    category: "Modération",
    argument: "",
    aliases: [],
    permissions: [],
    perm: 2,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
     */
    async execute(client, message, args) {

        message.guild.channels.cache.forEach(channel => {
            channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false }).catch(() => null);
        });
        message.channel.send("Tous les salons du serveur ont été **cachés**");

    },
};
