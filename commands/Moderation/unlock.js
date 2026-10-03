const { PermissionsBitField, Client, Message } = require("discord.js");

module.exports = {
    name: "unlock",
    description: "Permet de déverrouiller un channel.",
    category: "Modération",
    argument: "[salon/all]",
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
        if (args[0] === 'all') {
            message.guild.channels.cache.forEach(channel => {
                channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null, Connect: null }).catch(() => null);
            });
            return message.channel.send(`Tous les salons du serveur ont été déverrouillés`);
        }

        const channels = args.length ? client.resolveChannels(message.guild, args.join(' '), message.mentions.channels) : [message.channel];
        if (!channels.length) return message.channel.send(`Aucun salon de trouvé pour \`${args.join(' ') || "rien"}\``);

        for (const channel of channels) {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null, Connect: null }).catch(() => null);
        }

        if (channels.length === 1) {
            return message.channel.send(`Le salon ${channels[0]} a été **unlock**`);
        }

        return message.channel.send(`\`${channels.length}\` salon(s) ont été **unlock**`);
    },
};