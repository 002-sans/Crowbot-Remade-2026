const { Client, Message } = require("discord.js");

module.exports = {
    name: "unlockall",
    description: "Réouvre tous les salons du serveur",
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
            channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null, Connect: null }).catch(() => null);
        });
        message.channel.send("Tous les salons du serveur ont été **dévérouillés**");

    },
};
