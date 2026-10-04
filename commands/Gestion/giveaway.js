const { Client, Message, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChannelSelectMenuBuilder, RoleSelectMenuBuilder } = require("discord.js");
const ms = require("ms");

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

function ensureGiveawayDb(db) {
    db.giveawaySettings ??= {
        gain: "None",
        duration: "10h",
        durationMs: 36000000,
        channel: null,
        emoji: "🎉",
        buttonText: "Aucun",
        buttonColor: "⚪",
        winners: 1,
        voiceRequired: false,
        reqRoles: [],
        banRoles: [],
        reqServers: [],
        imposedWinners: [],
        mode: "bouton" // "bouton" or "reaction"
    };
}

function buildGiveawayEmbed(db, guild) {
    ensureGiveawayDb(db);
    const gs = db.giveawaySettings;
    const color = parseColor(db.color);

    const endTimestamp = Math.floor((Date.now() + (gs.durationMs || 36000000)) / 1000);
    const dureeVal = `${gs.duration || "10 heures"}\n<t:${endTimestamp}>`;

    const gainVal = gs.gain || "None";
    const channelVal = gs.channel && guild.channels.cache.has(gs.channel) ? `<#${gs.channel}>` : "Aucun";
    const emojiVal = gs.emoji || "​🎉";
    const buttonTextVal = gs.buttonText || "Aucun";
    const buttonColorVal = gs.buttonColor || "⚪";
    const winnersVal = String(gs.winners || 1);
    const voiceVal = gs.voiceRequired ? "​✅" : "​❌";

    const reqRolesVal = Array.isArray(gs.reqRoles) && gs.reqRoles.filter(id => guild.roles.cache.has(id)).length > 0
        ? gs.reqRoles.filter(id => guild.roles.cache.has(id)).map(id => `<@&${id}>`).join(', ')
        : "Aucun";

    const banRolesVal = Array.isArray(gs.banRoles) && gs.banRoles.filter(id => guild.roles.cache.has(id)).length > 0
        ? gs.banRoles.filter(id => guild.roles.cache.has(id)).map(id => `<@&${id}>`).join(', ')
        : "Aucun";

    const reqServersVal = Array.isArray(gs.reqServers) && gs.reqServers.length > 0
        ? gs.reqServers.join(', ')
        : "Aucun";

    const imposedVal = Array.isArray(gs.imposedWinners) && gs.imposedWinners.length > 0
        ? gs.imposedWinners.map(id => `<@${id}>`).join(', ')
        : "Aucun";

    return new EmbedBuilder()
        .setTitle("Paramètre du giveaway")
        .setColor(color)
        .setFooter({ text: db.footer || "ζ͜͡Crow Bots" })
        .addFields(
            { name: "Gain", value: gainVal, inline: true },
            { name: "Durée", value: dureeVal, inline: true },
            { name: "Salon", value: channelVal, inline: true },
            { name: "Emoji", value: emojiVal, inline: true },
            { name: "Texte du bouton", value: buttonTextVal, inline: true },
            { name: "Couleur du bouton", value: buttonColorVal, inline: true },
            { name: "Nombre de gagnants", value: winnersVal, inline: true },
            { name: "Présence en voc obligatoire", value: voiceVal, inline: true },
            { name: "Rôles requis", value: reqRolesVal, inline: true },
            { name: "Rôles interdits", value: banRolesVal, inline: true },
            { name: "Serveurs requis", value: reqServersVal, inline: true },
            { name: "Gagnants imposés", value: imposedVal, inline: true }
        );
}

function buildGiveawayComponents(db) {
    ensureGiveawayDb(db);
    const gs = db.giveawaySettings;

    const row0 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("giveaway_settings_menu")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                { label: "Modifier le gain", value: "1", emoji: { name: "🎁" } },
                { label: "Modifier la durée", value: "2", emoji: { name: "🕙" } },
                { label: "Modifier le salon", value: "3", emoji: { name: "🏷" } },
                { label: "Modifier le nombre de gagnant", value: "4", emoji: { name: "👥" } },
                { label: "Modifier l'émoji", value: "5", emoji: { name: "🎉" } },
                { label: "Modifier le texte du bouton", value: "11", emoji: { name: "✏" } },
                { label: "Modifier la couleur du bouton", value: "12", emoji: { name: "🔴" } },
                { label: "Modifier l'obligation d'être en vocal", value: "6", emoji: { name: "🔊" } },
                { label: "Modifier les rôles requis", value: "7", emoji: { name: "⛓" } },
                { label: "Modifier les rôles interdits", value: "8", emoji: { name: "🚫" } },
                { label: "Modifier les serveurs requis", value: "9", emoji: { name: "🔑" } },
                { label: "Modifier les gagnants imposés", value: "10", emoji: { name: "🕵" } }
            ])
    );

    const modeLabel = gs.mode === "reaction" ? "Passer en mode bouton" : "Passer en mode réaction";

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("giveaway_validate")
            .setStyle(ButtonStyle.Success)
            .setLabel("Valider"),
        new ButtonBuilder()
            .setCustomId("giveaway_toggle_mode")
            .setStyle(ButtonStyle.Secondary)
            .setLabel(modeLabel)
    );

    return [row0, row1];
}

