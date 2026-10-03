const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        if (!interaction.isButton() || !interaction.customId.startsWith('modmail_')) return;
        const [, action, guildId] = interaction.customId.split('_');
        const guild = client.guilds.cache.get(guildId);
        const db = guild && client.get(guildId);
        if (!guild || !db?.modmail?.actif) return interaction.reply({ content: 'Le modmail est désactivé.', flags: 64 });
        if (action === 'cancel') return interaction.update({ content: 'Votre demande a été annulée.', embeds: [], components: [] });

        if ((db.modmail.open || []).some(ticket => ticket.userId === interaction.user.id)) {
            return interaction.update({ content: 'Un modmail est déjà ouvert avec vous.', embeds: [], components: [] });
        }

        const category = guild.channels.cache.get(db.modmail.category);
        const channel = await guild.channels.create({
            name: `modmail-${interaction.user.username}`.slice(0, 100),
            type: ChannelType.GuildText,
            parent: category?.id,
            permissionOverwrites: [
                { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
            ]
        }).catch(() => null);
        if (!channel) return interaction.update({ content: 'Impossible de créer le ticket.', embeds: [], components: [] });

        db.modmail.open ??= [];
        db.modmail.open.push({ userId: interaction.user.id, channelId: channel.id });
        client.save(guild.id);
        await channel.send({ embeds: [new EmbedBuilder()
            .setTitle('Nouveau ticket ouvert')
            .setDescription(`Utilisez la commande \`${db.prefix}r <message>\` pour répondre à ce ticket\nUtilisez la commande \`${db.prefix}close [raison]\` pour le fermer`)
            .setColor(db.color)] });
        return interaction.update({ content: `Votre message a bien été envoyé au staff, vous pouvez désormais parler normalement et vos messages seront retransmis\nVous pouvez utiliser la commande \`${db.prefix}close [raison]\` pour fermer ce ticket à tout moment`, embeds: [], components: [] });
    }
};
