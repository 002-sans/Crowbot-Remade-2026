const { Client, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "mutelist",
    description: "Permet de visionner la liste des utilisateurs en timeout.",
    category: "Modération",
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
        const db = client.get(message.guildId);
        await message.guild.members.fetch().catch(() => null);
        const muted = [...message.guild.members.cache.filter(m => m.isCommunicationDisabled()).values()];

        const formatPage = (start) => {
            const slice = muted.slice(start, start + 10);
            if (!slice.length) return "Aucun membre en timeout";
            return slice.map((m, i) => `\`${start + i + 1}\` - ${m.user.tag} (\`${m.displayName}\`)`).join('\n');
        };

        let page = 0;
        const pageSize = 10;
        const maxPage = Math.max(1, Math.ceil(muted.length / pageSize));

        const embed = new EmbedBuilder()
            .setTitle('Liste des membres timeout')
            .setColor(db.color)
            .setDescription(formatPage(0));

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('back').setLabel('◀').setStyle(2),
            new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(2)
        );

        const msg = await message.channel.send({
            embeds: [embed],
            components: muted.length > pageSize ? [row] : []
        });

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 1000 * 60 * 10
        });

        collector.on('end', () => msg.edit({ components: [] }).catch(() => null));
        collector.on('collect', async i => {
            await i.deferUpdate().catch(() => null);
            if (i.customId === 'back') {
                if (page <= 0) return;
                page--;
            } else if (i.customId === 'next') {
                if (page + 1 >= maxPage) return;
                page++;
            }
            embed.setDescription(formatPage(page * pageSize));
            await msg.edit({ embeds: [embed] }).catch(() => null);
        });
    },
};
