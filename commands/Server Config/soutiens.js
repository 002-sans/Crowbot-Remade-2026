const { Client, Message, ContainerBuilder, SectionBuilder, TextDisplayBuilder, ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");

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

function buildSoutienContainer(db) {
    const soutiens = db.soutiens || {};
    const colorInt = parseColor(db.color);

    const tagRole = soutiens.tag_role || null;
    const statusRole = soutiens.role || null;
    const acceptInvites = Boolean(soutiens.accept_invites);
    const onlyStatus = Boolean(soutiens.only_status);
    const texts = Array.isArray(soutiens.text) ? soutiens.text : [];
    const blRoles = Array.isArray(soutiens.blroles) ? soutiens.blroles : [];

    const container = new ContainerBuilder()
        .setAccentColor(colorInt)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("## Rôles soutien"),
            new TextDisplayBuilder().setContent("**Rôle tag**")
        )
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId("soutien_tag_role")
                    .setMinValues(0)
                    .setMaxValues(1)
                    .setDefaultRoles(tagRole ? [tagRole] : [])
            )
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("**Rôle statut**")
        )
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId("soutien_status_role")
                    .setMinValues(0)
                    .setMaxValues(1)
                    .setDefaultRoles(statusRole ? [statusRole] : [])
            )
        )
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Prendre en compte les invitations en statut**"))
                .setButtonAccessory(
                    new ButtonBuilder()
                        .setCustomId("soutien_toggle_invites")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji({ name: acceptInvites ? "✅" : "❌" })
                ),
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Prendre en compte seulement les statuts contenant uniquement le message/lien**"))
                .setButtonAccessory(
                    new ButtonBuilder()
                        .setCustomId("soutien_toggle_only_status")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji({ name: onlyStatus ? "✅" : "❌" })
                ),
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Messages acceptés dans les statuts**"))
                .setButtonAccessory(
                    new ButtonBuilder()
                        .setCustomId("soutien_add_message")
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel("Ajouter un message")
                )
        );

    if (texts.length === 0) {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent("-# Aucun message configuré"));
    } else {
        for (let i = 0; i < texts.length; i++) {
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`- ${texts[i]}`))
                    .setButtonAccessory(
                        new ButtonBuilder()
                            .setCustomId(`soutien_del_msg_${i}`)
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji({ name: "🗑" })
                    )
            );
        }
    }

    container
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Rôles interdits**"))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId("soutien_bl_roles")
                    .setMinValues(0)
                    .setMaxValues(25)
                    .setDefaultRoles(blRoles)
            )
        );

    return [container];
}

module.exports = {
    name: "soutien",
    description: "Permet de récompenser les personnes qui soutiennent le serveur",
    category: "Configuration du serveur",
    aliases: ["soutiens"],
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
        db.soutiens ??= {};
        db.soutiens.tag_role ??= null;
        db.soutiens.role ??= null;
        db.soutiens.accept_invites ??= false;
        db.soutiens.only_status ??= false;
        db.soutiens.text ??= [];
        db.soutiens.blroles ??= [];
        client.save(message.guildId);

        const components = buildSoutienContainer(db);

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
                return interaction.reply({ content: "Vous ne pouvez pas utiliser ce menu", flags: 64 });
            }

            const soutiens = db.soutiens;
            const id = interaction.customId;

            if (id === "soutien_tag_role") {
                soutiens.tag_role = interaction.values[0] || null;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildSoutienContainer(db)
                }).catch(() => null);
            }

            if (id === "soutien_status_role") {
                soutiens.role = interaction.values[0] || null;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildSoutienContainer(db)
                }).catch(() => null);
            }

            if (id === "soutien_bl_roles") {
                soutiens.blroles = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildSoutienContainer(db)
                }).catch(() => null);
            }

            if (id === "soutien_toggle_invites") {
                soutiens.accept_invites = !soutiens.accept_invites;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildSoutienContainer(db)
                }).catch(() => null);
            }

            if (id === "soutien_toggle_only_status") {
                soutiens.only_status = !soutiens.only_status;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildSoutienContainer(db)
                }).catch(() => null);
            }

            if (id === "soutien_add_message") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Quel message ou lien souhaitez-vous ajouter aux statuts acceptés ?");
                const responses = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000 });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    const txt = resp.content.trim();
                    if (txt && !soutiens.text.includes(txt)) {
                        soutiens.text.push(txt);
                        client.save(message.guildId);
                    }
                    resp.delete().catch(() => null);
                }
                return sentMessage.edit({
                    components: buildSoutienContainer(db)
                }).catch(() => null);
            }

            if (id.startsWith("soutien_del_msg_")) {
                const idx = parseInt(id.replace("soutien_del_msg_", ""), 10);
                if (!isNaN(idx) && soutiens.text[idx] !== undefined) {
                    soutiens.text.splice(idx, 1);
                    client.save(message.guildId);
                }
                await interaction.deferUpdate().catch(() => null);
                return sentMessage.edit({
                    components: buildSoutienContainer(db)
                }).catch(() => null);
            }
        });
    }
};
