const { Client, Message, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");

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

function ensureRolemenuData(db) {
    db.rolemenuConfig ??= {
        multiple: false,
        channelId: null,
        messageId: "Embed automatique",
        style: "Boutons",
        type: "Donner/Retirer",
        required_roles: [],
        bl_roles: [],
        options: []
    };
}

function buildRolemenuEmbed(db, guild) {
    ensureRolemenuData(db);
    const cfg = db.rolemenuConfig;
    const color = parseColor(db.color);

    const channelDisplay = cfg.channelId && guild.channels.cache.get(cfg.channelId)
        ? `<#${cfg.channelId}>`
        : `<#${guild.id}>`;

    const reqRolesDisplay = Array.isArray(cfg.required_roles) && cfg.required_roles.length > 0
        ? cfg.required_roles.filter(id => guild.roles.cache.has(id)).map(id => `<@&${id}>`).join('\n') || "Aucun"
        : "Aucun";

    const blRolesDisplay = Array.isArray(cfg.bl_roles) && cfg.bl_roles.length > 0
        ? cfg.bl_roles.filter(id => guild.roles.cache.has(id)).map(id => `<@&${id}>`).join('\n') || "Aucun"
        : "Aucun";

    const modifiedRolesDisplay = Array.isArray(cfg.options) && cfg.options.length > 0
        ? cfg.options.map(o => `${o.emoji ? o.emoji + ' ' : ''}${o.roleId ? `<@&${o.roleId}>` : '@' + (o.text || 'Rôle')}`).join('\n')
        : "Aucun";

    return new EmbedBuilder()
        .setTitle("Rolemenu")
        .setColor(color)
        .addFields(
            { name: "Multiple", value: cfg.multiple ? "✅" : "❌", inline: true },
            { name: "Salon", value: channelDisplay, inline: true },
            { name: "Message", value: cfg.messageId || "Embed automatique", inline: true },
            { name: "Style", value: cfg.style || "Boutons", inline: true },
            { name: "Type", value: cfg.type || "Donner/Retirer", inline: true },
            { name: "Rôles requis", value: reqRolesDisplay, inline: true },
            { name: "Rôles interdits", value: blRolesDisplay, inline: true },
            { name: "Rôles modifiés", value: modifiedRolesDisplay, inline: true }
        );
}

function buildRolemenuComponents(db, guild) {
    ensureRolemenuData(db);
    const cfg = db.rolemenuConfig;

    const roleOptions = (cfg.options || []).slice(0, 24).map((opt, idx) => ({
        label: opt.roleId && guild.roles.cache.get(opt.roleId) ? `@${guild.roles.cache.get(opt.roleId).name}` : opt.text || `Option ${idx + 1}`,
        description: `Couleur: ${opt.color || "Bleu"}`,
        value: `edit_option_${idx}`,
        emoji: opt.emoji ? { name: opt.emoji } : undefined
    }));
    roleOptions.push({
        label: "Ajouter une option...",
        value: "add_option"
    });

    const row0 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("rolemenu_options_menu")
            .setPlaceholder("Gêrer les rôles du menu")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(roleOptions)
    );

    const row1 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("rolemenu_settings_menu")
            .setPlaceholder("Paramètres du menu")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                { label: "Multiples rôles possibles", value: "1", emoji: { name: "👥" } },
                { label: "Modifier le salon", value: "2", emoji: { name: "🏷" } },
                { label: "Utiliser le dernier message du salon", value: "3", emoji: { name: "⤴" } },
                { label: "Me faire envoyer un embed automatique", value: "4", emoji: { name: "💬" } },
                { label: "Choisir l'ID d'un message", value: "5", emoji: { name: "🆔" } },
                { label: "Modifier les rôles requis", value: "6", emoji: { name: "⛓" } },
                { label: "Modifier les rôles interdits", value: "7", emoji: { name: "🚫" } },
                { label: "Style réactions", value: "8", emoji: { name: "🧑" } },
                { label: "Style boutons", value: "9", emoji: { name: "⏺" } },
                { label: "Style sélecteur", value: "10", emoji: { name: "📃" } },
                { label: "Type Donner/Retirer", value: "11", emoji: { name: "🔄" } },
                { label: "Type Retirer", value: "12", emoji: { name: "📤" } },
                { label: "Type Donner", value: "13", emoji: { name: "📥" } }
            ])
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("rolemenu_validate")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Valider le rolemenu")
            .setEmoji({ name: "✅" }),
        new ButtonBuilder()
            .setCustomId("rolemenu_delete")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Supprimer le rolemenu")
            .setEmoji({ name: "❌" })
    );

    return [row0, row1, row2];
}

