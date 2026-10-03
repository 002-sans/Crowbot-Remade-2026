const { Client, Message } = require("discord.js");

module.exports = {
    name: "bringall",
    description: "Déplace tous les membres en vocal dans un salon",
    category: "Gestion",
    argument: "<salon>",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || await message.guild.channels.fetch(args[0]).catch(() => null);
        const channelType = [2, 13];

        if (!channel || !args[0] || !channelType.includes(channel.type)) return message.channel.send("Veuillez mentionner un salon vocal valide");

        let i = 0;

        message.guild.members.cache.filter(m => !m.user.bot && m.voice.channel).forEach(member => {
            try {
                member.voice.setChannel(channel);
                i++;
            } catch { false }
        });

        message.channel.send(`${i} membres ont été déplacés dans ${channel}`);
    }
};
