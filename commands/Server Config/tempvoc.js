const { Client, Message, ContainerBuilder, SectionBuilder, TextDisplayBuilder, ActionRowBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags } = require("discord.js");

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

function buildTempvocCmdContainer(db) {
    const colorInt = parseColor(db.color);
    const container = new ContainerBuilder()
        .setAccentColor(colorInt)
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("**`+rename <nom>`**\nRenomme le salon"))
                .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_cmd_rename").setStyle(ButtonStyle.Secondary).setEmoji({ name: "❌" })),
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("**`+set <visible/invisible>`**\nRend le salon visible/invisible pour tout le monde"))
                .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_cmd_set").setStyle(ButtonStyle.Secondary).setEmoji({ name: "❌" })),
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("**`+open/private>`**\nRend le salon ouvert/privé"))
                .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_cmd_open_private").setStyle(ButtonStyle.Secondary).setEmoji({ name: "❌" })),
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("**`+del/add <membre/rôle>`**\nDonne/supprime l'accès à un membre/rôle"))
                .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_cmd_del_add").setStyle(ButtonStyle.Secondary).setEmoji({ name: "❌" })),
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("**`+voicekick <membre>`**\nExpulse un membre du salon vocal"))
                .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_cmd_voicekick").setStyle(ButtonStyle.Secondary).setEmoji({ name: "❌" })),
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("**`+limit <limit>`**\nModifie la limite de membre du salon"))
                .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_cmd_limit").setStyle(ButtonStyle.Secondary).setEmoji({ name: "❌" })),
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Les commandes peuvent être faites dans n'importe quel salon**"))
                .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_cmd_anywhere").setStyle(ButtonStyle.Secondary).setEmoji({ name: "❌" }))
        );

    return [container];
}

function buildTempvocComponents(db, panelIndex = 0, isAdvanced = false) {
    const colorInt = parseColor(db.color);
    if (!Array.isArray(db.tempvocPanels) || db.tempvocPanels.length === 0) {
        db.tempvocPanels = [{
            channelId: null,
            name: "🕙{MemberName}",
            limit: "∞",
            roles_req: [],
            roles_ban: [],
            manage_channel: true,
            manage_perms: true,
            move_members: true,
            invisible_default: false,
            backup_category: null,
            buffer_category: null,
            buffer_size: "0",
            badwords: [],
            block_badwords: false
        }];
    }

    const panel = db.tempvocPanels[panelIndex] || db.tempvocPanels[0];

    if (!isAdvanced) {
        // Panel 1 (Main Settings)
        const container = new ContainerBuilder()
            .setAccentColor(colorInt)
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètres des vocaux temporaires"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_toggle_page").setStyle(ButtonStyle.Secondary).setEmoji({ name: "🔧" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Salon**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_create_cat").setStyle(ButtonStyle.Secondary).setLabel("Créer une catégorie"))
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("tempvoc_channel_select")
                        .setMinValues(0)
                        .setMaxValues(1)
                        .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice])
                        .setDefaultChannels(panel.channelId ? [panel.channelId] : [])
                )
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Nom des salons**\n${panel.name || "🕙{MemberName}"}`))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_edit_name").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Limite de membres**\n${panel.limit || "∞"}`))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_edit_limit").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" }))
            )
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Rôles requis**"))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("tempvoc_roles_req")
                        .setMinValues(0)
                        .setMaxValues(25)
                        .setDefaultRoles(panel.roles_req || [])
                )
            )
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Rôles interdits**"))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("tempvoc_roles_ban")
                        .setMinValues(0)
                        .setMaxValues(25)
                        .setDefaultRoles(panel.roles_ban || [])
                )
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Le créateur peut gérer le salon**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_toggle_manage_channel").setStyle(ButtonStyle.Secondary).setEmoji({ name: panel.manage_channel ? "✅" : "❌" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Le créateur peut gérer les permissions**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_toggle_manage_perms").setStyle(ButtonStyle.Secondary).setEmoji({ name: panel.manage_perms ? "✅" : "❌" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Le créateur peut déplacer les membres**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_toggle_move_members").setStyle(ButtonStyle.Secondary).setEmoji({ name: panel.move_members ? "✅" : "❌" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Le salon est invisible par défaut**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_toggle_invisible").setStyle(ButtonStyle.Secondary).setEmoji({ name: panel.invisible_default ? "✅" : "❌" }))
            );

        const bottomRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("tempvoc_add_panel").setStyle(ButtonStyle.Primary).setLabel("Ajouter un panel").setEmoji({ name: "➕" }),
            new ButtonBuilder().setCustomId("tempvoc_del_panel").setStyle(ButtonStyle.Danger).setEmoji({ name: "🗑" })
        );

        return [container, bottomRow];
    } else {
        // Panel 2 (Advanced Settings)
        const bufferOptions = [
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
            "11", "12", "13", "14", "15", "16", "17", "18", "20",
            "25", "30", "35", "40", "45", "50"
        ].map(v => ({ label: v, value: v }));

        const badwordsContent = Array.isArray(panel.badwords) && panel.badwords.length > 0
            ? panel.badwords.map(w => `- ${w}`).join('\n')
            : "-# Aucun mot interdit";

        const container = new ContainerBuilder()
            .setAccentColor(colorInt)
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètres des vocaux temporaires"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_toggle_page").setStyle(ButtonStyle.Secondary).setEmoji({ name: "🏠" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Catégorie de secours**\n-# C'est là que les tempvocs seront créés si la catégorie principale a déjà le nombre maximum (50) de salons"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_create_cat_backup").setStyle(ButtonStyle.Secondary).setLabel("Créer une catégorie"))
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("tempvoc_cat_backup_select")
                        .setMinValues(0)
                        .setMaxValues(1)
                        .setChannelTypes([ChannelType.GuildCategory])
                        .setDefaultChannels(panel.backup_category ? [panel.backup_category] : [])
                )
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Catégorie tampon**\n-# Permet au bot de recycler les salons pour éviter les ratelimit de création de salons (seulement utile pour les serveurs très actifs vocalement)"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_create_cat_buffer").setStyle(ButtonStyle.Secondary).setLabel("Créer une catégorie"))
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("tempvoc_cat_buffer_select")
                        .setMinValues(0)
                        .setMaxValues(1)
                        .setChannelTypes([ChannelType.GuildCategory])
                        .setDefaultChannels(panel.buffer_category ? [panel.buffer_category] : [])
                )
            )
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Taille du tampon**"))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("tempvoc_buffer_size_select")
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setPlaceholder(panel.buffer_size || "0")
                        .addOptions(bufferOptions)
                )
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Mots interdits dans les noms des tempvocs**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_add_badword").setStyle(ButtonStyle.Secondary).setLabel("Ajouter un mot"))
            )
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(badwordsContent))
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Bloquer les mots de la badwords list**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("tempvoc_toggle_block_badwords").setStyle(ButtonStyle.Secondary).setEmoji({ name: panel.block_badwords ? "✅" : "❌" }))
            );

        const bottomRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("tempvoc_add_panel").setStyle(ButtonStyle.Primary).setLabel("Ajouter un panel").setEmoji({ name: "➕" }),
            new ButtonBuilder().setCustomId("tempvoc_del_panel").setStyle(ButtonStyle.Danger).setEmoji({ name: "🗑" })
        );

        return [container, bottomRow];
    }
}

