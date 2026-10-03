const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    Client,
    ContainerBuilder,
    EmbedBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    Message,
    MessageFlags,
    RoleSelectMenuBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    StringSelectMenuBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    UserSelectMenuBuilder
} = require("discord.js");
const ms = require("ms");

/**
 * Reproduction de `+custom <mot-clé>` relevée sur le bot cible par la sonde
 * `analyzer/customProbe.js`. Chaque écran, chaque libellé et chaque question texte
 * viennent de `analysis/custom/probe_spec.txt` (49 écrans relevés) et de la section
 * `custom` du fichier de langue du bot cible (`analysis/custom/target_strings.yml`).
 */

// Espace de largeur nulle : le bot cible s'en sert pour afficher un texte vide.
const EMPTY = "​";

const MAX_MESSAGES = 10;
const MAX_EMBEDS = 10;
const MAX_STICKERS = 3;
const MAX_FORM_FIELDS = 5;
const MAX_ADVANCED_ITEMS = 40;

// Modes d'envoi de la réponse, dans l'ordre des boutons du panneau principal.
const CHANNEL_MODES = [
    { value: 0, label: "Là où la commande est faite" },
    { value: 1, label: "Message privé" },
    { value: 2, label: "Salon fixé" },
    { value: 3, label: "Salon distant" }
];

// Le bot cible tire au sort l'émoji du module Réactions à chaque rendu du panneau :
// les six variantes ci-dessous sont celles relevées par la sonde.
const REACTION_EMOJIS = ["😄", "🙂", "😂", "😌", "😉", "🙃"];

function moduleOptions() {
    return MODULE_OPTIONS.map(option => option.value === "Reactions"
        ? { ...option, emoji: { name: REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)] } }
        : option);
}

const MODULE_OPTIONS = [
    { label: "Messages", value: "Messages", emoji: { name: "💬" } },
    { label: "Embeds", value: "Embeds", emoji: { name: "🗳" } },
    { label: "Stickers", value: "Stickers", emoji: { name: "🎴" } },
    { label: "Modification des rôles", value: "Roles", emoji: { name: "📥" } },
    { label: "Filtration des utilisateurs/rôles", value: "UserFilter", emoji: { name: "⚖" } },
    { label: "Réactions", value: "Reactions", emoji: { name: "😄" } },
    { label: "Cooldown", value: "Cooldown", emoji: { name: "🕑" } },
    { label: "Boutons/sélecteurs", value: "Components", emoji: { name: "⏺" } },
    { label: "Composants avancés", value: "AdvancedComponents", emoji: { name: "💠" } },
    { label: "Formulaire", value: "Form", emoji: { name: "📋" } }
];

const ADVANCED_TYPES = [
    { label: "ActionRow", value: "ActionRow", description: "Un sélecteur ou une ligne de bouton" },
    { label: "Container", value: "Container", description: "Un mini embed" },
    { label: "Section", value: "Section", description: "Du texte aligné sur une image ou un bouton" },
    { label: "Separator", value: "Separator", description: "Une ligne de séparation horizontal" },
    { label: "MediaGallery", value: "MediaGallery", description: "Un goupe d'image" },
    { label: "TextDisplay", value: "TextDisplay", description: "Une ligne de texte" }
];

const BUTTON_COLORS = [
    { label: "Bleu", value: "blue", style: ButtonStyle.Primary },
    { label: "Gris", value: "gray", style: ButtonStyle.Secondary },
    { label: "Vert", value: "green", style: ButtonStyle.Success },
    { label: "Rouge", value: "red", style: ButtonStyle.Danger }
];

const LINKED_ACTIVATIONS = [
    { label: "Modification du message", value: "edit" },
    { label: "Envoie d'un message visible", value: "visible" },
    { label: "Envoie d'un message invisible", value: "invisible" }
];

const FORM_FIELD_TYPES = [
    { label: "Texte court", value: "short" },
    { label: "Texte long", value: "long" },
    { label: "Liste de choix", value: "choice" }
];

// Questions posées par le bot cible avant chaque saisie texte.
const ASK = {
    keyword: "Envoyez le nouveau mot-clé pour cette commande",
    keywordUsed: "Ce mot-clé est déjà utilisé par une autre commande",
    channel: "Dans quel salon doit-être envoyé la commande ?",
    logchannel: "Dans quels salons doivent être envoyé les logs de cette commande ?",
    deleteAnswer: "Au bout de combien de temps faut il supprimer la réponse du bot ?",
    message: "Envoyez le nouveau message de cette commande",
    sticker: "Envoyez le sticker de la commande *(le bot doit se trouver sur le serveur du sticker)*",
    reactionCommand: "Quel sont les émojis à ajouter sur le message de commande ?",
    reactionAnswer: "Quel sont les émojis à ajouter sur la réponse du bot ?",
    cooldownUser: "Quel est le cooldown par utilisateur de cette commande ?",
    cooldownGlobal: "Quel est le cooldown global de cette commande ?",
    cooldownLimit: "Le cooldown utilisateur ne peut pas être inférieur à 2 secondes pour éviter les spams",
    buttonText: "Envoyez le texte de ce button",
    buttonEmoji: "Envoyez l'émoji de ce bouton",
    buttonUrl: "Envoyez l'URL de ce bouton",
    buttonPosition: "Envoyez la nouvelle position de ce bouton",
    buttonLinked: "Envoyez la commande liée à ce bouton",
    selectPlaceholder: "Envoyez le placeholder du sélecteur",
    optionText: "Envoyez le texte de cette option",
    optionDescription: "Envoyez la description de cette option",
    optionEmoji: "Envoyez l'émoji de cette option",
    optionPosition: "Envoyez la nouvelle position de ce bouton",
    optionLinked: "Envoyez la commande liée à cette option",
    containerColor: "Envoyez la couleur du container",
    galleryImage: "Envoyez l'image à ajouter",
    thumbnail: "Envoyez l'image du thumbnail",
    textDisplay: "Envoyez le texte affiché",
    formTitle: "Envoyez le titre du formulaire",
    formFieldTitle: "Envoyez le titre de ce champ",
    formFieldKey: "Envoyez le nom de la variable de ce champ",
    formFieldPlaceholder: "Envoyez le placeholder de ce champ",
    formFieldEmpty: "Que faut-il afficher si la réponse est vide ?",
    formFieldMin: "Quelle est la longueur minimum de la réponse ?",
    formFieldMax: "Quelle est la longueur maximum de la réponse ?",
    formFieldDefault: "Quelle est la valeur par défaut de ce champ ?",
    embedTitle: "Quel est le **titre** de l'embed ?",
    embedDescription: "Quelle est la **description** de l'embed ?",
    embedAuthor: "Quel est le nom de l'**auteur** de l'embed ?",
    embedFooter: "Quel est le **footer** de l'embed ?",
    embedThumbnail: "Quel est le **thumbnail** de l'embed ?",
    embedImage: "Quelle est l'**image** de l'embed ?",
    embedUrl: "Quelle est l'**url** de l'embed ?",
    embedColor: "Quel est la **couleur** de l'embed ?",
    embedFieldTitle: "Quel est le **titre** du field ?",
    embedFieldDescription: "Quel est la **description** du field ?",
    embedFieldDelete: "Quel est le numéro du field à supprimer ?",
    embedCopy: "Envoyez l'ID du message à copier"
};

// Descriptions d'en-tête des modules, relevées mot pour mot.
const MODULE_HEADERS = {
    messages: "## Module Messages\nEnvoie un message dans le salon sélectionné, si plusieurs messages sont enregistrés, un message est sélectionné au hasard",
    embeds: "## Module Embeds\nEnvoie un embed dans le salon sélectionné, si plusieurs embeds sont enregistrés, un embed est sélectionné au hasard",
    stickers: "## Module Stickers\nEnvoie un sticker dans le salon sélectionné, si plusieurs stickers sont enregistrés, un sticker est sélectionné au hasard",
    roles: "## Module Roles\nModifie les rôles de la personne ciblé par la commande",
    userFilter: "## Filtration des utilisateurs/rôles\nFiltre qui peut déclencher cette commande custom",
    reactions: "## Module réactions\nAjoute des réactions sur la commande ou sur la réponse du bot (incompatible avec la suppression automatique)",
    components: "## Module boutons/sélecteurs\nPermet d'ajouter des boutons ou des sélecteurs déclenchant des actions sur la réponse du bot",
    advanced: "## Components avancés\nCe module permet de créer des components et des embeds plus complexes\nQuand ce module est activé, les modules Messages, Embeds, Stickers et Boutons/sélecteurs sont désactivés",
    form: "## Module Formulaire\nOuvre un formulaire avant de répondre. Les réponses deviennent des variables {Form.key} dans les messages, embeds et composants de cette commande."
};

// ----------------------------------------------------------------------------
// OUTILS
// ----------------------------------------------------------------------------

function parseColor(color) {
    if (color === null || color === undefined) return 0xff0000;
    if (typeof color === "number") return color;

    const parsed = parseInt(String(color).replace("#", ""), 16);
    return Number.isNaN(parsed) ? 0xff0000 : parsed;
}

function orEmpty(text) {
    const value = String(text ?? "").trim();
    return value.length > 0 ? value : EMPTY;
}

