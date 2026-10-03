const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    Client,
    ContainerBuilder,
    Message,
    MessageFlags,
    ModalBuilder,
    RoleSelectMenuBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");
const ms = require("ms");

/**
 * Reproduction de `+join settings` d'après le panneau réel du bot cible
 * (Components V2, message 1545488935973552149) et le relevé de ses modals
 * (analysis/commands/join_settings_modals.json).
 *
 * Les quatre boutons ✏ ouvrent un modal : `none` supprime un message, `0` lève
 * la limite de durée ou désactive la suppression automatique.
 * Le bouton 🔗 pose sa question dans le salon plutôt que dans un modal.
 * Les bascules et les sélecteurs écrivent directement.
 */

// Espace de largeur nulle, utilisé par le bot cible devant les émojis d'état.
const ZWSP = "​";

const SECURITY = {
    CAPTCHA: 1,
    VERIFICATION: 2,
    NONE: 3
};

const SECURITY_LABELS = {
    [SECURITY.CAPTCHA]: "Captcha",
    [SECURITY.VERIFICATION]: "Vérification",
    [SECURITY.NONE]: "Pas de sécurité"
};

// Salons acceptés par les sélecteurs du panneau : textuel, annonces, forum.
const TEXT_CHANNELS = [ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread];

function parseColor(color) {
    if (color === null || color === undefined) return 0xff0000;
    if (typeof color === "number") return color;

    const parsed = parseInt(String(color).replace("#", ""), 16);
    return Number.isNaN(parsed) ? 0xff0000 : parsed;
}

/**
 * Compléter la configuration d'arrivée sans casser les commandes déjà enregistrées.
 * Les champs lus à l'exécution par `utiles/joinWelcome.js` et `events/Server Config/`
 * gardent leur nom : actif, message, channel, dm, dmactif, ghostping, ghostchannels, autorole.
 */
function ensureJoinDb(db) {
    const settings = db.joinsettings ??= {};

    settings.security ??= SECURITY.NONE;
    settings.duration ??= "5m";
    settings.logChannel ??= null;

    settings.autorole ??= [];
    if (!Array.isArray(settings.autorole)) settings.autorole = [settings.autorole].filter(Boolean);
    // Ancien champ à valeur unique, conservé aligné sur le premier rôle.
    settings.memberRole ??= settings.autorole[0] ?? null;

    settings.afterSecur ??= false;
    settings.message ??= null;
    settings.channel ??= null;
    settings.autodel ??= false;
    settings.dm ??= null;
    settings.customCommand ??= null;

    settings.ghostchannels ??= [];
    settings.ghostping ??= settings.ghostchannels.length > 0;

    settings.actif ??= !!settings.message;
    settings.dmactif ??= !!settings.dm;

    settings.captcha ??= {};
    settings.captcha.duration ??= ms(settings.duration) || 300000;

    return settings;
}

function sectionWithButton(text, button) {
    return new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(text))
        .setButtonAccessory(button);
}

function editButton(customId, emoji = "✏") {
    return new ButtonBuilder()
        .setCustomId(customId)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji({ name: emoji });
}

/**
 * Panneau « Paramètre d'arrivée », rendu à l'identique du bot cible.
 */