module.exports = {
    name: "tempvoc",
    description: "Affiche un menu interactif pour gérer les vocaux temporaires sur le serveur",
    category: "Configuration du serveur",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 7,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);

        if (args[0] === 'cmd') {
            const components = buildTempvocCmdContainer(db);
            return message.channel.send({ components, flags: MessageFlags.IsComponentsV2 }).catch(() => null);
        }

        let currentPanel = 0;
        let isAdvanced = false;

        const components = buildTempvocComponents(db, currentPanel, isAdvanced);
        const sentMessage = await message.channel.send({ components, flags: MessageFlags.IsComponentsV2 }).catch(() => null);
        if (!sentMessage) return;

        const collector = sentMessage.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 15 * 60 * 1000
        });

        collector.on('end', () => {
            sentMessage.edit({ components: [] }).catch(() => null);
        });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 });
            }

            const panel = db.tempvocPanels[currentPanel] || db.tempvocPanels[0];
            const id = interaction.customId;

            if (id === "tempvoc_toggle_page") {
                isAdvanced = !isAdvanced;
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_channel_select") {
                panel.channelId = interaction.values[0] || null;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_create_cat") {
                await interaction.deferUpdate().catch(() => null);
                const cat = await message.guild.channels.create({
                    name: "Vocaux Temporaires",
                    type: ChannelType.GuildCategory
                }).catch(() => null);
                if (cat) {
                    const voice = await message.guild.channels.create({
                        name: "➕ Rejoindre pour créer",
                        type: ChannelType.GuildVoice,
                        parent: cat.id
                    }).catch(() => null);
                    if (voice) {
                        panel.channelId = voice.id;
                        client.save(message.guildId);
                    }
                }
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_edit_name") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Quel sera le nom par défaut des salons ? (ex: `🕙{MemberName}`)");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    panel.name = resp.content.trim();
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_edit_limit") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Quelle sera la limite de membres ? (0 ou `∞` pour illimité)");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    const val = resp.content.trim();
                    panel.limit = val === "0" ? "∞" : val;
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_roles_req") {
                panel.roles_req = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_roles_ban") {
                panel.roles_ban = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_toggle_manage_channel") {
                panel.manage_channel = !panel.manage_channel;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_toggle_manage_perms") {
                panel.manage_perms = !panel.manage_perms;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_toggle_move_members") {
                panel.move_members = !panel.move_members;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_toggle_invisible") {
                panel.invisible_default = !panel.invisible_default;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_add_panel") {
                db.tempvocPanels.push({
                    channelId: null,
                    name: "🕙{MemberName}",
                    limit: "∞",
                    roles_req: [],
                    roles_ban: [],
                    manage_channel: true,
                    manage_perms: true,
                    move_members: true,
                    invisible_default: false,
                    backup_category: null,
                    buffer_category: null,
                    buffer_size: "0",
                    badwords: [],
                    block_badwords: false
                });
                currentPanel = db.tempvocPanels.length - 1;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_del_panel") {
                if (db.tempvocPanels.length > 1) {
                    db.tempvocPanels.splice(currentPanel, 1);
                    currentPanel = Math.max(0, currentPanel - 1);
                    client.save(message.guildId);
                }
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_cat_backup_select") {
                panel.backup_category = interaction.values[0] || null;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_cat_buffer_select") {
                panel.buffer_category = interaction.values[0] || null;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_buffer_size_select") {
                panel.buffer_size = interaction.values[0] || "0";
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_toggle_block_badwords") {
                panel.block_badwords = !panel.block_badwords;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "tempvoc_add_badword") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Quel mot souhaitez-vous interdire dans les tempvocs ?");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    const w = resp.content.trim();
                    panel.badwords ??= [];
                    if (w && !panel.badwords.includes(w)) {
                        panel.badwords.push(w);
                        client.save(message.guildId);
                    }
                    resp.delete().catch(() => null);
                }
                return sentMessage.edit({
                    components: buildTempvocComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }
        });
    }
};