function truncate(text, max = 80) {
    const value = String(text ?? "");
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function formatDuration(value) {
    if (!value) return "0s";
    return ms(value);
}

function parseDuration(input) {
    const raw = String(input ?? "").trim().toLowerCase();
    if (!raw || raw === "off" || raw === "0") return 0;

    const parsed = ms(raw);
    return typeof parsed === "number" && parsed > 0 ? parsed : null;
}

function toggleEmoji(state) {
    return { name: state ? "✅" : "❌" };
}

/**
 * Section « libellé + valeur » avec un bouton en accessoire : la brique de base
 * de tous les panneaux du bot cible.
 */
function sectionWithButton(text, button) {
    return new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(text))
        .setButtonAccessory(button);
}

function backRow({ deleteId = null, deleteLabel = "Supprimer", extra = [] } = {}) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("cst:back").setStyle(ButtonStyle.Primary).setLabel("Retour").setEmoji({ name: "↩" })
    );

    if (deleteId) {
        row.addComponents(
            new ButtonBuilder().setCustomId(deleteId).setStyle(ButtonStyle.Danger).setLabel(deleteLabel).setEmoji({ name: "🗑" })
        );
    }

    for (const button of extra) row.addComponents(button);
    return row;
}

/**
 * Rangée de boutons dont un seul est actif : l'actif prend le style plein et
 * devient inactivable, comme sur le bot cible.
 */
function choiceRow(entries, activeValue, customId) {
    const row = new ActionRowBuilder();

    for (const entry of entries) {
        const active = entry.value === activeValue;
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`${customId}:${entry.value}`)
                .setLabel(entry.label)
                .setStyle(entry.style ?? (active ? ButtonStyle.Primary : ButtonStyle.Secondary))
                .setDisabled(active)
        );
    }

    return row;
}

// ----------------------------------------------------------------------------
// MODELE DE DONNEES
// ----------------------------------------------------------------------------

/**
 * Complète une commande custom avec toutes les valeurs par défaut du bot cible.
 * Les noms de champs historiques sont conservés : `events/Client/messageCreate.js`
 * les lit à l'exécution et les commandes déjà enregistrées continuent de fonctionner.
 */
function normalizeCustom(record, key) {
    record ??= {};
    record.key = key ?? record.key ?? "cc";

    record.channelMode ??= 0;
    record.fixedChannel ??= null;
    record.targetMember ??= false;
    record.triggerByMessage ??= true;
    record.deleteCommand ??= false;
    record.deleteResponse ??= "off";
    record.logChannel ??= null;

    record.messages ??= [];
    record.embeds ??= [];
    record.stickers ??= [];
    record.rolesAdd ??= [];
    record.rolesRemove ??= [];

    record.reactions ??= {};
    record.reactions.command ??= [];
    record.reactions.response ??= [];

    record.cooldown ??= {};
    record.cooldown.user ??= 2000;
    record.cooldown.global ??= 0;
    record.cooldownState ??= { user: {}, global: 0 };

    // Anciens noms de la filtration (allowRoles/denyRoles/...) repris tels quels.
    const filter = record.userFilter ?? {};
    record.userFilter = {
        requiredRoles: filter.requiredRoles ?? filter.allowRoles ?? [],
        forbiddenRoles: filter.forbiddenRoles ?? filter.denyRoles ?? [],
        allowedUsers: filter.allowedUsers ?? filter.allowUsers ?? [],
        forbiddenUsers: filter.forbiddenUsers ?? filter.denyUsers ?? []
    };

    // messageCreate lit `custom.components` : les anciens tableaux à plat y sont repris.
    record.components ??= {};
    record.components.buttons ??= record.buttons ?? [];
    record.components.selects ??= record.selects ?? [];
    record.components.text ??= [];
    record.components.media ??= [];
    delete record.buttons;
    delete record.selects;

    record.advancedComponents ??= null;
    record.form ??= null;

    return record;
}

function defaultButton(position) {
    return {
        label: "",
        emoji: null,
        color: "gray",
        url: null,
        disabled: false,
        position,
        linked: null,
        activation: "edit"
    };
}

function defaultSelect() {
    return { placeholder: "", disabled: false, options: [] };
}

function defaultSelectOption(position) {
    return { label: "", description: "", emoji: null, position, linked: null };
}

function defaultFormField(index) {
    return {
        title: `Question ${index + 1}`,
        key: "question",
        type: "short",
        placeholder: "",
        required: false,
        empty: "-",
        minLength: 0,
        maxLength: 4000,
        default: "",
        options: []
    };
}

function defaultAdvancedItem(type) {
    switch (type) {
        case "ActionRow": return { type, items: [] };
        case "Container": return { type, color: null, components: [] };
        case "Section": return { type, text: "", accessory: { type: "button", label: "", url: null } };
        case "Separator": return { type, large: true, visible: true };
        case "MediaGallery": return { type, images: [] };
        case "TextDisplay": return { type, content: "" };
        default: return { type };
    }
}

/**
 * Localiser un composant avancé par son chemin d'index ([2] ou [2, 0] dans un Container).
 */
function advancedList(custom, path) {
    let list = custom.advancedComponents ?? [];

    for (const index of path.slice(0, -1)) {
        const item = list[index];
        if (!item) return null;
        item.components ??= [];
        list = item.components;
    }

    return list;
}

function advancedItem(custom, path) {
    if (!path.length) return null;
    const list = advancedList(custom, path);
    return list ? list[path[path.length - 1]] ?? null : null;
}

function countAdvanced(list) {
    let total = 0;
    for (const item of list ?? []) {
        total += 1;
        if (Array.isArray(item.components)) total += countAdvanced(item.components);
        if (Array.isArray(item.items)) total += item.items.length;
    }
    return total;
}

/**
 * Résumé d'un composant avancé, affiché dans la liste du module.
 */
function advancedSummary(item) {
    switch (item.type) {
        case "ActionRow": {
            const select = (item.items ?? []).find(entry => entry.kind === "select");
            if (select) return "Sélecteur";
            const buttons = (item.items ?? []).filter(entry => entry.kind === "button").length;
            return buttons === 1 ? "1 bouton" : `${buttons} boutons`;
        }
        case "Container": return `${countAdvanced(item.components)} élément(s)`;
        case "Section": return item.accessory?.type === "thumbnail" ? "(Thumbnail)" : "(Bouton)";
        case "Separator": return `${item.large ? "Large" : "Fin"}\n${item.visible ? "Visible" : "Invisible"}`;
        case "MediaGallery": {
            const total = (item.images ?? []).length;
            return total === 1 ? "1 image" : `${total} images`;
        }
        case "TextDisplay": return truncate(item.content || EMPTY, 60);
        default: return EMPTY;
    }
}

// ----------------------------------------------------------------------------
// PANNEAUX
// ----------------------------------------------------------------------------

function buildMainView(custom, color) {
    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètre de la commande custom"))
        .addSectionComponents(sectionWithButton(
            `**Mot-clé**\n${custom.key}`,
            new ButtonBuilder().setCustomId("cst:keyword").setStyle(ButtonStyle.Secondary).setLabel("Modifier le mot clé").setEmoji({ name: "✏" })
        ))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Salon**"));

    // En mode « Salon fixé », le sélecteur de salon s'insère au-dessus des modes.
    if (custom.channelMode === 2) {
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId("cst:fixedchannel")
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setChannelTypes([ChannelType.GuildText])
                    .setDefaultChannels(custom.fixedChannel ? [custom.fixedChannel] : [])
            )
        );
    }

    container
        .addActionRowComponents(choiceRow(
            CHANNEL_MODES.map(mode => ({ label: mode.label, value: mode.value })),
            custom.channelMode,
            "cst:mode"
        ))
        .addSectionComponents(
            sectionWithButton("**Cibler sur un autre membre**",
                new ButtonBuilder().setCustomId("cst:targetable").setStyle(ButtonStyle.Secondary).setEmoji(toggleEmoji(custom.targetMember))),
            sectionWithButton("**Peut être déclenchée par messages**",
                new ButtonBuilder().setCustomId("cst:usable").setStyle(ButtonStyle.Secondary).setEmoji(toggleEmoji(custom.triggerByMessage)).setDisabled(!!custom.form)),
            sectionWithButton("**Supprimer la commande**",
                new ButtonBuilder().setCustomId("cst:deltrigger").setStyle(ButtonStyle.Secondary).setEmoji(toggleEmoji(custom.deleteCommand))),
            sectionWithButton(`**Supprimer la réponse**\n${custom.deleteResponse}`,
                new ButtonBuilder().setCustomId("cst:delanswer").setStyle(ButtonStyle.Secondary).setEmoji({ name: "🕙" })),
            sectionWithButton("**Salon de logs**",
                new ButtonBuilder().setCustomId("cst:logchannel").setStyle(ButtonStyle.Secondary).setLabel("Modifier le salon de logs").setEmoji({ name: "📡" }))
        )
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId("cst:logselect")
                    .setMinValues(0)
                    .setMaxValues(1)
                    .setChannelTypes([ChannelType.GuildText])
                    .setDefaultChannels(custom.logChannel ? [custom.logChannel] : [])
            )
        )
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Modules**"))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("cst:modules")
                    .setPlaceholder("Gérer les modules")
                    .addOptions(moduleOptions())
            )
        );

    const bottom = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("cst:delete").setStyle(ButtonStyle.Danger).setEmoji({ name: "🗑" })
    );

    return [container, bottom];
}

/**
 * Les modules Messages, Embeds et Stickers partagent la même mise en page :
 * un en-tête avec un bouton « + », la liste des entrées, un sélecteur de suppression.
 */