function buildJoinPanel(db, guild) {
    const settings = ensureJoinDb(db);

    const securityRow = new ActionRowBuilder();
    for (const [value, label, emoji] of [
        [SECURITY.VERIFICATION, "Vérification", "✅"],
        [SECURITY.CAPTCHA, "Captcha", "✒"],
        [SECURITY.NONE, "Pas de sécurité", "❌"]
    ]) {
        const active = settings.security === value;
        securityRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`join:security:${value}`)
                .setStyle(active ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setLabel(label)
                .setEmoji({ name: emoji })
                .setDisabled(active)
        );
    }

    const container = new ContainerBuilder()
        .setAccentColor(parseColor(db.color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètre d'arrivée"))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**Sécurité**\n${SECURITY_LABELS[settings.security] ?? SECURITY_LABELS[SECURITY.NONE]}`
        ))
        .addActionRowComponents(securityRow)
        .addSectionComponents(sectionWithButton(
            `**Durée maximum**\n${settings.duration}`,
            editButton("join:duration")
        ))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Salon des logs de vérification**"))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId("join:logchannel")
                    .setPlaceholder("Salon des logs de vérification")
                    .setMinValues(0)
                    .setMaxValues(1)
                    .setChannelTypes(TEXT_CHANNELS)
                    .setDefaultChannels(settings.logChannel && guild.channels.cache.has(settings.logChannel)
                        ? [settings.logChannel]
                        : [])
            )
        )
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Rôle membre**"))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId("join:memberrole")
                    .setPlaceholder("Rôle membre")
                    .setMinValues(0)
                    .setMaxValues(25)
                    .setDefaultRoles(settings.autorole.filter(id => guild.roles.cache.has(id)))
            )
        )
        .addSectionComponents(sectionWithButton(
            "**Envoyer les messages de bienvenue après avoir passé la sécurité**",
            new ButtonBuilder()
                .setCustomId("join:aftersecur")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji({ name: settings.afterSecur ? "✅" : "❌" })
        ))
        .addSectionComponents(sectionWithButton(
            `**Message de bienvenue**\n${settings.message || "Aucun"}`,
            editButton("join:message")
        ))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Salon du message de bienvenue**"))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId("join:channel")
                    .setPlaceholder("Salon du message de bienvenue")
                    .setMinValues(0)
                    .setMaxValues(1)
                    .setChannelTypes(TEXT_CHANNELS)
                    .setDefaultChannels(settings.channel && guild.channels.cache.has(settings.channel)
                        ? [settings.channel]
                        : [])
            )
        )
        .addSectionComponents(sectionWithButton(
            `**Supprimer le message de bienvenue automatiquement**\n${ZWSP}${settings.autodel || "❌"}`,
            editButton("join:autodel")
        ))
        .addSectionComponents(sectionWithButton(
            `**MP de bienvenue**\n${settings.dm || "Aucun"}`,
            editButton("join:dm")
        ))
        .addSectionComponents(sectionWithButton(
            `**Commande custom d'arrivée**\n${settings.customCommand ? `\`${settings.customCommand}\`` : "Aucune"}`,
            editButton("join:custom", "🔗")
        ))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Salons du ghost ping**"))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId("join:ghost")
                    .setPlaceholder("Salons du ghost ping")
                    .setMinValues(0)
                    .setMaxValues(25)
                    .setChannelTypes(TEXT_CHANNELS)
                    .setDefaultChannels(settings.ghostchannels.filter(id => guild.channels.cache.has(id)))
            )
        );

    return [container];
}

/**
 * Champs saisis par modal. `none` supprime la valeur.
 */
const MODAL_FIELDS = {
    "join:duration": {
        title: "Durée maximum",
        label: "Durée (0 pour illimité)",
        style: TextInputStyle.Short,
        maxLength: 4000
    },
    "join:message": {
        title: "Message de bienvenue",
        label: "Message, ou 'none' pour le supprimer",
        style: TextInputStyle.Paragraph,
        maxLength: 2000
    },
    "join:autodel": {
        title: "Suppression automatique",
        label: "Délai avant suppression (0 = jamais)",
        style: TextInputStyle.Short,
        maxLength: 4000
    },
    "join:dm": {
        title: "MP de bienvenue",
        label: "Message, ou 'none' pour le supprimer",
        style: TextInputStyle.Paragraph,
        maxLength: 2000
    },
};

// Le bouton 🔗 ne passe pas par un modal : le bot pose la question dans le salon.
const CUSTOM_COMMAND_QUESTION =
    "Quelle commande custom doit être exécutée quand un membre arrive ? " +
    "(envoie son mot-clé, ou n'importe quoi d'autre pour revenir aux messages classiques)";

/**
 * Appliquer une saisie de modal. `none` (ou un champ vide) supprime la valeur ;
 * une durée invalide est ignorée plutôt qu'enregistrée telle quelle.
 */
function applyModalValue(settings, customId, input) {
    const raw = String(input ?? '').trim();
    const cleared = raw.toLowerCase() === 'none';

    switch (customId) {
        // « Durée (0 pour illimité) » : 0 lève la limite, une durée invalide est ignorée.
        case "join:duration": {
            if (raw === '0') {
                settings.duration = "0";
                settings.captcha.duration = 0;
            } else if (ms(raw)) {
                settings.duration = raw;
                settings.captcha.duration = ms(raw);
            }
            break;
        }

        case "join:message":
            if (cleared) settings.message = null;
            else if (raw) settings.message = raw;
            settings.actif = !!settings.message;
            break;

        // « Délai avant suppression (0 = jamais) »
        case "join:autodel":
            settings.autodel = raw === '0' || cleared || !ms(raw) ? false : raw;
            break;

        case "join:dm":
            if (cleared) settings.dm = null;
            else if (raw) settings.dm = raw;
            settings.dmactif = !!settings.dm;
            break;
    }

    return settings;
}

/**
 * Réponse à la question du bouton 🔗 : un mot-clé inconnu ramène aux messages classiques.
 */
function applyCustomCommand(settings, input, db = {}) {
    const keyword = String(input ?? '').trim().toLowerCase();
    settings.customCommand = keyword && db.customs?.[keyword] ? keyword : null;
    return settings;
}

function buildModal(customId) {
    const field = MODAL_FIELDS[customId];

    // Le bot cible n'affiche ni placeholder ni valeur courante dans ses modals.
    const input = new TextInputBuilder()
        .setCustomId("value")
        .setLabel(field.label.slice(0, 45))
        .setStyle(field.style)
        .setRequired(true)
        .setMaxLength(field.maxLength);

    return new ModalBuilder()
        .setCustomId(`${customId}:modal`)
        .setTitle(field.title.slice(0, 45))
        .addComponents(new ActionRowBuilder().addComponents(input));
}

module.exports = {
    name: "join",
    description: "Affiche le panneau de paramétrage des arrivées",
    category: "Configuration du serveur",
    argument: "settings",
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
    async execute(client, message, args, guildData) {
        const db = guildData || client.get(message.guildId);
        const settings = ensureJoinDb(db);
        client.save(message.guildId);

        const panel = await message.channel.send({
            components: buildJoinPanel(db, message.guild),
            flags: MessageFlags.IsComponentsV2
        });

        const refresh = () => panel.edit({
            components: buildJoinPanel(db, message.guild),
            flags: MessageFlags.IsComponentsV2
        }).catch(() => null);

        const save = () => client.save(message.guildId);

        const collector = panel.createMessageComponentCollector({ time: 15 * 60 * 1000 });

        collector.on("collect", async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 }).catch(() => null);
            }

            const id = interaction.customId;

            // ---- champs saisis par modal ----
            if (MODAL_FIELDS[id]) {
                await interaction.showModal(buildModal(id)).catch(() => null);

                const submitted = await interaction.awaitModalSubmit({
                    time: 5 * 60 * 1000,
                    filter: modal => modal.customId === `${id}:modal` && modal.user.id === message.author.id
                }).catch(() => null);

                if (!submitted) return;
                await submitted.deferUpdate().catch(() => null);

                applyModalValue(settings, id, submitted.fields.getTextInputValue("value"));
                save();
                return refresh();
            }

            await interaction.deferUpdate().catch(() => null);

            // ---- commande custom liée : question posée dans le salon ----
            if (id === "join:custom") {
                const prompt = await message.channel.send(CUSTOM_COMMAND_QUESTION).catch(() => null);
                const answers = await message.channel.awaitMessages({
                    filter: entry => entry.author.id === message.author.id,
                    max: 1,
                    time: 120000
                });

                prompt?.delete().catch(() => null);

                const answer = answers.first();
                if (answer) {
                    applyCustomCommand(settings, answer.content, db);
                    answer.delete().catch(() => null);
                    save();
                }

                return refresh();
            }

            // ---- bascules et sélecteurs ----
            if (id.startsWith("join:security:")) {
                settings.security = parseInt(id.split(":")[2], 10);
                settings.captcha.enabled = settings.security === SECURITY.CAPTCHA;
                save();
                return refresh();
            }

            if (id === "join:aftersecur") {
                settings.afterSecur = !settings.afterSecur;
                save();
                return refresh();
            }

            if (id === "join:logchannel") {
                settings.logChannel = interaction.values[0] ?? null;
                save();
                return refresh();
            }

            if (id === "join:memberrole") {
                settings.autorole = interaction.values;
                settings.memberRole = interaction.values[0] ?? null;
                save();
                return refresh();
            }

            if (id === "join:channel") {
                settings.channel = interaction.values[0] ?? null;
                save();
                return refresh();
            }

            if (id === "join:ghost") {
                settings.ghostchannels = interaction.values;
                settings.ghostping = interaction.values.length > 0;
                save();
                return refresh();
            }
        });

        collector.on("end", () => {
            panel.edit({
                components: buildJoinPanel(db, message.guild),
                flags: MessageFlags.IsComponentsV2
            }).catch(() => null);
        });
    },

    // Exposé pour la vérification hors ligne.
    views: { ensureJoinDb, buildJoinPanel, buildModal, applyModalValue, applyCustomCommand, MODAL_FIELDS, CUSTOM_COMMAND_QUESTION }
};
