const { Client, Message, ContainerBuilder, SectionBuilder, TextDisplayBuilder, ActionRowBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, MessageFlags } = require("discord.js");

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

function ensurePanels(db) {
    if (!Array.isArray(db.ticketPanels) || db.ticketPanels.length === 0) {
        db.ticketPanels = [{
            panelChannelId: null,
            messageUrl: null,
            isAutoMessage: true,
            type: "buttons",
            claim: 0,
            roles_req: [],
            roles_ban: [],
            options: [],
            autoclaim: false,
            maxPerUser: "1",
            closeOnLeave: false,
            autoCloseInactive: "❌",
            claimButton: true,
            closeButton: true,
            autoDeleteClosed: true,
            transcriptDm: true
        }];
    }
}

function buildTicketComponents(db, panelIndex = 0, isAdvanced = false) {
    ensurePanels(db);
    const colorInt = parseColor(db.color);
    const panel = db.ticketPanels[panelIndex] || db.ticketPanels[0];

    if (!isAdvanced) {
        const isButtons = panel.type !== "select";
        const claimMode = Number(panel.claim) || 0;

        const optionsItems = (panel.options || []).map((opt, idx) => ({
            label: opt.label || `Option ${idx + 1}`,
            value: String(idx + 1),
            emoji: opt.emoji ? { name: opt.emoji } : { name: "🎫" }
        }));
        optionsItems.push({
            label: "Ajouter une option...",
            value: "add_option",
            emoji: { name: "➕" }
        });

        const container = new ContainerBuilder()
            .setAccentColor(colorInt)
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètres des tickets"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("ticket_toggle_advanced").setStyle(ButtonStyle.Secondary).setEmoji({ name: "🔧" }))
            )
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Message**"));

        if (panel.messageUrl) {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(panel.messageUrl));
        } else {
            container.addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("ticket_channel_select")
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setChannelTypes([ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread])
                        .setDefaultChannels(panel.panelChannelId ? [panel.panelChannelId] : [])
                )
            );
        }

        container
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("ticket_choose_message").setStyle(ButtonStyle.Secondary).setLabel("Choisir le message du panel"),
                    new ButtonBuilder().setCustomId("ticket_auto_message").setStyle(ButtonStyle.Primary).setDisabled(Boolean(panel.isAutoMessage)).setLabel("Envoyer un message automatique")
                )
            )
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Type**"))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("ticket_type_buttons").setStyle(isButtons ? ButtonStyle.Primary : ButtonStyle.Secondary).setDisabled(isButtons).setLabel("Boutons"),
                    new ButtonBuilder().setCustomId("ticket_type_select").setStyle(!isButtons ? ButtonStyle.Primary : ButtonStyle.Secondary).setDisabled(!isButtons).setLabel("Sélecteur")
                )
            )
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Claim**"))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("ticket_claim_0").setStyle(claimMode === 0 ? ButtonStyle.Primary : ButtonStyle.Secondary).setDisabled(claimMode === 0).setLabel("Désactivé"),
                    new ButtonBuilder().setCustomId("ticket_claim_1").setStyle(claimMode === 1 ? ButtonStyle.Primary : ButtonStyle.Secondary).setDisabled(claimMode === 1).setLabel("Empêche les autres modérateur de parler"),
                    new ButtonBuilder().setCustomId("ticket_claim_2").setStyle(claimMode === 2 ? ButtonStyle.Primary : ButtonStyle.Secondary).setDisabled(claimMode === 2).setLabel("Empêche les autres modérateur de voir")
                )
            )
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Rôles requis**"))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("ticket_roles_req")
                        .setMinValues(0)
                        .setMaxValues(25)
                        .setDefaultRoles(panel.roles_req || [])
                )
            )
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Rôles interdits**"))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("ticket_roles_ban")
                        .setMinValues(0)
                        .setMaxValues(25)
                        .setDefaultRoles(panel.roles_ban || [])
                )
            )
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Options**"))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("ticket_options_select")
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setPlaceholder("Gérer les options")
                        .addOptions(optionsItems)
                )
            );

        const bottomRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("ticket_validate_panel").setStyle(ButtonStyle.Success).setLabel("Valider").setEmoji({ name: "✅" }),
            new ButtonBuilder().setCustomId("ticket_add_panel").setStyle(ButtonStyle.Primary).setLabel("Ajouter un panel").setEmoji({ name: "➕" }),
            new ButtonBuilder().setCustomId("ticket_delete_panel").setStyle(ButtonStyle.Danger).setEmoji({ name: "🗑" }),
            new ButtonBuilder().setCustomId("ticket_back").setStyle(ButtonStyle.Secondary).setEmoji({ name: "↩" })
        );

        return [container, bottomRow];
    } else {
        const container = new ContainerBuilder()
            .setAccentColor(colorInt)
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètres des tickets"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("ticket_toggle_advanced").setStyle(ButtonStyle.Secondary).setEmoji({ name: "🏠" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Autoclaim**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("ticket_toggle_autoclaim").setStyle(ButtonStyle.Secondary).setEmoji({ name: panel.autoclaim ? "✅" : "❌" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Nombre maximum de ticket par personne**\n${panel.maxPerUser || "1"}`))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("ticket_edit_max_per_user").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Fermer automatiquement les tickets des membres quittant le serveur**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("ticket_toggle_close_on_leave").setStyle(ButtonStyle.Secondary).setEmoji({ name: panel.closeOnLeave ? "✅" : "❌" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Fermeture automatique des tickets inactifs**\n${panel.autoCloseInactive || "❌"}`))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("ticket_edit_auto_close_inactive").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Bouton claim**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("ticket_toggle_claim_btn").setStyle(ButtonStyle.Secondary).setEmoji({ name: panel.claimButton !== false ? "✅" : "❌" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Bouton close**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("ticket_toggle_close_btn").setStyle(ButtonStyle.Secondary).setEmoji({ name: panel.closeButton !== false ? "✅" : "❌" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Suppression automatique des tickets fermés**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("ticket_toggle_autodelete").setStyle(ButtonStyle.Secondary).setEmoji({ name: panel.autoDeleteClosed !== false ? "✅" : "❌" })),
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Transcript MP**"))
                    .setButtonAccessory(new ButtonBuilder().setCustomId("ticket_toggle_transcript").setStyle(ButtonStyle.Secondary).setEmoji({ name: panel.transcriptDm !== false ? "✅" : "❌" }))
            );

        const bottomRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("ticket_validate_panel").setStyle(ButtonStyle.Success).setLabel("Valider").setEmoji({ name: "✅" }),
            new ButtonBuilder().setCustomId("ticket_add_panel").setStyle(ButtonStyle.Primary).setLabel("Ajouter un panel").setEmoji({ name: "➕" }),
            new ButtonBuilder().setCustomId("ticket_delete_panel").setStyle(ButtonStyle.Danger).setEmoji({ name: "🗑" }),
            new ButtonBuilder().setCustomId("ticket_back").setStyle(ButtonStyle.Secondary).setEmoji({ name: "↩" })
        );

        return [container, bottomRow];
    }
}