function buildListModuleView(color, { header, entries, empty, addId, entryId, entryAccessory, render }) {
    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addSectionComponents(sectionWithButton(
            header,
            new ButtonBuilder().setCustomId(addId).setStyle(ButtonStyle.Primary).setEmoji({ name: "➕" })
        ));

    if (!entries.length) {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(empty));
    } else {
        entries.forEach((entry, index) => {
            const accessory = new ButtonBuilder().setCustomId(`${entryId}:${index}`);

            if (entryAccessory === "delete") accessory.setStyle(ButtonStyle.Danger).setEmoji({ name: "🗑" });
            else accessory.setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" });

            container.addSectionComponents(sectionWithButton(render(entry), accessory));
        });
    }

    return [container, backRow()];
}

function buildMessagesView(custom, color) {
    return buildListModuleView(color, {
        header: MODULE_HEADERS.messages,
        entries: custom.messages,
        empty: "Aucun message enregistré",
        addId: "cst:msg:add",
        entryId: "cst:msg:del",
        entryAccessory: "delete",
        render: entry => truncate(entry, 200) || EMPTY
    });
}

function buildEmbedsView(custom, color) {
    return buildListModuleView(color, {
        header: MODULE_HEADERS.embeds,
        entries: custom.embeds,
        empty: "Aucun embed enregistré",
        addId: "cst:emb:add",
        entryId: "cst:emb:edit",
        entryAccessory: "edit",
        render: entry => [
            entry.title ? `**${truncate(entry.title, 100)}**` : null,
            entry.description ? truncate(entry.description, 200) : null
        ].filter(Boolean).join("\n") || EMPTY
    });
}

function buildStickersView(custom, color) {
    return buildListModuleView(color, {
        header: MODULE_HEADERS.stickers,
        entries: custom.stickers,
        empty: "Aucun sticker enregistré",
        addId: "cst:stk:add",
        entryId: "cst:stk:del",
        entryAccessory: "delete",
        render: entry => typeof entry === "string"
            ? entry
            : [`**${entry.name}**`, entry.description].filter(Boolean).join("\n")
    });
}

function buildRolesView(custom, color) {
    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(MODULE_HEADERS.roles))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Rôles ajoutés**"))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId("cst:roles:add")
                    .setMinValues(0)
                    .setMaxValues(25)
                    .setDefaultRoles(custom.rolesAdd)
            )
        )
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Rôles supprimés**"))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId("cst:roles:remove")
                    .setMinValues(0)
                    .setMaxValues(25)
                    .setDefaultRoles(custom.rolesRemove)
            )
        );

    return [container, backRow()];
}

function buildUserFilterView(custom, color) {
    const filter = custom.userFilter;

    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(MODULE_HEADERS.userFilter))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Rôles requis**"))
        .addActionRowComponents(new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder().setCustomId("cst:filter:required").setMinValues(0).setMaxValues(25).setDefaultRoles(filter.requiredRoles)
        ))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Rôles interdits**"))
        .addActionRowComponents(new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder().setCustomId("cst:filter:forbidden").setMinValues(0).setMaxValues(25).setDefaultRoles(filter.forbiddenRoles)
        ))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Membres autorisés**"))
        .addActionRowComponents(new ActionRowBuilder().addComponents(
            new UserSelectMenuBuilder().setCustomId("cst:filter:allowed").setMinValues(0).setMaxValues(25).setDefaultUsers(filter.allowedUsers)
        ))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Membres interdits**"))
        .addActionRowComponents(new ActionRowBuilder().addComponents(
            new UserSelectMenuBuilder().setCustomId("cst:filter:forbiddenUsers").setMinValues(0).setMaxValues(25).setDefaultUsers(filter.forbiddenUsers)
        ));

    return [container, backRow()];
}

function buildReactionsView(custom, color) {
    // Les réactions sont incompatibles avec la suppression automatique de la réponse.
    const autodelete = custom.deleteResponse && custom.deleteResponse !== "off"
        ? "\n*Désactivé à cause de l'autodelete*"
        : "";

    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(MODULE_HEADERS.reactions))
        .addSectionComponents(
            sectionWithButton(
                `**Réaction sur le message de commande**\n\n${orEmpty(custom.reactions.command.join(" "))}`,
                new ButtonBuilder().setCustomId("cst:react:command").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })
            ),
            sectionWithButton(
                `**Réaction sur la réponse du bot**\n\n${orEmpty(custom.reactions.response.join(" "))}${autodelete}`,
                new ButtonBuilder().setCustomId("cst:react:answer").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" }).setDisabled(!!autodelete)
            )
        );

    return [container, backRow()];
}

function buildCooldownView(custom, color) {
    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addSectionComponents(
            sectionWithButton(
                `**Cooldown par utilisateur**\n${formatDuration(custom.cooldown.user)}`,
                new ButtonBuilder().setCustomId("cst:cd:user").setStyle(ButtonStyle.Secondary).setLabel("Cooldown utilisateur").setEmoji({ name: "👤" })
            ),
            sectionWithButton(
                `**Cooldown global**\n${formatDuration(custom.cooldown.global)}`,
                new ButtonBuilder().setCustomId("cst:cd:global").setStyle(ButtonStyle.Secondary).setLabel("Cooldown global").setEmoji({ name: "🌐" })
            )
        );

    return [container, backRow()];
}

function buildComponentsView(custom, color) {
    const { buttons, selects } = custom.components;

    const options = [
        { label: "Ajouter un bouton", value: "new_button", emoji: { name: "➕" } },
        { label: "Ajouter un sélecteur", value: "new_select", emoji: { name: "➕" } },
        ...buttons.map((button, index) => ({
            label: truncate(`Bouton ${index + 1} — ${button.label || EMPTY}`, 100),
            value: `button:${index}`
        })),
        ...selects.map((select, index) => ({
            label: truncate(`Sélecteur ${index + 1} — ${select.placeholder || EMPTY}`, 100),
            value: `select:${index}`
        }))
    ];

    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(MODULE_HEADERS.components))
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("cst:comp:manage")
                    .setPlaceholder("Gérer les boutons et sélecteurs")
                    .addOptions(options.slice(0, 25))
            )
        );

    return [container, backRow()];
}

function buildButtonView(button, color, { linkedLabel }) {
    const activeColor = BUTTON_COLORS.find(entry => entry.value === button.color) ?? BUTTON_COLORS[1];

    const preview = new ButtonBuilder()
        .setCustomId("cst:btn:preview")
        .setLabel(orEmpty(button.label))
        .setStyle(activeColor.style);

    if (button.emoji) preview.setEmoji({ name: button.emoji });

    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètre du bouton"))
        .addActionRowComponents(new ActionRowBuilder().addComponents(preview))
        .addSectionComponents(
            sectionWithButton(`**Texte**\n${orEmpty(button.label)}`,
                new ButtonBuilder().setCustomId("cst:btn:text").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
            sectionWithButton(`**Emoji**${button.emoji ? `\n${button.emoji}` : ""}`,
                new ButtonBuilder().setCustomId("cst:btn:emoji").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" }))
        )
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Couleur**"))
        .addActionRowComponents(choiceRow(BUTTON_COLORS, button.color, "cst:btn:color"))
        .addSectionComponents(
            sectionWithButton(`**URL**\n${button.url ?? "None"}`,
                new ButtonBuilder().setCustomId("cst:btn:url").setStyle(ButtonStyle.Secondary).setEmoji({ name: "🌐" })),
            sectionWithButton("**Désactivé**",
                new ButtonBuilder().setCustomId("cst:btn:disabled").setStyle(ButtonStyle.Secondary).setEmoji(toggleEmoji(button.disabled))),
            sectionWithButton(`**Position**\n${button.position}`,
                new ButtonBuilder().setCustomId("cst:btn:position").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
            sectionWithButton(`**Commande custom liée**\n${linkedLabel}`,
                new ButtonBuilder().setCustomId("cst:btn:linked").setStyle(ButtonStyle.Secondary).setEmoji({ name: "🔗" }))
        )
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Activation de la commande lié**"))
        .addActionRowComponents(choiceRow(LINKED_ACTIVATIONS, button.activation, "cst:btn:activation"));

    return [container, backRow({ deleteId: "cst:btn:delete" })];
}

function buildSelectView(select, color) {
    const options = [
        ...select.options.map((option, index) => ({
            label: truncate(`${index + 1}. ${option.label || EMPTY}`, 100),
            value: String(index + 1)
        })),
        { label: "Ajouter une option", value: String(select.options.length + 1), emoji: { name: "➕" } }
    ];

    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètre du sélecteur"))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId("cst:sel:options").addOptions(options.slice(0, 25))
            )
        )
        .addSectionComponents(
            sectionWithButton(`**Placeholder**\n${orEmpty(select.placeholder)}`,
                new ButtonBuilder().setCustomId("cst:sel:placeholder").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
            sectionWithButton("**Désactivé**",
                new ButtonBuilder().setCustomId("cst:sel:disabled").setStyle(ButtonStyle.Secondary).setEmoji(toggleEmoji(select.disabled)))
        )
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Options**\n${select.options.length}`));

    return [container, backRow({ deleteId: "cst:sel:delete" })];
}

function buildSelectOptionView(option, color, { linkedLabel }) {
    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètre de l'option"))
        .addSectionComponents(
            sectionWithButton(`**Texte**\n${orEmpty(option.label)}`,
                new ButtonBuilder().setCustomId("cst:opt:text").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
            sectionWithButton(`**Description**\n${orEmpty(option.description)}`,
                new ButtonBuilder().setCustomId("cst:opt:description").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
            sectionWithButton(`**Emoji**${option.emoji ? `\n${option.emoji}` : ""}`,
                new ButtonBuilder().setCustomId("cst:opt:emoji").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
            sectionWithButton(`**Position**\n${option.position}`,
                new ButtonBuilder().setCustomId("cst:opt:position").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
            sectionWithButton(`**Commande custom liée**\n${linkedLabel}`,
                new ButtonBuilder().setCustomId("cst:opt:linked").setStyle(ButtonStyle.Secondary).setEmoji({ name: "🔗" }))
        );

    return [container, backRow({ deleteId: "cst:opt:delete" })];
}

function buildAdvancedView(custom, color) {
    const list = custom.advancedComponents ?? [];

    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(MODULE_HEADERS.advanced));

    for (const item of list) {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${item.type}**\n${advancedSummary(item)}`));
    }

    if (list.length) {
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("cst:adv:edit")
                    .setPlaceholder("Modifier les components existants")
                    .addOptions(list.slice(0, 25).map((item, index) => ({ label: item.type, value: String(index) })))
            )
        );
    }

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("cst:adv:add")
                .setPlaceholder("Ajouter un nouveau component")
                .addOptions(ADVANCED_TYPES)
        )
    );

    return [container, backRow()];
}

