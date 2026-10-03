const { Client, Message, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ChannelType, ChannelSelectMenuBuilder } = require("discord.js");

function parseColor(color) {
    if (!color) return 0xff0000;
    if (typeof color === 'number') return color;
    if (typeof color === 'string') {
        const clean = color.replace('#', '');
        const num = parseInt(clean, 16);
        return isNaN(num) ? 0xff0000 : num;
    }
    return 0xff0000;
}

function ensureLeaveDb(db) {
    db.leavesettings ??= {};
    db.leavesettings.message ??= "Aucun";
    db.leavesettings.channel ??= null;
    db.leavesettings.autodel ??= false;
    db.leavesettings.delMemberMsgs ??= false;
}

function buildLeaveEmbed(db, guild) {
    ensureLeaveDb(db);
    const ls = db.leavesettings;
    const color = parseColor(db.color);

    const messageVal = ls.message ? ls.message : "Aucun";
    const channelVal = ls.channel && guild.channels.cache.has(ls.channel) ? `<#${ls.channel}>` : "Aucun";
    const autodelVal = ls.autodel ? "​✅" : "​❌";
    const delMemberMsgsVal = ls.delMemberMsgs ? "​✅" : "​❌";

    return new EmbedBuilder()
        .setTitle("Paramètre de départ")
        .setColor(color)
        .setFooter({ text: db.footer || "ζ͜͡Crow Bots" })
        .addFields(
            { name: "Message de départ", value: messageVal, inline: true },
            { name: "Salon du message de départ", value: channelVal, inline: true },
            { name: "Supprimer le message de départ automatiquement", value: autodelVal, inline: true },
            { name: "Supprimer les messages des membres qui quittent", value: delMemberMsgsVal, inline: true }
        );
}

function buildLeaveMenu() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("leave_settings_menu")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                {
                    label: "Modifier le message de départ",
                    value: "1",
                    emoji: { name: "📩" }
                },
                {
                    label: "Supprimer le message de départ",
                    value: "2",
                    emoji: { name: "❌" }
                },
                {
                    label: "Modifier le salon de départ",
                    value: "3",
                    emoji: { name: "🏷" }
                },
                {
                    label: "Supprimer le message de départ automatiquement",
                    value: "4",
                    emoji: { name: "🛎" }
                },
                {
                    label: "Supprimer les messages des membres qui quittent",
                    value: "5",
                    emoji: { name: "🔇" }
                }
            ])
    );
}

module.exports = {
    name: "leave",
    description: "Affiche un menu interactif pour paramétrer les départs",
    category: "Configuration du serveur",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 3,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        ensureLeaveDb(db);
        client.save(message.guildId);

        const embed = buildLeaveEmbed(db, message.guild);
        const row = buildLeaveMenu();

        const msg = await message.channel.send({ embeds: [embed], components: [row] });
        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 15 * 60 * 1000
        });

        collector.on('end', () => msg.edit({ components: [] }).catch(() => null));

        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 });
            }

            const ls = db.leavesettings;

            if (interaction.customId === "leave_channel_select") {
                ls.channel = interaction.values[0] || null;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildLeaveEmbed(db, message.guild)],
                    components: [buildLeaveMenu()]
                }).catch(() => null);
            }

            const val = interaction.values?.[0];

            if (val === "1") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Quel sera le nouveau message de départ ?");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    ls.message = resp.content.trim();
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return msg.edit({
                    embeds: [buildLeaveEmbed(db, message.guild)],
                    components: [buildLeaveMenu()]
                }).catch(() => null);
            }

            if (val === "2") {
                ls.message = "Aucun";
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildLeaveEmbed(db, message.guild)],
                    components: [buildLeaveMenu()]
                }).catch(() => null);
            }

            if (val === "3") {
                await interaction.deferUpdate().catch(() => null);
                const channelRow = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("leave_channel_select")
                        .setChannelTypes([ChannelType.GuildText, ChannelType.GuildAnnouncement])
                        .setPlaceholder("Veuillez choisir un salon")
                        .setMinValues(1)
                        .setMaxValues(1)
                );
                return msg.edit({ components: [channelRow] }).catch(() => null);
            }

            if (val === "4") {
                ls.autodel = !ls.autodel;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildLeaveEmbed(db, message.guild)],
                    components: [buildLeaveMenu()]
                }).catch(() => null);
            }

            if (val === "5") {
                ls.delMemberMsgs = !ls.delMemberMsgs;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildLeaveEmbed(db, message.guild)],
                    components: [buildLeaveMenu()]
                }).catch(() => null);
            }
        });
    }
};