function buildOptionEmbed(opt, index, db, guild) {
    const color = parseColor(db.color);
    const roleDisplay = opt.roleId && guild.roles.cache.get(opt.roleId)
        ? `<@&${opt.roleId}>`
        : "None";

    return new EmbedBuilder()
        .setTitle("Paramètre de rôle")
        .setColor(color)
        .addFields(
            { name: "Position", value: String(index + 1), inline: true },
            { name: "Rôle", value: roleDisplay, inline: true },
            { name: "Emoji", value: opt.emoji || "Aucun", inline: true },
            { name: "Texte (sélecteur et bouton seulement)", value: opt.text || "Aucun", inline: true },
            { name: "Description (sélecteur seulement)", value: opt.description || "Aucune description", inline: true },
            { name: "Couleur (bouton seulement)", value: opt.color || "Bleu", inline: true }
        );
}

function buildOptionComponents() {
    const row0 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("option_settings_menu")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                { label: "Changer la position", value: "1", emoji: { name: "↕" } },
                { label: "Modifier le rôle", value: "2", emoji: { name: "🎭" } },
                { label: "Modifier l'émoji", value: "3", emoji: { name: "🧑" } },
                { label: "Modifier le texte", value: "4", emoji: { name: "✏" } },
                { label: "Modifier la description", value: "5", emoji: { name: "💬" } },
                { label: "Style de bouton bleu", value: "6", emoji: { name: "🔵" } },
                { label: "Style de bouton gris", value: "7", emoji: { name: "⚪" } },
                { label: "Style de bouton vert", value: "8", emoji: { name: "🟢" } },
                { label: "Style de bouton rouge", value: "9", emoji: { name: "🔴" } }
            ])
    );

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("option_back")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Retour")
            .setEmoji({ name: "↩" }),
        new ButtonBuilder()
            .setCustomId("option_delete")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("supprimer l'option")
            .setEmoji({ name: "❌" })
    );

    return [row0, row1];
}