module.exports = {
    name: "ticket",
    description: "Affiche un menu permettant de gérer le système de ticket",
    category: "Configuration du serveur",
    aliases: [],
    permissions: [],
    argument: "settings",
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
        ensurePanels(db);
        client.save(message.guildId);

        let currentPanel = 0;
        let isAdvanced = false;

        const components = buildTicketComponents(db, currentPanel, isAdvanced);
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

            const panel = db.ticketPanels[currentPanel] || db.ticketPanels[0];
            const id = interaction.customId;

            if (id === "ticket_toggle_advanced") {
                isAdvanced = !isAdvanced;
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_channel_select") {
                panel.panelChannelId = interaction.values[0] || null;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_type_buttons") {
                panel.type = "buttons";
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_type_select") {
                panel.type = "select";
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id.startsWith("ticket_claim_")) {
                panel.claim = parseInt(id.replace("ticket_claim_", ""), 10) || 0;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_roles_req") {
                panel.roles_req = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_roles_ban") {
                panel.roles_ban = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_choose_message") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Envoyez le lien ou l'ID du message à utiliser pour le panel de tickets");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    panel.messageUrl = resp.content.trim();
                    panel.isAutoMessage = false;
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_auto_message") {
                panel.messageUrl = null;
                panel.isAutoMessage = true;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_toggle_autoclaim") {
                panel.autoclaim = !panel.autoclaim;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_toggle_close_on_leave") {
                panel.closeOnLeave = !panel.closeOnLeave;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_toggle_claim_btn") {
                panel.claimButton = panel.claimButton === false;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_toggle_close_btn") {
                panel.closeButton = panel.closeButton === false;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_toggle_autodelete") {
                panel.autoDeleteClosed = panel.autoDeleteClosed === false;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_toggle_transcript") {
                panel.transcriptDm = panel.transcriptDm === false;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_edit_max_per_user") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Combien de tickets maximum par personne ? (ex: `1`, `2`)");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    panel.maxPerUser = resp.content.trim() || "1";
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_edit_auto_close_inactive") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Quelle sera la durée d'inactivité avant fermeture automatique ? (ou `off` pour désactiver)");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    const txt = resp.content.trim();
                    panel.autoCloseInactive = txt.toLowerCase() === "off" ? "❌" : txt;
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_add_panel") {
                db.ticketPanels.push({
                    panelChannelId: null,
                    messageUrl: null,
                    isAutoMessage: true,
                    type: "buttons",
                    claim: 0,
                    roles_req: [],
                    roles_ban: [],
                    options: [],
                    autoclaim: false,
                    maxPerUser: "1",
                    closeOnLeave: false,
                    autoCloseInactive: "❌",
                    claimButton: true,
                    closeButton: true,
                    autoDeleteClosed: true,
                    transcriptDm: true
                });
                currentPanel = db.ticketPanels.length - 1;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_delete_panel") {
                if (db.ticketPanels.length > 1) {
                    db.ticketPanels.splice(currentPanel, 1);
                    currentPanel = Math.max(0, currentPanel - 1);
                    client.save(message.guildId);
                }
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildTicketComponents(db, currentPanel, isAdvanced)
                }).catch(() => null);
            }

            if (id === "ticket_options_select") {
                const val = interaction.values[0];
                if (val === "add_option") {
                    await interaction.deferUpdate().catch(() => null);
                    const q = await message.channel.send("Quel sera le nom de l'option ?");
                    const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                    q.delete().catch(() => null);
                    if (responses.size > 0) {
                        const resp = responses.first();
                        panel.options ??= [];
                        panel.options.push({ label: resp.content.trim(), emoji: "🎫" });
                        resp.delete().catch(() => null);
                        client.save(message.guildId);
                    }
                    return sentMessage.edit({
                        components: buildTicketComponents(db, currentPanel, isAdvanced)
                    }).catch(() => null);
                }
            }

            if (id === "ticket_validate_panel") {
                await interaction.deferUpdate().catch(() => null);
                const targetChannel = panel.panelChannelId ? message.guild.channels.cache.get(panel.panelChannelId) : message.channel;
                if (targetChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle("Tickets")
                        .setDescription("Cliquez sur le bouton ci-dessous pour ouvrir un ticket.")
                        .setColor(parseColor(db.color));

                    if (panel.type === "select") {
                        const menu = new StringSelectMenuBuilder()
                            .setCustomId("open_ticket_select")
                            .setPlaceholder("Ouvrir un ticket...")
                            .addOptions((panel.options?.length ? panel.options : [{ label: "Ouvrir un ticket", emoji: "🎫" }]).map((o, idx) => ({
                                label: o.label || `Ticket ${idx + 1}`,
                                value: `ticket_${idx}`,
                                emoji: o.emoji || "🎫"
                            })));
                        await targetChannel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] }).catch(() => null);
                    } else {
                        const buttons = (panel.options?.length ? panel.options : [{ label: "Ouvrir un ticket", emoji: "🎫" }]).slice(0, 5).map((o, idx) =>
                            new ButtonBuilder()
                                .setCustomId(`open_ticket_btn_${idx}`)
                                .setLabel(o.label || `Ticket ${idx + 1}`)
                                .setEmoji(o.emoji || "🎫")
                                .setStyle(ButtonStyle.Primary)
                        );
                        await targetChannel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(buttons)] }).catch(() => null);
                    }
                }
                return message.channel.send("Panel de ticket validé et déployé avec succès !");
            }
        });
    }
};
