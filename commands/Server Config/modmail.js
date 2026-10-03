const { Client, Message, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ChannelType, ChannelSelectMenuBuilder, RoleSelectMenuBuilder } = require("discord.js");

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

function ensureModmailDb(db) {
    db.modmailSettings ??= {
        actif: false,
        category: null,
        logs: null,
        anonymous: false,
        closeNoCommon: false,
        accessRoles: [],
        mentionRoles: [],
        reqRoles: [],
        banRoles: [],
        autoCloseInactive: false,
        autoDeleteClosed: true,
        replyWithoutCmd: false
    };
}

function buildModmailEmbed(db, guild) {
    ensureModmailDb(db);
    const ms = db.modmailSettings;
    const color = parseColor(db.color);

    const actifVal = ms.actif ? "​✅" : "​❌";
    const categoryVal = ms.category && guild.channels.cache.has(ms.category)
        ? `<#${ms.category}>`
        : "Aucune (modmail désactivé)";
    const logsVal = ms.logs && guild.channels.cache.has(ms.logs)
        ? `<#${ms.logs}>`
        : "Off";
    const anonVal = ms.anonymous ? "​✅" : "​❌";
    const closeNoCommonVal = ms.closeNoCommon ? "​✅" : "​❌";

    const accessRolesVal = Array.isArray(ms.accessRoles) && ms.accessRoles.filter(id => guild.roles.cache.has(id)).length > 0
        ? ms.accessRoles.filter(id => guild.roles.cache.has(id)).map(id => `<@&${id}>`).join(', ')
        : "Aucun";

    const mentionRolesVal = Array.isArray(ms.mentionRoles) && ms.mentionRoles.filter(id => guild.roles.cache.has(id)).length > 0
        ? ms.mentionRoles.filter(id => guild.roles.cache.has(id)).map(id => `<@&${id}>`).join(', ')
        : "Aucun";

    const reqRolesVal = Array.isArray(ms.reqRoles) && ms.reqRoles.filter(id => guild.roles.cache.has(id)).length > 0
        ? ms.reqRoles.filter(id => guild.roles.cache.has(id)).map(id => `<@&${id}>`).join(', ')
        : "Aucun";

    const banRolesVal = Array.isArray(ms.banRoles) && ms.banRoles.filter(id => guild.roles.cache.has(id)).length > 0
        ? ms.banRoles.filter(id => guild.roles.cache.has(id)).map(id => `<@&${id}>`).join(', ')
        : "Aucun";

    const autoCloseVal = ms.autoCloseInactive ? "​✅" : "​❌";
    const autoDeleteVal = ms.autoDeleteClosed ? "​✅" : "​❌";
    const replyWithoutCmdVal = ms.replyWithoutCmd ? "​✅" : "​❌";

    return new EmbedBuilder()
        .setTitle("Paramètres du modmail")
        .setColor(color)
        .addFields(
            { name: "Activé", value: actifVal, inline: true },
            { name: "Catégorie des tickets", value: categoryVal, inline: true },
            { name: "Logs", value: logsVal, inline: true },
            { name: "Modérateurs anonymes", value: anonVal, inline: true },
            { name: "Fermer les tickets des membres sans serveur en commun", value: closeNoCommonVal, inline: true },
            { name: "Rôles ayant accès", value: accessRolesVal, inline: true },
            { name: "Rôles mentionnés", value: mentionRolesVal, inline: true },
            { name: "Rôles requis", value: reqRolesVal, inline: true },
            { name: "Rôles interdits", value: banRolesVal, inline: true },
            { name: "Fermer les tickets inactifs automatiquement", value: autoCloseVal, inline: true },
            { name: "Suppression automatique des salons fermés", value: autoDeleteVal, inline: true },
            { name: "Réponse sans commande", value: replyWithoutCmdVal, inline: true }
        );
}

function buildModmailMenu() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("modmail_settings_menu")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                {
                    label: "Activer/d'ésactiver le modmail",
                    value: "1",
                    emoji: { name: "📭" }
                },
                {
                    label: "Créer une catégorie",
                    value: "2",
                    emoji: { name: "📧" }
                },
                {
                    label: "Modifier la catégorie",
                    value: "3",
                    emoji: { name: "🏷" }
                },
                {
                    label: "Modifier le salon des logs",
                    value: "4",
                    emoji: { name: "📡" }
                },
                {
                    label: "Modérateurs anonymes",
                    value: "5",
                    emoji: { name: "🕵" }
                },
                {
                    label: "Fermer les tickets des membres sans serveur en commun",
                    value: "12",
                    emoji: { name: "🚪" }
                },
                {
                    label: "Rôles ayant accès",
                    value: "6",
                    emoji: { name: "🔰" }
                },
                {
                    label: "Modifier les rôles à mentionner",
                    value: "7",
                    emoji: { name: "🔔" }
                },
                {
                    label: "Rôles requis",
                    value: "8",
                    emoji: { name: "⛓" }
                },
                {
                    label: "Rôles interdits",
                    value: "9",
                    emoji: { name: "🚫" }
                },
                {
                    label: "Fermer les tickets inactifs automatiquement",
                    value: "13",
                    emoji: { name: "🧹" }
                },
                {
                    label: "Suppression automatique des salons fermés",
                    value: "10",
                    emoji: { name: "✂" }
                },
                {
                    label: "Réponse sans commande",
                    value: "11",
                    emoji: { name: "💬" }
                }
            ])
    );
}