module.exports = {
    name: "rolemenu",
    description: "Affiche un menu interactif pour créer ou modifier un menu de rôles",
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
        ensureRolemenuData(db);
        if (!db.rolemenuConfig.channelId) {
            db.rolemenuConfig.channelId = message.channel.id;
        }
        client.save(message.guildId);

        let activeOptionIndex = null;

        const embed = buildRolemenuEmbed(db, message.guild);
        const components = buildRolemenuComponents(db, message.guild);

        const msg = await message.channel.send({ embeds: [embed], components });
        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 15 * 60 * 1000
        });

        collector.on('end', () => msg.edit({ components: [] }).catch(() => null));

        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: "Vous ne pouvez pas utiliser ce menu", flags: 64 });
            }

            const cfg = db.rolemenuConfig;

            if (interaction.customId === "rolemenu_channel_select") {
                cfg.channelId = interaction.values[0] || message.channel.id;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildRolemenuEmbed(db, message.guild)],
                    components: buildRolemenuComponents(db, message.guild)
                }).catch(() => null);
            }

            if (interaction.customId === "rolemenu_req_roles_select") {
                cfg.required_roles = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildRolemenuEmbed(db, message.guild)],
                    components: buildRolemenuComponents(db, message.guild)
                }).catch(() => null);
            }

            if (interaction.customId === "rolemenu_bl_roles_select") {
                cfg.bl_roles = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildRolemenuEmbed(db, message.guild)],
                    components: buildRolemenuComponents(db, message.guild)
                }).catch(() => null);
            }

            if (interaction.customId === "option_role_select") {
                if (activeOptionIndex !== null && cfg.options[activeOptionIndex]) {
                    cfg.options[activeOptionIndex].roleId = interaction.values[0] || null;
                    client.save(message.guildId);
                }
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildOptionEmbed(cfg.options[activeOptionIndex], activeOptionIndex, db, message.guild)],
                    components: buildOptionComponents()
                }).catch(() => null);
            }

            if (interaction.customId === "rolemenu_options_menu") {
                const val = interaction.values[0];
                if (val === "add_option") {
                    cfg.options.push({
                        roleId: null,
                        emoji: null,
                        text: null,
                        description: null,
                        color: "Bleu"
                    });
                    activeOptionIndex = cfg.options.length - 1;
                    client.save(message.guildId);
                    await interaction.deferUpdate().catch(() => null);
                    return msg.edit({
                        embeds: [buildOptionEmbed(cfg.options[activeOptionIndex], activeOptionIndex, db, message.guild)],
                        components: buildOptionComponents()
                    }).catch(() => null);
                }

                if (val.startsWith("edit_option_")) {
                    activeOptionIndex = parseInt(val.replace("edit_option_", ""), 10);
                    await interaction.deferUpdate().catch(() => null);
                    return msg.edit({
                        embeds: [buildOptionEmbed(cfg.options[activeOptionIndex], activeOptionIndex, db, message.guild)],
                        components: buildOptionComponents()
                    }).catch(() => null);
                }
            }

            if (interaction.customId === "option_back") {
                activeOptionIndex = null;
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildRolemenuEmbed(db, message.guild)],
                    components: buildRolemenuComponents(db, message.guild)
                }).catch(() => null);
            }

            if (interaction.customId === "option_delete") {
                if (activeOptionIndex !== null) {
                    cfg.options.splice(activeOptionIndex, 1);
                    activeOptionIndex = null;
                    client.save(message.guildId);
                }
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildRolemenuEmbed(db, message.guild)],
                    components: buildRolemenuComponents(db, message.guild)
                }).catch(() => null);
            }

            if (interaction.customId === "option_settings_menu") {
                const val = interaction.values[0];
                const opt = cfg.options[activeOptionIndex];
                if (!opt) return;

                if (val === "2") {
                    await interaction.deferUpdate().catch(() => null);
                    const roleRow = new ActionRowBuilder().addComponents(
                        new RoleSelectMenuBuilder()
                            .setCustomId("option_role_select")
                            .setPlaceholder("Veuillez choisir un rôle")
                            .setMinValues(1)
                            .setMaxValues(1)
                    );
                    return msg.edit({ components: [roleRow] }).catch(() => null);
                }

                if (val === "3") {
                    await interaction.deferUpdate().catch(() => null);
                    const q = await message.channel.send("Envoyez l'émoji à associer à cette option (ou `none`)");
                    const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                    q.delete().catch(() => null);
                    if (responses.size > 0) {
                        const resp = responses.first();
                        const em = resp.content.trim();
                        opt.emoji = em.toLowerCase() === "none" ? null : em;
                        resp.delete().catch(() => null);
                        client.save(message.guildId);
                    }
                    return msg.edit({
                        embeds: [buildOptionEmbed(opt, activeOptionIndex, db, message.guild)],
                        components: buildOptionComponents()
                    }).catch(() => null);
                }

                if (val === "4") {
                    await interaction.deferUpdate().catch(() => null);
                    const q = await message.channel.send("Envoyez le texte de l'option (ou `none`)");
                    const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                    q.delete().catch(() => null);
                    if (responses.size > 0) {
                        const resp = responses.first();
                        const txt = resp.content.trim();
                        opt.text = txt.toLowerCase() === "none" ? null : txt;
                        resp.delete().catch(() => null);
                        client.save(message.guildId);
                    }
                    return msg.edit({
                        embeds: [buildOptionEmbed(opt, activeOptionIndex, db, message.guild)],
                        components: buildOptionComponents()
                    }).catch(() => null);
                }

                if (val === "5") {
                    await interaction.deferUpdate().catch(() => null);
                    const q = await message.channel.send("Envoyez la description de l'option (ou `none`)");
                    const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                    q.delete().catch(() => null);
                    if (responses.size > 0) {
                        const resp = responses.first();
                        const desc = resp.content.trim();
                        opt.description = desc.toLowerCase() === "none" ? null : desc;
                        resp.delete().catch(() => null);
                        client.save(message.guildId);
                    }
                    return msg.edit({
                        embeds: [buildOptionEmbed(opt, activeOptionIndex, db, message.guild)],
                        components: buildOptionComponents()
                    }).catch(() => null);
                }

                if (val === "6") opt.color = "Bleu";
                if (val === "7") opt.color = "Gris";
                if (val === "8") opt.color = "Vert";
                if (val === "9") opt.color = "Rouge";

                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildOptionEmbed(opt, activeOptionIndex, db, message.guild)],
                    components: buildOptionComponents()
                }).catch(() => null);
            }

            if (interaction.customId === "rolemenu_settings_menu") {
                const val = interaction.values[0];

                if (val === "1") cfg.multiple = !cfg.multiple;
                if (val === "2") {
                    await interaction.deferUpdate().catch(() => null);
                    const channelRow = new ActionRowBuilder().addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId("rolemenu_channel_select")
                            .setPlaceholder("Veuillez choisir un salon")
                            .setMinValues(1)
                            .setMaxValues(1)
                    );
                    return msg.edit({ components: [channelRow] }).catch(() => null);
                }
                if (val === "3") cfg.messageId = "Dernier message";
                if (val === "4") cfg.messageId = "Embed automatique";
                if (val === "5") {
                    await interaction.deferUpdate().catch(() => null);
                    const q = await message.channel.send("Envoyez l'ID du message à utiliser pour le rolemenu");
                    const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                    q.delete().catch(() => null);
                    if (responses.size > 0) {
                        const resp = responses.first();
                        cfg.messageId = resp.content.trim();
                        resp.delete().catch(() => null);
                        client.save(message.guildId);
                    }
                    return msg.edit({
                        embeds: [buildRolemenuEmbed(db, message.guild)],
                        components: buildRolemenuComponents(db, message.guild)
                    }).catch(() => null);
                }
                if (val === "6") {
                    await interaction.deferUpdate().catch(() => null);
                    const roleRow = new ActionRowBuilder().addComponents(
                        new RoleSelectMenuBuilder()
                            .setCustomId("rolemenu_req_roles_select")
                            .setPlaceholder("Veuillez choisir les rôles requis")
                            .setMinValues(0)
                            .setMaxValues(25)
                    );
                    return msg.edit({ components: [roleRow] }).catch(() => null);
                }
                if (val === "7") {
                    await interaction.deferUpdate().catch(() => null);
                    const roleRow = new ActionRowBuilder().addComponents(
                        new RoleSelectMenuBuilder()
                            .setCustomId("rolemenu_bl_roles_select")
                            .setPlaceholder("Veuillez choisir les rôles interdits")
                            .setMinValues(0)
                            .setMaxValues(25)
                    );
                    return msg.edit({ components: [roleRow] }).catch(() => null);
                }
                if (val === "8") cfg.style = "Réactions";
                if (val === "9") cfg.style = "Boutons";
                if (val === "10") cfg.style = "Sélecteur";
                if (val === "11") cfg.type = "Donner/Retirer";
                if (val === "12") cfg.type = "Retirer";
                if (val === "13") cfg.type = "Donner";

                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildRolemenuEmbed(db, message.guild)],
                    components: buildRolemenuComponents(db, message.guild)
                }).catch(() => null);
            }

            if (interaction.customId === "rolemenu_delete") {
                cfg.options = [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildRolemenuEmbed(db, message.guild)],
                    components: buildRolemenuComponents(db, message.guild)
                }).catch(() => null);
            }

            if (interaction.customId === "rolemenu_validate") {
                await interaction.deferUpdate().catch(() => null);
                const targetChannel = cfg.channelId ? message.guild.channels.cache.get(cfg.channelId) : message.channel;
                if (targetChannel) {
                    const embedRolemenu = new EmbedBuilder()
                        .setTitle("Rôles")
                        .setDescription("Sélectionnez vos rôles ci-dessous")
                        .setColor(parseColor(db.color));

                    if (cfg.style === "Sélecteur") {
                        const sel = new StringSelectMenuBuilder()
                            .setCustomId("rolemenu_user_select")
                            .setPlaceholder("Choisir un rôle...")
                            .setMaxValues(cfg.multiple ? Math.min(cfg.options.length, 25) : 1)
                            .addOptions(cfg.options.slice(0, 25).map((o, idx) => ({
                                label: o.text || (o.roleId && message.guild.roles.cache.get(o.roleId)?.name) || `Rôle ${idx + 1}`,
                                description: o.description || undefined,
                                value: o.roleId || `role_${idx}`,
                                emoji: o.emoji ? { name: o.emoji } : undefined
                            })));
                        await targetChannel.send({ embeds: [embedRolemenu], components: [new ActionRowBuilder().addComponents(sel)] }).catch(() => null);
                    } else if (cfg.style === "Boutons") {
                        const styleMap = {
                            "Bleu": ButtonStyle.Primary,
                            "Gris": ButtonStyle.Secondary,
                            "Vert": ButtonStyle.Success,
                            "Rouge": ButtonStyle.Danger
                        };
                        const buttons = cfg.options.slice(0, 5).map((o, idx) => {
                            const b = new ButtonBuilder()
                                .setCustomId(`rolemenu_btn_${o.roleId || idx}`)
                                .setLabel(o.text || (o.roleId && message.guild.roles.cache.get(o.roleId)?.name) || `Rôle ${idx + 1}`)
                                .setStyle(styleMap[o.color] || ButtonStyle.Secondary);
                            if (o.emoji) b.setEmoji(o.emoji);
                            return b;
                        });
                        if (buttons.length > 0) {
                            await targetChannel.send({ embeds: [embedRolemenu], components: [new ActionRowBuilder().addComponents(buttons)] }).catch(() => null);
                        }
                    }
                }
                return message.channel.send("Rolemenu validé et envoyé avec succès !");
            }
        });
    }
};
