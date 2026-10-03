const { PermissionsBitField, Client, Message } = require("discord.js");

module.exports = {
    name: "renew",
    description: "Permet de recrée un salon.",
    category: "Modération",
    argument: "[salon]",
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
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || await message.guild.channels.fetch(args[0]).catch(() => null);
        if (!channel || !args[0]) channel = message.channel

        // clone() recopie déjà nom, type, topic, nsfw, bitrate, userLimit, slowmode,
        // catégorie, position et permissions : ne rien passer évite de les écraser.
        const newChannel = await channel.clone({ reason: `Renew demandé par ${message.author.tag}` })
        channel.delete().catch(() => newChannel.delete().catch(() => null))
    },
}