module.exports = {
    name: "modmail",
    description: "Paramètre les modmails du bot",
    category: "Configuration du serveur",
    aliases: [],
    permissions: [],
    perm: 7,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        ensureModmailDb(db);
        client.save(message.guildId);

        const embed = buildModmailEmbed(db, message.guild);
        const row = buildModmailMenu();

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

            const ms = db.modmailSettings;

            if (interaction.customId === "modmail_cat_select") {
                ms.category = interaction.values[0] || null;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            if (interaction.customId === "modmail_logs_select") {
                ms.logs = interaction.values[0] || null;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            if (interaction.customId === "modmail_access_roles") {
                ms.accessRoles = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            if (interaction.customId === "modmail_mention_roles") {
                ms.mentionRoles = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            if (interaction.customId === "modmail_req_roles") {
                ms.reqRoles = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            if (interaction.customId === "modmail_ban_roles") {
                ms.banRoles = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            const val = interaction.values?.[0];

            if (val === "1") {
                ms.actif = !ms.actif;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            if (val === "2") {
                await interaction.deferUpdate().catch(() => null);
                const cat = await message.guild.channels.create({
                    name: "MODMAIL",
                    type: ChannelType.GuildCategory
                }).catch(() => null);
                if (cat) {
                    ms.category = cat.id;
                    ms.actif = true;
                    client.save(message.guildId);
                }
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            if (val === "3") {
                await interaction.deferUpdate().catch(() => null);
                const catRow = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("modmail_cat_select")
                        .setChannelTypes([ChannelType.GuildCategory])
                        .setPlaceholder("Veuillez choisir une catégorie")
                        .setMinValues(1)
                        .setMaxValues(1)
                );
                return msg.edit({ components: [catRow] }).catch(() => null);
            }

            if (val === "4") {
                await interaction.deferUpdate().catch(() => null);
                const logRow = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("modmail_logs_select")
                        .setChannelTypes([ChannelType.GuildText, ChannelType.GuildAnnouncement])
                        .setPlaceholder("Veuillez choisir un salon pour les logs")
                        .setMinValues(1)
                        .setMaxValues(1)
                );
                return msg.edit({ components: [logRow] }).catch(() => null);
            }

            if (val === "5") {
                ms.anonymous = !ms.anonymous;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            if (val === "12") {
                ms.closeNoCommon = !ms.closeNoCommon;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            if (val === "6") {
                await interaction.deferUpdate().catch(() => null);
                const roleRow = new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("modmail_access_roles")
                        .setPlaceholder("Veuillez choisir les rôles ayant accès")
                        .setMinValues(0)
                        .setMaxValues(25)
                );
                return msg.edit({ components: [roleRow] }).catch(() => null);
            }

            if (val === "7") {
                await interaction.deferUpdate().catch(() => null);
                const roleRow = new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("modmail_mention_roles")
                        .setPlaceholder("Veuillez choisir les rôles à mentionner")
                        .setMinValues(0)
                        .setMaxValues(25)
                );
                return msg.edit({ components: [roleRow] }).catch(() => null);
            }

            if (val === "8") {
                await interaction.deferUpdate().catch(() => null);
                const roleRow = new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("modmail_req_roles")
                        .setPlaceholder("Veuillez choisir les rôles requis")
                        .setMinValues(0)
                        .setMaxValues(25)
                );
                return msg.edit({ components: [roleRow] }).catch(() => null);
            }

            if (val === "9") {
                await interaction.deferUpdate().catch(() => null);
                const roleRow = new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("modmail_ban_roles")
                        .setPlaceholder("Veuillez choisir les rôles interdits")
                        .setMinValues(0)
                        .setMaxValues(25)
                );
                return msg.edit({ components: [roleRow] }).catch(() => null);
            }

            if (val === "13") {
                ms.autoCloseInactive = !ms.autoCloseInactive;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            if (val === "10") {
                ms.autoDeleteClosed = !ms.autoDeleteClosed;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }

            if (val === "11") {
                ms.replyWithoutCmd = !ms.replyWithoutCmd;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildModmailEmbed(db, message.guild)],
                    components: [buildModmailMenu()]
                }).catch(() => null);
            }
        });
    }
};
