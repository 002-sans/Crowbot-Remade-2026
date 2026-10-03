const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {
        if (message.author.bot) return;

        if (message.channel.isDMBased()) {
            const guild = client.guilds.cache.find(candidate => {
                const db = client.get(candidate.id);
                return db.modmail?.actif && db.modmail.guildId === candidate.id;
            });
            if (!guild) return;
            const db = client.get(guild.id);
            const open = (db.modmail.open || []).find(ticket => ticket.userId === message.author.id);
            if (!open) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`modmail_accept_${guild.id}`).setEmoji('✅').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`modmail_cancel_${guild.id}`).setEmoji('❌').setStyle(ButtonStyle.Secondary)
                );
                return message.channel.send({
                    embeds: [new EmbedBuilder().setDescription('Cliquez sur le bouton ci-dessous pour envoyer votre message au support').setFooter({ text: 'Les abus seront sanctionnés' }).setColor(db.color)],
                    components: [row]
                });
            }

            const channel = guild.channels.cache.get(open.channelId);
            if (!channel) return;
            return channel.send({ embeds: [new EmbedBuilder()
                .setDescription(message.content || '*Pièce jointe envoyée*')
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setFooter({ text: message.author.id })
                .setTimestamp()
                .setColor(db.color)] });
        }

        const db = client.get(message.guildId);
        const ticket = db.modmail?.open?.find(open => open.channelId === message.channelId);
        if (!ticket || !message.guild) return;
        if (message.content.startsWith(db.prefix)) return;
        const user = await client.users.fetch(ticket.userId).catch(() => null);
        if (!user) return;
        return user.send({ embeds: [new EmbedBuilder()
            .setDescription(message.content || '*Pièce jointe envoyée*')
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setFooter({ text: message.guild.name })
            .setTimestamp()
            .setColor('00FFFF')] }).catch(() => null);
    }
};
