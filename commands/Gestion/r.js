module.exports = {
    name: 'r',
    description: 'Répond à un modmail',
    category: 'Gestion',
    argument: '<message>',
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const ticket = db.modmail?.open?.find(open => open.channelId === message.channelId);
        if (!ticket) return message.channel.send('Ce salon n’est pas un modmail');
        const contenu = args.join(' ').trim();
        if (!contenu) return message.channel.send(`Utilisation: \`${db.prefix}r <message>\``);
        const user = await client.users.fetch(ticket.userId).catch(() => null);
        if (!user) return message.channel.send('Utilisateur introuvable');
        await user.send({ embeds: [new (require('discord.js').EmbedBuilder)()
            .setDescription(contenu)
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setFooter({ text: message.guild.name })
            .setTimestamp()
            .setColor('00FFFF')] }).catch(() => null);
        return message.delete().catch(() => null);
    }
};