/**
 * Editeur d'un composant avancé. Chaque type a son propre aperçu, exactement
 * comme sur le bot cible.
 */
function buildAdvancedItemView(item, color) {
    const accent = parseColor(color);

    if (item.type === "TextDisplay") {
        const container = new ContainerBuilder()
            .setAccentColor(accent)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètre du Text Display"))
            .addSectionComponents(sectionWithButton(
                orEmpty(item.content),
                new ButtonBuilder().setCustomId("cst:adv:text").setStyle(ButtonStyle.Secondary).setLabel("Modifier le texte affiché").setEmoji({ name: "✏" })
            ));

        return [container, backRow({ deleteId: "cst:adv:delete" })];
    }

    if (item.type === "Separator") {
        const container = new ContainerBuilder()
            .setAccentColor(accent)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètre du séparateur"))
            .addSeparatorComponents(new SeparatorBuilder()
                .setDivider(item.visible)
                .setSpacing(item.large ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small))
            .addSectionComponents(
                sectionWithButton("**Large**",
                    new ButtonBuilder().setCustomId("cst:adv:sep:size").setStyle(ButtonStyle.Secondary).setEmoji(toggleEmoji(item.large))),
                sectionWithButton("**Visible**",
                    new ButtonBuilder().setCustomId("cst:adv:sep:visible").setStyle(ButtonStyle.Secondary).setEmoji(toggleEmoji(item.visible)))
            );

        return [container, backRow({ deleteId: "cst:adv:delete" })];
    }

    if (item.type === "Section") {
        const section = new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(orEmpty(item.text)));

        if (item.accessory?.type === "thumbnail" && item.accessory.url) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(item.accessory.url));
        } else {
            section.setButtonAccessory(
                new ButtonBuilder()
                    .setCustomId("cst:adv:sec:preview")
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(orEmpty(item.accessory?.label))
            );
        }

        const container = new ContainerBuilder()
            .setAccentColor(accent)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Exemple de votre section"))
            .addSectionComponents(section)
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("cst:adv:sec:text").setStyle(ButtonStyle.Secondary).setLabel("Modifier le texte affiché"),
                    new ButtonBuilder().setCustomId("cst:adv:sec:button").setStyle(ButtonStyle.Secondary).setLabel("Bouton"),
                    new ButtonBuilder().setCustomId("cst:adv:sec:thumbnail").setStyle(ButtonStyle.Secondary).setLabel("Thumbnail")
                )
            );

        return [container, backRow({ deleteId: "cst:adv:delete" })];
    }

    if (item.type === "MediaGallery") {
        const container = new ContainerBuilder()
            .setAccentColor(accent)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Exemple de votre Media Gallery"));

        if ((item.images ?? []).length) {
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(item.images.map(url => new MediaGalleryItemBuilder().setURL(url)))
            );
        } else {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(EMPTY));
        }

        const options = [
            { label: "Ajouter une image", value: "new", emoji: { name: "➕" } },
            ...(item.images ?? []).map((url, index) => ({
                label: truncate(`Supprimer une image — ${url}`, 100),
                value: String(index)
            }))
        ];

        const galleryRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId("cst:adv:gal").addOptions(options.slice(0, 25))
        );

        return [container, galleryRow, backRow({ deleteId: "cst:adv:delete" })];
    }

    if (item.type === "ActionRow") {
        const container = new ContainerBuilder()
            .setAccentColor(accent)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Exemple de l'Action Row"));

        const preview = buildAdvancedActionRow(item);
        if (preview) container.addActionRowComponents(preview);
        else container.addTextDisplayComponents(new TextDisplayBuilder().setContent(EMPTY));

        const options = [
            { label: "Ajouter un bouton", value: "Button", emoji: { name: "➕" } },
            { label: "Ajouter un sélecteur", value: "Select", emoji: { name: "➕" } },
            ...(item.items ?? []).map((entry, index) => ({
                label: truncate(entry.kind === "select"
                    ? `Sélecteur — ${entry.placeholder || EMPTY}`
                    : `Bouton ${index + 1} — ${entry.label || EMPTY}`, 100),
                value: String(index)
            }))
        ];

        const rowMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId("cst:adv:row").addOptions(options.slice(0, 25))
        );

        return [container, rowMenu, backRow({ deleteId: "cst:adv:delete" })];
    }

    // Container : son aperçu utilise sa propre couleur et il accueille les autres types.
    const container = new ContainerBuilder();
    if (item.color !== null && item.color !== undefined) container.setAccentColor(parseColor(item.color));

    const children = item.components ?? [];
    if (!children.length) {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(EMPTY));
    } else if (countAdvanced(children) > MAX_ADVANCED_ITEMS) {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent("Il y a trop d'éléments dans ce container pour afficher un apperçu"));
    } else {
        for (const child of children) {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${child.type}**\n${advancedSummary(child)}`));
        }

        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("cst:adv:sub:edit")
                    .setPlaceholder("Modifier les components existants")
                    .addOptions(children.slice(0, 25).map((child, index) => ({ label: child.type, value: String(index) })))
            )
        );
    }

    const addRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("cst:adv:sub:add")
            .setPlaceholder("Ajouter un nouveau component")
            .addOptions(ADVANCED_TYPES.filter(type => type.value !== "Container"))
    );

    return [container, addRow, backRow({
        deleteId: "cst:adv:delete",
        extra: [
            new ButtonBuilder().setCustomId("cst:adv:color").setStyle(ButtonStyle.Secondary).setLabel("Modifier la couleur").setEmoji({ name: "🔴" })
        ]
    })];
}

/**
 * Construire la rangée réelle d'un composant avancé de type ActionRow,
 * utilisée pour l'aperçu et pour l'envoi à l'exécution.
 */
function buildAdvancedActionRow(item) {
    const entries = item.items ?? [];
    if (!entries.length) return null;

    const select = entries.find(entry => entry.kind === "select");
    if (select) {
        if (!select.options?.length) return null;

        return new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`custom_adv_select_${select.position ?? 0}`)
                .setPlaceholder(select.placeholder || "​")
                .setDisabled(true)
                .addOptions(select.options.slice(0, 25).map((option, index) => ({
                    label: option.label || `Option ${index + 1}`,
                    value: String(index),
                    description: option.description || undefined,
                    emoji: option.emoji ? { name: option.emoji } : undefined
                })))
        );
    }

    const row = new ActionRowBuilder();
    for (const entry of entries.filter(candidate => candidate.kind === "button").slice(0, 5)) {
        const color = BUTTON_COLORS.find(candidate => candidate.value === entry.color) ?? BUTTON_COLORS[1];
        const button = new ButtonBuilder()
            .setCustomId(`custom_adv_button_${entry.position ?? 0}`)
            .setLabel(orEmpty(entry.label))
            .setStyle(color.style)
            .setDisabled(true);

        if (entry.emoji) button.setEmoji({ name: entry.emoji });
        row.addComponents(button);
    }

    return row.components.length ? row : null;
}

function buildFormView(custom, color) {
    const form = custom.form;
    const usesVariable = formVariablesUsed(custom);

    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(MODULE_HEADERS.form))
        .addSectionComponents(sectionWithButton(
            `**Titre du formulaire**\n${form.title}`,
            new ButtonBuilder().setCustomId("cst:form:title").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })
        ));

    const fieldsHeader = `**Champs (${form.fields.length}/${MAX_FORM_FIELDS})**`;
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        form.fields.length ? fieldsHeader : `${fieldsHeader}\n⚠️ Configurez au moins un champ`
    ));

    const options = [];
    if (form.fields.length < MAX_FORM_FIELDS) {
        options.push({ label: "Ajouter un champ", value: "new", emoji: { name: "➕" } });
    }
    options.push(...form.fields.map((field, index) => ({
        label: truncate(`${index + 1}. ${field.title}`, 100),
        value: String(index)
    })));

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("cst:form:fields")
                .setPlaceholder("Ajouter ou modifier un champ")
                .addOptions(options.slice(0, 25))
        )
    );

    container.addSectionComponents(sectionWithButton(
        "**Autoriser les mentions dans les réponses**\nSi désactivé, une réponse contenant @everyone, @here ou une mention de rôle est neutralisée avant son insertion",
        new ButtonBuilder().setCustomId("cst:form:mentions").setStyle(ButtonStyle.Secondary).setEmoji(toggleEmoji(form.allowMentions))
    ));

    if (!usesVariable) {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent("⚠️ Ce formulaire n'a aucune réponse configurée"));
    }

    return [container, backRow({ deleteId: "cst:form:disable", deleteLabel: "Retirer le module Formulaire" })];
}

/**
 * Une variable `{Form.clé}` doit être utilisée quelque part pour que le formulaire serve.
 */
function formVariablesUsed(custom) {
    if (!custom.form?.fields?.length) return false;

    const haystack = JSON.stringify([
        custom.messages,
        custom.embeds,
        custom.components,
        custom.advancedComponents
    ]);

    return custom.form.fields.some(field => haystack.includes(`{Form.${field.key}}`));
}

function buildFormFieldView(field, color) {
    const container = new ContainerBuilder()
        .setAccentColor(parseColor(color))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## Paramètres du champ"))
        .addSectionComponents(
            sectionWithButton(`**Titre**\n${field.title}`,
                new ButtonBuilder().setCustomId("cst:field:title").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
            sectionWithButton(
                `**Variable**\n\`{Form.${field.key}}\`\n-# Copiez ceci dans votre message ou votre embed`,
                new ButtonBuilder().setCustomId("cst:field:key").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" }))
        )
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Type de champ**"))
        .addActionRowComponents(choiceRow(FORM_FIELD_TYPES, field.type, "cst:field:type"))
        .addSectionComponents(
            sectionWithButton(`**Placeholder**\n${orEmpty(field.placeholder)}`,
                new ButtonBuilder().setCustomId("cst:field:placeholder").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })),
            sectionWithButton("**Requis**",
                new ButtonBuilder().setCustomId("cst:field:required").setStyle(ButtonStyle.Secondary).setEmoji(toggleEmoji(field.required))),
            sectionWithButton(`**Si vide**\n${orEmpty(field.empty)}`,
                new ButtonBuilder().setCustomId("cst:field:empty").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" }))
        )
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**Longueur minimum** ${field.minLength} — **Longueur maximum** ${field.maxLength}`
        ))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("cst:field:min").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" }),
                new ButtonBuilder().setCustomId("cst:field:max").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })
            )
        )
        .addSectionComponents(sectionWithButton(
            `**Valeur par défaut**\n${orEmpty(field.default)}`,
            new ButtonBuilder().setCustomId("cst:field:default").setStyle(ButtonStyle.Secondary).setEmoji({ name: "✏" })
        ));

    if (field.type === "choice") {
        const options = [
            { label: "Ajouter une option", value: "new", emoji: { name: "➕" } },
            ...(field.options ?? []).map((option, index) => ({
                label: truncate(`${index + 1}. ${option}`, 100),
                value: String(index)
            }))
        ];

        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId("cst:field:options").setPlaceholder("Options de la liste").addOptions(options.slice(0, 25))
            )
        );
    }

    return [container, backRow({ deleteId: "cst:field:delete" })];
}

/**
 * Editeur d'embed : c'est un message classique séparé du panneau, car Discord
 * refuse de transformer un message en Components V2 en message à embeds.
 */
function buildEmbedEditor(data, color, historyIndex, historyLength) {
    const embed = new EmbedBuilder().setColor(parseColor(data.color ?? color));

    if (data.title) embed.setTitle(data.title);
    if (data.description) embed.setDescription(data.description);
    if (data.url) embed.setURL(data.url);
    if (data.author?.name) embed.setAuthor({ name: data.author.name, iconURL: data.author.iconURL ?? undefined });
    if (data.footer?.text) embed.setFooter({ text: data.footer.text, iconURL: data.footer.iconURL ?? undefined });
    if (data.image) embed.setImage(data.image);
    if (data.thumbnail) embed.setThumbnail(data.thumbnail);
    if (data.timestamp) embed.setTimestamp(new Date(data.timestamp));
    if (data.fields?.length) embed.setFields(data.fields);

    if (!data.title && !data.description && !data.fields?.length && !data.image) {
        embed.setDescription("** **");
    }

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId("cst:embed:menu").addOptions([
            { label: "Modifier le titre", value: "1", emoji: { name: "✏" } },
            { label: "Modifier la description", value: "2", emoji: { name: "💬" } },
            { label: "Modifier l'auteur", value: "3", emoji: { name: "🕵" } },
            { label: "Modifier le footer", value: "4", emoji: { name: "🔻" } },
            { label: "Modifier le thumbnail", value: "5", emoji: { name: "🔳" } },
            { label: "Modifier le timestamp", value: "6", emoji: { name: "🕙" } },
            { label: "Modifier l'image", value: "7", emoji: { name: "🖼" } },
            { label: "Modifier l'url", value: "8", emoji: { name: "🌐" } },
            { label: "Modifier la couleur", value: "9", emoji: { name: "🔴" } },
            { label: "Ajouter un field", value: "10", emoji: { name: "⤵" } },
            { label: "Supprimer un field", value: "11", emoji: { name: "⤴" } },
            { label: "Copier un embed existant", value: "12", emoji: { name: "📥" } }
        ])
    );

    const actions = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("cst:embed:undo").setStyle(ButtonStyle.Primary).setLabel("Défaire").setEmoji({ name: "↩" }),
        new ButtonBuilder().setCustomId("cst:embed:redo").setStyle(ButtonStyle.Primary).setLabel("Refaire").setEmoji({ name: "↪" }).setDisabled(historyIndex >= historyLength - 1),
        new ButtonBuilder().setCustomId("cst:embed:validate").setStyle(ButtonStyle.Primary).setLabel("Valider").setEmoji({ name: "✅" }),
        new ButtonBuilder().setCustomId("cst:embed:delete").setStyle(ButtonStyle.Primary).setLabel("Supprimer").setEmoji({ name: "❌" })
    );

    return { embeds: [embed], components: [menu, actions] };
}

// ----------------------------------------------------------------------------
// COMMANDE
// ----------------------------------------------------------------------------

module.exports = {
    name: "custom",
    description: "Crée ou modifie une commande personnalisée",
    category: "Configuration du serveur",
    argument: "<mot-clé>",
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
    async execute(client, message, args, guildData) {
        const db = guildData || client.get(message.guildId);
        db.customs ??= {};

        // `+custom transfer <serveur>` : reprise des commandes custom d'un autre serveur.
        if (args[0] === "transfer") {
            const guild = client.guilds.cache.get(args[1]) || client.guilds.cache.at(parseInt(args[1], 10) - 1);
            if (!guild) return message.channel.send("ID ou numéro de serveur invalide");
            if (guild.id === message.guildId) return message.channel.send("Vous ne pouvez pas transféré une commande custom d'un serveur vers lui même");

            const source = client.get(guild.id);
            const customs = Object.keys(source.customs || {});
            if (!customs.length) return message.channel.send(`Il n'y a aucune commande custom enregistrée sur le serveur ${guild.name}`);

            for (const [key, value] of Object.entries(source.customs)) {
                db.customs[key] = normalizeCustom(structuredClone(value), key);
            }
            client.save(message.guildId);

            return message.channel.send(`Les commandes custom de \`${guild.name}\` ont été **transférées**`);
        }

        const key = args.join(" ").trim().toLowerCase();
        if (!key) return message.channel.send(`Utilisation : \`${db.prefix ?? client.config.prefix}custom <mot-clé>\``);

        db.customs[key] = normalizeCustom(db.customs[key], key);
        client.save(message.guildId);

        let custom = db.customs[key];

        // Vue courante : `name` désigne le panneau, les autres champs situent l'élément édité.
        const view = { name: "main", advPath: [], owner: null, index: null, optionIndex: null };
        let embedMessage = null;
        let embedHistory = [];
        let embedIndex = 0;
        let embedTarget = null;

        const panel = await message.channel.send({
            components: buildMainView(custom, db.color),
            flags: MessageFlags.IsComponentsV2
        });

        /**
         * Poser une question, attendre la réponse, puis effacer les deux messages.
         */
        const ask = async (question) => {
            const prompt = await message.channel.send(question).catch(() => null);
            const answers = await message.channel.awaitMessages({
                filter: entry => entry.author.id === message.author.id,
                max: 1,
                time: 120000
            });

            prompt?.delete().catch(() => null);

            const answer = answers.first();
            if (!answer) return null;

            const content = answer.content;
            answer.delete().catch(() => null);
            return content;
        };

        const warn = async (text) => {
            const notice = await message.channel.send(text).catch(() => null);
            setTimeout(() => notice?.delete().catch(() => null), 6000);
        };

        const save = () => client.save(message.guildId);

        const linkedLabel = (linked) => {
            if (!linked) return "Aucune";
            return db.customs[linked] ? `Déclenche la custom \`${linked}\`` : "Aucune";
        };

        /**
         * Construire les composants de la vue courante.
         */
        const render = () => {
            switch (view.name) {
                case "messages": return buildMessagesView(custom, db.color);
                case "embeds": return buildEmbedsView(custom, db.color);
                case "stickers": return buildStickersView(custom, db.color);
                case "roles": return buildRolesView(custom, db.color);
                case "userFilter": return buildUserFilterView(custom, db.color);
                case "reactions": return buildReactionsView(custom, db.color);
                case "cooldown": return buildCooldownView(custom, db.color);
                case "components": return buildComponentsView(custom, db.color);
                case "button": {
                    const button = currentButton();
                    if (!button) return buildComponentsView(custom, db.color);
                    return buildButtonView(button, db.color, { linkedLabel: linkedLabel(button.linked) });
                }
                case "select": {
                    const select = currentSelect();
                    if (!select) return buildComponentsView(custom, db.color);
                    return buildSelectView(select, db.color);
                }
                case "selectOption": {
                    const select = currentSelect();
                    const option = select?.options?.[view.optionIndex];
                    if (!option) return buildComponentsView(custom, db.color);
                    return buildSelectOptionView(option, db.color, { linkedLabel: linkedLabel(option.linked) });
                }
                case "advanced": return buildAdvancedView(custom, db.color);
                case "advancedItem": {
                    const item = advancedItem(custom, view.advPath);
                    if (!item) { view.name = "advanced"; return buildAdvancedView(custom, db.color); }
                    return buildAdvancedItemView(item, db.color);
                }
                case "form": {
                    if (!custom.form) { view.name = "main"; return buildMainView(custom, db.color); }
                    return buildFormView(custom, db.color);
                }
                case "formField": {
                    const field = custom.form?.fields?.[view.index];
                    if (!field) { view.name = "form"; return buildFormView(custom, db.color); }
                    return buildFormFieldView(field, db.color);
                }
                default: return buildMainView(custom, db.color);
            }
        };

        const refresh = () => panel.edit({
            components: render(),
            flags: MessageFlags.IsComponentsV2
        }).catch(() => null);

        /**
         * Bouton/sélecteur courant : soit ceux du module, soit ceux d'un ActionRow avancé.
         */
        const currentButton = () => {
            if (view.owner === "advanced") {
                const row = advancedItem(custom, view.advPath);
                return row?.items?.[view.index] ?? null;
            }
            return custom.components.buttons[view.index] ?? null;
        };

        const currentSelect = () => {
            if (view.owner === "advanced") {
                const row = advancedItem(custom, view.advPath);
                return row?.items?.[view.index] ?? null;
            }
            return custom.components.selects[view.index] ?? null;
        };

        /**
         * Retour : chaque vue connaît son parent.
         */
        const goBack = () => {
            switch (view.name) {
                case "button":
                case "select":
                    view.name = view.owner === "advanced" ? "advancedItem" : "components";
                    break;
                case "selectOption":
                    view.name = "select";
                    break;
                case "formField":
                    view.name = "form";
                    break;
                case "advancedItem":
                    view.advPath = view.advPath.slice(0, -1);
                    view.name = view.advPath.length ? "advancedItem" : "advanced";
                    break;
                default:
                    view.name = "main";
                    view.advPath = [];
                    view.owner = null;
                    break;
            }
        };

        const collector = panel.createMessageComponentCollector({ time: 15 * 60 * 1000 });

        collector.on("collect", async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 }).catch(() => null);
            }

            const id = interaction.customId;
            const values = interaction.values ?? [];

            // Le panneau est toujours mis à jour après coup : on accuse réception tout de suite.
            await interaction.deferUpdate().catch(() => null);

            // ---------------- suppression de la commande ----------------
            if (id === "cst:delete") {
                delete db.customs[custom.key];
                save();
                collector.stop("deleted");
                embedMessage?.delete().catch(() => null);
                return panel.edit({
                    components: [new TextDisplayBuilder().setContent("Commande supprimée")],
                    flags: MessageFlags.IsComponentsV2
                }).catch(() => null);
            }

            if (id === "cst:back") {
                goBack();
                return refresh();
            }

            // ---------------- panneau principal ----------------
            if (id.startsWith("cst:mode:")) {
                const mode = parseInt(id.split(":")[2], 10);

                if (mode === 3) {
                    const answer = await ask(ASK.channel);
                    const channel = answer ? client.resolveChannels(message.guild, answer, null)?.[0] : null;
                    if (channel) {
                        custom.channelMode = 3;
                        custom.fixedChannel = channel.id;
                        save();
                    }
                    return refresh();
                }

                custom.channelMode = mode;
                if (mode !== 2 && mode !== 3) custom.fixedChannel = null;
                save();
                return refresh();
            }

            if (id === "cst:fixedchannel") {
                custom.fixedChannel = values[0] ?? null;
                save();
                return refresh();
            }

            if (id === "cst:targetable") {
                custom.targetMember = !custom.targetMember;
                save();
                return refresh();
            }

            if (id === "cst:usable") {
                // Un formulaire ne peut être ouvert que par un bouton, jamais par un message.
                if (custom.form) {
                    await warn("Un formulaire ne peut être ouvert que par un bouton, jamais par un message");
                    return refresh();
                }
                custom.triggerByMessage = !custom.triggerByMessage;
                save();
                return refresh();
            }

            if (id === "cst:deltrigger") {
                custom.deleteCommand = !custom.deleteCommand;
                save();
                return refresh();
            }

            if (id === "cst:delanswer") {
                const answer = await ask(ASK.deleteAnswer);
                if (answer !== null) {
                    const raw = answer.trim().toLowerCase();
                    if (raw === "off" || raw === "0") {
                        custom.deleteResponse = "off";
                    } else {
                        const duration = parseDuration(raw);
                        if (duration) custom.deleteResponse = formatDuration(duration);
                    }
                    save();
                }
                return refresh();
            }

            if (id === "cst:logchannel") {
                const answer = await ask(ASK.logchannel);
                const channel = answer ? client.resolveChannels(message.guild, answer, null)?.[0] : null;
                if (channel) {
                    custom.logChannel = channel.id;
                    save();
                }
                return refresh();
            }

            if (id === "cst:logselect") {
                custom.logChannel = values[0] ?? null;
                save();
                return refresh();
            }

            if (id === "cst:keyword") {
                const answer = await ask(ASK.keyword);
                const next = answer?.trim().toLowerCase();

                if (next) {
                    if (db.customs[next] && next !== custom.key) {
                        await warn(ASK.keywordUsed);
                    } else if (client.commands.has(next)) {
                        await warn(ASK.keywordUsed);
                    } else {
                        delete db.customs[custom.key];
                        custom.key = next;
                        db.customs[next] = custom;
                        save();
                    }
                }
                return refresh();
            }

            if (id === "cst:modules") {
                switch (values[0]) {
                    case "Messages": view.name = "messages"; break;
                    case "Embeds": view.name = "embeds"; break;
                    case "Stickers": view.name = "stickers"; break;
                    case "Roles": view.name = "roles"; break;
                    case "UserFilter": view.name = "userFilter"; break;
                    case "Reactions": view.name = "reactions"; break;
                    case "Cooldown": view.name = "cooldown"; break;
                    case "Components": view.name = "components"; break;
                    case "AdvancedComponents":
                        custom.advancedComponents ??= [];
                        save();
                        view.name = "advanced";
                        view.advPath = [];
                        break;
                    case "Form":
                        custom.form ??= { title: "Formulaire", allowMentions: false, fields: [] };
                        // Un formulaire ne s'ouvre que depuis un bouton.
                        custom.triggerByMessage = false;
                        save();
                        view.name = "form";
                        break;
                    default: break;
                }
                return refresh();
            }

            // ---------------- Messages / Embeds / Stickers ----------------
            if (id === "cst:msg:add") {
                if (custom.messages.length >= MAX_MESSAGES) {
                    await warn("Limite de messages atteinte");
                    return refresh();
                }

                const answer = await ask(ASK.message);
                if (answer?.trim()) {
                    custom.messages.push(answer);
                    save();
                }
                return refresh();
            }

            // Chaque message enregistré porte sa propre poubelle.
            if (id.startsWith("cst:msg:del:")) {
                custom.messages.splice(parseInt(id.split(":")[3], 10), 1);
                save();
                return refresh();
            }

            if (id === "cst:stk:add") {
                if (custom.stickers.length >= MAX_STICKERS) {
                    await warn("Limite de sticker atteinte");
                    return refresh();
                }

                const answer = await ask(ASK.sticker);
                const stickerId = answer?.trim().match(/\d{17,20}/)?.[0];

                if (stickerId) {
                    // Le nom est affiché sur le panneau : on le résout à l'ajout,
                    // le rendu n'ayant pas accès au client.
                    const sticker = message.guild.stickers.cache.get(stickerId)
                        || await client.fetchSticker(stickerId).catch(() => null);

                    if (sticker) {
                        custom.stickers.push({
                            id: sticker.id,
                            name: sticker.name,
                            description: sticker.description || null
                        });
                        save();
                    } else {
                        await warn("Ce sticker provient d'un autre serveur et ne peut pas être utilisé");
                    }
                } else if (answer !== null) {
                    await warn("Ce sticker provient d'un autre serveur et ne peut pas être utilisé");
                }
                return refresh();
            }

            if (id.startsWith("cst:stk:del:")) {
                custom.stickers.splice(parseInt(id.split(":")[3], 10), 1);
                save();
                return refresh();
            }

            if (id === "cst:emb:add" || id.startsWith("cst:emb:edit:")) {
                if (id === "cst:emb:add" && custom.embeds.length >= MAX_EMBEDS) {
                    await warn("Limite d'embeds atteinte");
                    return refresh();
                }

                embedTarget = id === "cst:emb:add" ? null : parseInt(id.split(":")[3], 10);
                const base = embedTarget === null ? {} : structuredClone(custom.embeds[embedTarget] ?? {});
                embedHistory = [base];
                embedIndex = 0;

                // Message séparé : un message Components V2 ne peut pas recevoir d'embed.
                embedMessage = await message.channel.send(
                    buildEmbedEditor(embedHistory[embedIndex], db.color, embedIndex, embedHistory.length)
                ).catch(() => null);

                if (embedMessage) attachEmbedCollector();
                return refresh();
            }

            // ---------------- Rôles et filtration ----------------
            if (id === "cst:roles:add") { custom.rolesAdd = values; save(); return refresh(); }
            if (id === "cst:roles:remove") { custom.rolesRemove = values; save(); return refresh(); }
            if (id === "cst:filter:required") { custom.userFilter.requiredRoles = values; save(); return refresh(); }
            if (id === "cst:filter:forbidden") { custom.userFilter.forbiddenRoles = values; save(); return refresh(); }
            if (id === "cst:filter:allowed") { custom.userFilter.allowedUsers = values; save(); return refresh(); }
            if (id === "cst:filter:forbiddenUsers") { custom.userFilter.forbiddenUsers = values; save(); return refresh(); }

            // ---------------- Réactions ----------------
            if (id === "cst:react:command" || id === "cst:react:answer") {
                const isCommand = id.endsWith("command");
                const answer = await ask(isCommand ? ASK.reactionCommand : ASK.reactionAnswer);

                if (answer !== null) {
                    const emojis = answer.trim().split(/\s+/).filter(Boolean).slice(0, 20);
                    if (isCommand) custom.reactions.command = emojis;
                    else custom.reactions.response = emojis;
                    save();
                }
                return refresh();
            }

            // ---------------- Cooldown ----------------
            if (id === "cst:cd:user" || id === "cst:cd:global") {
                const isUser = id.endsWith("user");
                const answer = await ask(isUser ? ASK.cooldownUser : ASK.cooldownGlobal);

                if (answer !== null) {
                    const duration = parseDuration(answer);
                    if (duration !== null) {
                        if (isUser && duration > 0 && duration < 2000) await warn(ASK.cooldownLimit);
                        else if (isUser) custom.cooldown.user = duration;
                        else custom.cooldown.global = duration;
                        save();
                    }
                }
                return refresh();
            }

            // ---------------- Boutons et sélecteurs ----------------
            if (id === "cst:comp:manage") {
                const [kind, index] = values[0].split(":");

                if (kind === "new_button") {
                    custom.components.buttons.push(defaultButton(custom.components.buttons.length + 1));
                    view.owner = "module";
                    view.index = custom.components.buttons.length - 1;
                    view.name = "button";
                } else if (kind === "new_select") {
                    custom.components.selects.push(defaultSelect());
                    view.owner = "module";
                    view.index = custom.components.selects.length - 1;
                    view.name = "select";
                } else {
                    view.owner = "module";
                    view.index = parseInt(index, 10);
                    view.name = kind === "button" ? "button" : "select";
                }

                save();
                return refresh();
            }

            if (id.startsWith("cst:btn:")) {
                const button = currentButton();
                if (!button) { view.name = "components"; return refresh(); }
                const action = id.split(":")[2];

                if (action === "delete") {
                    if (view.owner === "advanced") advancedItem(custom, view.advPath)?.items?.splice(view.index, 1);
                    else custom.components.buttons.splice(view.index, 1);
                    save();
                    goBack();
                    return refresh();
                }

                if (action === "color") { button.color = id.split(":")[3]; save(); return refresh(); }
                if (action === "activation") { button.activation = id.split(":")[3]; save(); return refresh(); }
                if (action === "disabled") { button.disabled = !button.disabled; save(); return refresh(); }

                const questions = {
                    text: ASK.buttonText,
                    emoji: ASK.buttonEmoji,
                    url: ASK.buttonUrl,
                    position: ASK.buttonPosition,
                    linked: ASK.buttonLinked
                };

                if (questions[action]) {
                    const answer = await ask(questions[action]);
                    if (answer !== null) {
                        const value = answer.trim();
                        if (action === "text") button.label = value;
                        if (action === "emoji") button.emoji = value || null;
                        if (action === "url") button.url = /^https?:\/\//i.test(value) ? value : null;
                        if (action === "position") {
                            const position = parseInt(value, 10);
                            if (!Number.isNaN(position)) button.position = position;
                        }
                        if (action === "linked") button.linked = db.customs[value.toLowerCase()] ? value.toLowerCase() : null;
                        save();
                    }
                }
                return refresh();
            }

            if (id.startsWith("cst:sel:")) {
                const select = currentSelect();
                if (!select) { view.name = "components"; return refresh(); }
                const action = id.split(":")[2];

                if (action === "delete") {
                    if (view.owner === "advanced") advancedItem(custom, view.advPath)?.items?.splice(view.index, 1);
                    else custom.components.selects.splice(view.index, 1);
                    save();
                    goBack();
                    return refresh();
                }

                if (action === "disabled") { select.disabled = !select.disabled; save(); return refresh(); }

                if (action === "placeholder") {
                    const answer = await ask(ASK.selectPlaceholder);
                    if (answer !== null) { select.placeholder = answer.trim(); save(); }
                    return refresh();
                }

                if (action === "options") {
                    const position = parseInt(values[0], 10);

                    if (position > select.options.length) {
                        select.options.push(defaultSelectOption(select.options.length + 1));
                        view.optionIndex = select.options.length - 1;
                    } else {
                        view.optionIndex = position - 1;
                    }
                    view.name = "selectOption";
                    save();
                    return refresh();
                }
            }

            if (id.startsWith("cst:opt:")) {
                const select = currentSelect();
                const option = select?.options?.[view.optionIndex];
                if (!option) { view.name = "select"; return refresh(); }
                const action = id.split(":")[2];

                if (action === "delete") {
                    select.options.splice(view.optionIndex, 1);
                    save();
                    view.name = "select";
                    return refresh();
                }

                const questions = {
                    text: ASK.optionText,
                    description: ASK.optionDescription,
                    emoji: ASK.optionEmoji,
                    position: ASK.optionPosition,
                    linked: ASK.optionLinked
                };

                if (questions[action]) {
                    const answer = await ask(questions[action]);
                    if (answer !== null) {
                        const value = answer.trim();
                        if (action === "text") option.label = value;
                        if (action === "description") option.description = value;
                        if (action === "emoji") option.emoji = value || null;
                        if (action === "position") {
                            const position = parseInt(value, 10);
                            if (!Number.isNaN(position)) option.position = position;
                        }
                        if (action === "linked") option.linked = db.customs[value.toLowerCase()] ? value.toLowerCase() : null;
                        save();
                    }
                }
                return refresh();
            }

            // ---------------- Composants avancés ----------------
            if (id === "cst:adv:add" || id === "cst:adv:sub:add") {
                let list;
                if (id === "cst:adv:add") {
                    list = custom.advancedComponents ??= [];
                } else {
                    const parent = advancedItem(custom, view.advPath);
                    if (!parent) { view.name = "advanced"; return refresh(); }
                    list = parent.components ??= [];
                }

                if (countAdvanced(custom.advancedComponents) >= MAX_ADVANCED_ITEMS) {
                    await warn("Les composants avancés sont limités à 40 éléments, vous avez dépassé la limite. Aucun composant ne sera envoyé.");
                    return refresh();
                }

                list.push(defaultAdvancedItem(values[0]));
                view.advPath = id === "cst:adv:add" ? [list.length - 1] : [...view.advPath, list.length - 1];
                view.name = "advancedItem";
                save();
                return refresh();
            }

            if (id === "cst:adv:edit" || id === "cst:adv:sub:edit") {
                const index = parseInt(values[0], 10);
                view.advPath = id === "cst:adv:edit" ? [index] : [...view.advPath, index];
                view.name = "advancedItem";
                return refresh();
            }

            if (id === "cst:adv:delete") {
                const list = advancedList(custom, view.advPath);
                list?.splice(view.advPath[view.advPath.length - 1], 1);
                save();
                goBack();
                return refresh();
            }

            if (id === "cst:adv:color") {
                const item = advancedItem(custom, view.advPath);
                const answer = await ask(ASK.containerColor);
                if (answer?.trim() && item) {
                    item.color = parseColor(answer.trim());
                    save();
                }
                return refresh();
            }

            if (id === "cst:adv:text") {
                const item = advancedItem(custom, view.advPath);
                const answer = await ask(ASK.textDisplay);
                if (answer !== null && item) { item.content = answer; save(); }
                return refresh();
            }

            if (id === "cst:adv:sep:size" || id === "cst:adv:sep:visible") {
                const item = advancedItem(custom, view.advPath);
                if (item) {
                    if (id.endsWith("size")) item.large = !item.large;
                    else item.visible = !item.visible;
                    save();
                }
                return refresh();
            }

            if (id.startsWith("cst:adv:sec:")) {
                const item = advancedItem(custom, view.advPath);
                if (!item) return refresh();
                const action = id.split(":")[3];

                if (action === "text") {
                    const answer = await ask(ASK.textDisplay);
                    if (answer !== null) { item.text = answer; save(); }
                    return refresh();
                }

                if (action === "button") {
                    item.accessory = { type: "button", label: item.accessory?.label ?? "", url: item.accessory?.url ?? null };
                    save();
                    return refresh();
                }

                if (action === "thumbnail") {
                    const answer = await ask(ASK.thumbnail);
                    const url = answer?.trim();
                    if (url && /^https?:\/\//i.test(url)) {
                        item.accessory = { type: "thumbnail", url };
                        save();
                    }
                    return refresh();
                }
            }

            if (id === "cst:adv:gal") {
                const item = advancedItem(custom, view.advPath);
                if (!item) return refresh();

                if (values[0] === "new") {
                    const answer = await ask(ASK.galleryImage);
                    const url = answer?.trim();
                    if (url && /^https?:\/\//i.test(url)) { item.images.push(url); save(); }
                } else {
                    item.images.splice(parseInt(values[0], 10), 1);
                    save();
                }
                return refresh();
            }

            if (id === "cst:adv:row") {
                const item = advancedItem(custom, view.advPath);
                if (!item) return refresh();
                item.items ??= [];

                if (values[0] === "Button") {
                    item.items.push({ kind: "button", ...defaultButton(item.items.length + 1) });
                    view.owner = "advanced";
                    view.index = item.items.length - 1;
                    view.name = "button";
                } else if (values[0] === "Select") {
                    item.items.push({ kind: "select", ...defaultSelect() });
                    view.owner = "advanced";
                    view.index = item.items.length - 1;
                    view.name = "select";
                } else {
                    const index = parseInt(values[0], 10);
                    view.owner = "advanced";
                    view.index = index;
                    view.name = item.items[index]?.kind === "select" ? "select" : "button";
                }

                save();
                return refresh();
            }

            // ---------------- Formulaire ----------------
            if (id === "cst:form:disable") {
                custom.form = null;
                save();
                view.name = "main";
                return refresh();
            }

            if (id === "cst:form:title") {
                const answer = await ask(ASK.formTitle);
                if (answer?.trim()) { custom.form.title = answer.trim(); save(); }
                return refresh();
            }

            if (id === "cst:form:mentions") {
                custom.form.allowMentions = !custom.form.allowMentions;
                save();
                return refresh();
            }

            if (id === "cst:form:fields") {
                if (values[0] === "new") {
                    if (custom.form.fields.length >= MAX_FORM_FIELDS) {
                        await warn(`Champs (${custom.form.fields.length}/${MAX_FORM_FIELDS})`);
                        return refresh();
                    }
                    custom.form.fields.push(defaultFormField(custom.form.fields.length));
                    view.index = custom.form.fields.length - 1;
                } else {
                    view.index = parseInt(values[0], 10);
                }

                view.name = "formField";
                save();
                return refresh();
            }

            if (id.startsWith("cst:field:")) {
                const field = custom.form?.fields?.[view.index];
                if (!field) { view.name = "form"; return refresh(); }
                const action = id.split(":")[2];

                if (action === "delete") {
                    custom.form.fields.splice(view.index, 1);
                    save();
                    view.name = "form";
                    return refresh();
                }

                if (action === "type") { field.type = id.split(":")[3]; save(); return refresh(); }
                if (action === "required") { field.required = !field.required; save(); return refresh(); }

                if (action === "options") {
                    field.options ??= [];
                    if (values[0] === "new") {
                        const answer = await ask("Envoyez le texte de cette option");
                        if (answer?.trim()) { field.options.push(answer.trim()); save(); }
                    } else {
                        field.options.splice(parseInt(values[0], 10), 1);
                        save();
                    }
                    return refresh();
                }

                const questions = {
                    title: ASK.formFieldTitle,
                    key: ASK.formFieldKey,
                    placeholder: ASK.formFieldPlaceholder,
                    empty: ASK.formFieldEmpty,
                    min: ASK.formFieldMin,
                    max: ASK.formFieldMax,
                    default: ASK.formFieldDefault
                };

                if (questions[action]) {
                    const answer = await ask(questions[action]);
                    if (answer !== null) {
                        const value = answer.trim();
                        if (action === "title" && value) field.title = value;
                        if (action === "key" && value) field.key = value.replace(/[^\w]/g, "").toLowerCase() || field.key;
                        if (action === "placeholder") field.placeholder = value;
                        if (action === "empty") field.empty = value || "-";
                        if (action === "default") field.default = value;
                        if (action === "min" || action === "max") {
                            const length = parseInt(value, 10);
                            if (!Number.isNaN(length) && length >= 0 && length <= 4000) {
                                if (action === "min") field.minLength = length;
                                else field.maxLength = length;
                            }
                        }
                        save();
                    }
                }
                return refresh();
            }
        });

        collector.on("end", (_collected, reason) => {
            if (reason === "deleted") return;
            embedMessage?.delete().catch(() => null);
            panel.edit({ components: render().slice(0, 1), flags: MessageFlags.IsComponentsV2 }).catch(() => null);
        });

        /**
         * Editeur d'embed : collector propre au message séparé.
         */
        function attachEmbedCollector() {
            const target = embedMessage;
            const embedCollector = target.createMessageComponentCollector({ time: 15 * 60 * 1000 });

            const pushHistory = (data) => {
                embedHistory = embedHistory.slice(0, embedIndex + 1);
                embedHistory.push(data);
                embedIndex = embedHistory.length - 1;
            };

            const refreshEmbed = () => target.edit(
                buildEmbedEditor(embedHistory[embedIndex], db.color, embedIndex, embedHistory.length)
            ).catch(() => null);

            embedCollector.on("collect", async interaction => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 }).catch(() => null);
                }

                await interaction.deferUpdate().catch(() => null);
                const id = interaction.customId;

                if (id === "cst:embed:undo") { if (embedIndex > 0) embedIndex--; return refreshEmbed(); }
                if (id === "cst:embed:redo") { if (embedIndex < embedHistory.length - 1) embedIndex++; return refreshEmbed(); }

                if (id === "cst:embed:delete") {
                    embedCollector.stop();
                    target.delete().catch(() => null);
                    if (embedMessage === target) embedMessage = null;
                    return refresh();
                }

                if (id === "cst:embed:validate") {
                    const data = embedHistory[embedIndex];
                    if (embedTarget === null) custom.embeds.push(data);
                    else custom.embeds[embedTarget] = data;
                    save();

                    embedCollector.stop();
                    target.delete().catch(() => null);
                    if (embedMessage === target) embedMessage = null;
                    return refresh();
                }

                if (id !== "cst:embed:menu") return;

                const data = structuredClone(embedHistory[embedIndex]);
                const choice = interaction.values[0];

                const single = {
                    "1": [ASK.embedTitle, value => { data.title = value; }],
                    "2": [ASK.embedDescription, value => { data.description = value; }],
                    "3": [ASK.embedAuthor, value => { data.author = { name: value }; }],
                    "4": [ASK.embedFooter, value => { data.footer = { text: value }; }],
                    "5": [ASK.embedThumbnail, value => { data.thumbnail = value; }],
                    "7": [ASK.embedImage, value => { data.image = value; }],
                    "8": [ASK.embedUrl, value => { data.url = value; }],
                    "9": [ASK.embedColor, value => { data.color = parseColor(value); }]
                };

                if (choice === "6") {
                    data.timestamp = data.timestamp ? null : new Date().toISOString();
                    pushHistory(data);
                    return refreshEmbed();
                }

                if (single[choice]) {
                    const [question, apply] = single[choice];
                    const answer = await ask(question);
                    if (answer !== null) {
                        apply(answer.trim());
                        pushHistory(data);
                    }
                    return refreshEmbed();
                }

                if (choice === "10") {
                    const name = await ask(ASK.embedFieldTitle);
                    if (name === null) return refreshEmbed();
                    const value = await ask(ASK.embedFieldDescription);
                    if (value === null) return refreshEmbed();

                    data.fields ??= [];
                    data.fields.push({ name: name.trim().slice(0, 256), value: value.trim().slice(0, 1024), inline: false });
                    pushHistory(data);
                    return refreshEmbed();
                }

                if (choice === "11") {
                    const answer = await ask(ASK.embedFieldDelete);
                    const index = parseInt(answer ?? "", 10) - 1;
                    if (!Number.isNaN(index) && data.fields?.[index]) {
                        data.fields.splice(index, 1);
                        pushHistory(data);
                    }
                    return refreshEmbed();
                }

                if (choice === "12") {
                    const answer = await ask(ASK.embedCopy);
                    const messageId = answer?.trim().match(/\d{17,20}/)?.[0];
                    if (!messageId) return refreshEmbed();

                    const copied = await message.channel.messages.fetch(messageId).catch(() => null);
                    const source = copied?.embeds?.[0];
                    if (!source) {
                        await warn("Ce message ne contient aucun embed à copier");
                        return refreshEmbed();
                    }

                    pushHistory({
                        title: source.title ?? undefined,
                        description: source.description ?? undefined,
                        color: source.color ?? undefined,
                        url: source.url ?? undefined,
                        image: source.image?.url,
                        thumbnail: source.thumbnail?.url,
                        author: source.author ? { name: source.author.name, iconURL: source.author.iconURL } : undefined,
                        footer: source.footer ? { text: source.footer.text, iconURL: source.footer.iconURL } : undefined,
                        fields: source.fields ?? []
                    });
                    return refreshEmbed();
                }
            });
        }
    },

    // Exposé pour `verifier/customVerify.js`, qui rejoue chaque écran hors ligne
    // et le compare au relevé de la sonde.
    views: {
        normalizeCustom,
        defaultButton,
        defaultSelect,
        defaultSelectOption,
        defaultFormField,
        defaultAdvancedItem,
        buildMainView,
        buildMessagesView,
        buildEmbedsView,
        buildStickersView,
        buildRolesView,
        buildUserFilterView,
        buildReactionsView,
        buildCooldownView,
        buildComponentsView,
        buildButtonView,
        buildSelectView,
        buildSelectOptionView,
        buildAdvancedView,
        buildAdvancedItemView,
        buildFormView,
        buildFormFieldView,
        buildEmbedEditor
    }
};
