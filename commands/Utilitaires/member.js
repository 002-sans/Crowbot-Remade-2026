const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "member",
    description: "Affiche les informations relatives à un membre",
    category: "Utilitaire",
    argument: "[membre]",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null) || message.member;
        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setColor(db.color)
            .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
            .addFields(
                { name: 'ID', value: member.id, inline: true },
                { name: 'Surnom', value: member.nickname || 'Aucun', inline: true },
                { name: 'Arrivée', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Rôles', value: member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r).join(', ') || 'Aucun' || 'Aucun' }
            )
            .setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' });
        message.channel.send({ embeds: [embed] });

    },
};
