const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const DEFAULTS = { actif: true, sanctionEnd: true, join: true, giveaway: false, custom: true, warn: true, kick: true, ban: true, mute: true, unmute: true, ticket: true };
const OPTIONS = [
    ['sanctionEnd', 'Fin de sanction'], ['join', 'Message de join'], ['giveaway', 'Refus de participation au giveaway'],
    ['custom', 'Réponse aux custom'], ['warn', 'Warn'], ['kick', 'Kick'], ['ban', 'Ban'], ['mute', 'Mute'], ['unmute', 'Unmute'], ['ticket', 'Ticket']
];

module.exports = {
    name: 'mpsettings',
    description: 'Configure les messages privés du bot',
    category: 'Bot Control',
    argument: '', aliases: [], permissions: [], perm: 1,
    guildOwnerOnly: false, botOwnerOnly: true,
    async execute(client, message) {
        const db = client.get(message.guildId);
        db.mpsettings = { ...DEFAULTS, ...(db.mpsettings || {}) };
        const render = () => {
            const embed = new EmbedBuilder().setTitle('MP settings')
                .setDescription('🔴 Désactivé\n🔵 Optimisé *(uniquement si les MP existent déjà)*\n🟢 Tout le temps')
                .setColor(db.color);
            const rows = [];
            for (let index = 0; index < OPTIONS.length; index += 5) {
                const row = new ActionRowBuilder();
                for (const [key, label] of OPTIONS.slice(index, index + 5)) {
                    row.addComponents(new ButtonBuilder().setCustomId(`mpsettings_${key}`).setLabel(label)
                        .setStyle(db.mpsettings[key] ? ButtonStyle.Success : ButtonStyle.Danger));
                }
                rows.push(row);
            }
            return { embeds: [embed], components: rows };
        };
        const msg = await message.channel.send(render());
        const collector = msg.createMessageComponentCollector({ time: 10 * 60 * 1000 });
        collector.on('end', () => msg.edit({ components: [] }).catch(() => null));
        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) return interaction.reply({ content: 'Vous ne pouvez pas utiliser ce menu', flags: 64 });
            await interaction.deferUpdate().catch(() => null);
            const key = interaction.customId.slice('mpsettings_'.length);
            if (Object.hasOwn(db.mpsettings, key)) db.mpsettings[key] = !db.mpsettings[key];
            client.save(message.guildId);
            await msg.edit(render()).catch(() => null);
        });
    }
};