module.exports = {
    name: "giveaway",
    description: "Envoie un panel pour créer un giveaway",
    category: "Gestion",
    argument: "[reroll/list/pause/unpause/end] [ID]",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        ensureGiveawayDb(db);

        if (args[0] === "end") {
            return client.giveawaysManager.end(args[1], {
                messages: {
                    congrat: `🎉 Bien joué {winners}! Vous avez gagné **{this.prize}**!`,
                    error: 'Il n\'y a pas assez de participants pour faire un reroll'
                }
            }).catch(() => message.channel.send(`Aucun giveaway de trouvé avec comme ID \`${args[1] || "rien"}\``));
        }

        if (args[0] === "pause") {
            return client.giveawaysManager.pause(args[1], { infiniteDurationText: "JAMAIS" })
                .then(() => message.channel.send(`Le giveaway avec comme ID \`${args[1] ?? "rien"}\` a été mis en pause`))
                .catch(() => message.channel.send(`Aucun giveaway de trouvé avec comme ID \`${args[1] || "rien"}\``));
        }

        if (args[0] === "unpause") {
            return client.giveawaysManager.unpause(args[1])
                .then(() => message.channel.send(`Le giveaway avec comme ID \`${args[1] ?? "rien"}\` a été remis en marche`))
                .catch(() => message.channel.send(`Aucun giveaway en pause de trouvé avec comme ID \`${args[1] || "rien"}\``));
        }

        if (args[0] === "list") {
            let description = "";
            const giveaways = (client.giveawaysManager?.giveaways || []).filter(g => g.guildId === message.guild.id && !g.ended);
            await Promise.all(giveaways.map(async (x, i) => {
                description += `${i + 1}・[\`${x.prize}\`](https://discord.com/channels/${x.guildId}/${x.channelId}/${x.messageId}) (<t:${((x.endAt) / 1000).toFixed(0)}:R>)\n`;
            }));

            const embed = new EmbedBuilder()
                .setTitle('Liste des giveaways du serveur')
                .setColor(parseColor(db.color))
                .setDescription(description === "" ? "Aucun giveaway" : description);

            return message.channel.send({ embeds: [embed] });
        }

        const embed = buildGiveawayEmbed(db, message.guild);
        const components = buildGiveawayComponents(db);

        const msg = await message.channel.send({ embeds: [embed], components });
        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 15 * 60 * 1000
        });

        collector.on('end', () => msg.edit({ components: [] }).catch(() => null));

        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 });
            }

            const gs = db.giveawaySettings;

            if (interaction.customId === "giveaway_toggle_mode") {
                gs.mode = gs.mode === "reaction" ? "bouton" : "reaction";
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (interaction.customId === "giveaway_channel_select") {
                gs.channel = interaction.values[0] || null;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (interaction.customId === "giveaway_req_roles") {
                gs.reqRoles = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (interaction.customId === "giveaway_ban_roles") {
                gs.banRoles = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (interaction.customId === "giveaway_validate") {
                await interaction.deferUpdate().catch(() => null);
                const targetChannel = gs.channel ? message.guild.channels.cache.get(gs.channel) : message.channel;
                if (!targetChannel?.isTextBased?.()) return message.channel.send("Salon invalide pour le giveaway.");

                const prize = gs.gain && gs.gain !== "None" ? gs.gain : "Giveaway";
                const duration = gs.durationMs || ms("10h") || 36000000;

                try {
                    await client.giveawaysManager.start(targetChannel, {
                        prize,
                        duration,
                        winnerCount: gs.winners || 1,
                        hostedBy: message.author,
                        reaction: gs.mode === "reaction" ? (gs.emoji || "🎉") : (gs.emoji || "🎉"),
                        messages: {
                            giveaway: gs.mode === "bouton" && gs.buttonText && gs.buttonText !== "Aucun"
                                ? `🎉 ${gs.buttonText} 🎉`
                                : undefined,
                            inviteToParticipate: `Réagissez avec ${gs.emoji || "🎉"} pour participer !`,
                            embedColor: parseColor(db.color),
                            winMessage: `🎉 Félicitations {winners} ! Vous avez gagné **{this.prize}** !`,
                            noWinner: "Giveaway annulé, aucun participant valide.",
                            hostedBy: `Organisé par : {this.hostedBy}`,
                            winners: "Gagnant(s)",
                            endedAt: "Terminé le",
                        },
                    });
                    return message.channel.send(`Le giveaway a été lancé dans ${targetChannel} !`);
                } catch (err) {
                    console.error("[giveaway]", err);
                    return message.channel.send("Impossible de lancer le giveaway (vérifiez les permissions du bot).");
                }
            }

            const val = interaction.values?.[0];

            if (val === "1") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Quel sera le nouveau gain du giveaway ?");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id && m.channelId === message.channelId, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    gs.gain = resp.content.trim();
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (val === "2") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Quelle sera la durée du giveaway ? (ex: `10h`, `1d`)");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id && m.channelId === message.channelId, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    const txt = resp.content.trim();
                    const parsed = ms(txt);
                    if (parsed) {
                        gs.duration = txt;
                        gs.durationMs = parsed;
                        client.save(message.guildId);
                    }
                    resp.delete().catch(() => null);
                }
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (val === "3") {
                await interaction.deferUpdate().catch(() => null);
                const channelRow = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("giveaway_channel_select")
                        .setChannelTypes([ChannelType.GuildText, ChannelType.GuildAnnouncement])
                        .setPlaceholder("Veuillez choisir un salon")
                        .setMinValues(1)
                        .setMaxValues(1)
                );
                return msg.edit({ components: [channelRow] }).catch(() => null);
            }

            if (val === "4") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Combien de gagnants pour le giveaway ?");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id && m.channelId === message.channelId, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    const num = parseInt(resp.content.trim(), 10);
                    if (!isNaN(num) && num > 0) {
                        gs.winners = num;
                        client.save(message.guildId);
                    }
                    resp.delete().catch(() => null);
                }
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (val === "5") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Quel émoji utiliser pour le giveaway ?");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id && m.channelId === message.channelId, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    gs.emoji = resp.content.trim();
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (val === "11") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Quel sera le texte du bouton ? (ou `none`)");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id && m.channelId === message.channelId, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    const txt = resp.content.trim();
                    gs.buttonText = txt.toLowerCase() === "none" ? "Aucun" : txt;
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (val === "12") {
                gs.buttonColor = gs.buttonColor === "⚪" ? "🔴" : (gs.buttonColor === "🔴" ? "🟢" : (gs.buttonColor === "🟢" ? "🔵" : "⚪"));
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (val === "6") {
                gs.voiceRequired = !gs.voiceRequired;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (val === "7") {
                await interaction.deferUpdate().catch(() => null);
                const roleRow = new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("giveaway_req_roles")
                        .setPlaceholder("Veuillez choisir les rôles requis")
                        .setMinValues(0)
                        .setMaxValues(25)
                );
                return msg.edit({ components: [roleRow] }).catch(() => null);
            }

            if (val === "8") {
                await interaction.deferUpdate().catch(() => null);
                const roleRow = new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("giveaway_ban_roles")
                        .setPlaceholder("Veuillez choisir les rôles interdits")
                        .setMinValues(0)
                        .setMaxValues(25)
                );
                return msg.edit({ components: [roleRow] }).catch(() => null);
            }

            if (val === "9") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Envoyez les IDs ou liens d'invitation des serveurs requis (séparés par un espace, ou `none`)");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id && m.channelId === message.channelId, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    const txt = resp.content.trim();
                    gs.reqServers = txt.toLowerCase() === "none" ? [] : txt.split(/\s+/);
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }

            if (val === "10") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Mentionnez ou envoyez l'ID des membres imposés comme gagnants (ou `none`)");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id && m.channelId === message.channelId, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    const txt = resp.content.trim();
                    if (txt.toLowerCase() === "none") {
                        gs.imposedWinners = [];
                    } else {
                        const mentions = resp.mentions.users.map(u => u.id);
                        gs.imposedWinners = mentions.length > 0 ? mentions : txt.split(/\s+/);
                    }
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return msg.edit({
                    embeds: [buildGiveawayEmbed(db, message.guild)],
                    components: buildGiveawayComponents(db)
                }).catch(() => null);
            }
        });
    }
};
