const { Client, Message, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ChannelType } = require("discord.js");

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

function buildTwitchEmbed(db, guild) {
    const twitch = db.twitch || {};
    const color = parseColor(db.color);

    const isActif = Boolean(twitch.actif);
    const messageContent = twitch.message || "{MemberMention} est en live: {LiveLink}";
    const embedContent = twitch.embed ? "Embed personnalisé" : "Aucun embed";
    const channelContent = twitch.channel && guild.channels.cache.get(twitch.channel)
        ? `<#${twitch.channel}>`
        : "Aucun";
    const rolesContent = Array.isArray(twitch.roles) && twitch.roles.length > 0
        ? twitch.roles.filter(id => guild.roles.cache.has(id)).map(id => `<@&${id}>`).join(', ') || "Aucun"
        : "Aucun";

    return new EmbedBuilder()
        .setTitle("Paramètre des alertes Twitch")
        .setColor(color)
        .setDescription("Arguments spéciaux\n```prolog\nNom du streamer: {MemberTwitchName}\nPDP du streamer: {MemberTwitchPic}\nTitre du live: {LiveTitle}\nImage du live: {LivePic}\nJeu du live: {LiveGame}\nLien du live: {LiveLink}\n```")
        .addFields(
            { name: "Alertes activée", value: isActif ? "✅" : "❌", inline: true },
            { name: "Message", value: messageContent, inline: true },
            { name: "Embed", value: embedContent, inline: true },
            { name: "Salon", value: channelContent, inline: true },
            { name: "Rôles streamer", value: rolesContent, inline: true }
        );
}

function buildTwitchMenu() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("twitch_menu")
            .setPlaceholder("Paramètres des alertes Twitch")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                { label: "Activer/désactiver les alertes", value: "1", emoji: { name: "📣" } },
                { label: "Modifier le message", value: "2", emoji: { name: "💬" } },
                { label: "Modifier l'embed", value: "3", emoji: { name: "🗳" } },
                { label: "Modifier le salon", value: "4", emoji: { name: "🏷" } },
                { label: "Modifier les rôles streamer", value: "5", emoji: { name: "⛓" } }
            ])
    );
}

module.exports = {
    name: "twitch",
    description: "Permet de régler des alertes lorsque des membres du serveur sont en live sur Twitch",
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
        db.twitch ??= {};
        db.twitch.actif ??= false;
        db.twitch.message ??= "{MemberMention} est en live: {LiveLink}";
        db.twitch.embed ??= null;
        db.twitch.channel ??= null;
        db.twitch.roles ??= [];
        client.save(message.guildId);

        const embed = buildTwitchEmbed(db, message.guild);
        const row = buildTwitchMenu();

        const msg = await message.channel.send({ embeds: [embed], components: [row] });
        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 10 * 60 * 1000
        });

        collector.on('end', () => msg.edit({ components: [] }).catch(() => null));

        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 });
            }

            if (interaction.customId === "twitch_channel_select") {
                db.twitch.channel = interaction.values[0] || null;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildTwitchEmbed(db, message.guild)],
                    components: [buildTwitchMenu()]
                }).catch(() => null);
            }

            if (interaction.customId === "twitch_role_select") {
                db.twitch.roles = interaction.values || [];
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildTwitchEmbed(db, message.guild)],
                    components: [buildTwitchMenu()]
                }).catch(() => null);
            }

            const val = interaction.values?.[0];

            if (val === "1") {
                db.twitch.actif = !db.twitch.actif;
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildTwitchEmbed(db, message.guild)],
                    components: [buildTwitchMenu()]
                }).catch(() => null);
            }

            if (val === "2") {
                await interaction.deferUpdate().catch(() => null);
                const q = await message.channel.send("Quel sera le nouveau message d'alerte Twitch ?");
                const responses = await message.channel.awaitMessages({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 60000
                });
                q.delete().catch(() => null);
                if (responses.size > 0) {
                    const resp = responses.first();
                    db.twitch.message = resp.content.trim();
                    resp.delete().catch(() => null);
                    client.save(message.guildId);
                }
                return msg.edit({
                    embeds: [buildTwitchEmbed(db, message.guild)],
                    components: [buildTwitchMenu()]
                }).catch(() => null);
            }

            if (val === "3") {
                db.twitch.embed = db.twitch.embed ? null : { enabled: true };
                client.save(message.guildId);
                await interaction.deferUpdate().catch(() => null);
                return msg.edit({
                    embeds: [buildTwitchEmbed(db, message.guild)],
                    components: [buildTwitchMenu()]
                }).catch(() => null);
            }

            if (val === "4") {
                await interaction.deferUpdate().catch(() => null);
                const channelRow = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("twitch_channel_select")
                        .setChannelTypes([ChannelType.GuildText, ChannelType.GuildAnnouncement])
                        .setPlaceholder("Veuillez choisir un salon pour les alertes")
                        .setMinValues(1)
                        .setMaxValues(1)
                );
                return msg.edit({ components: [channelRow] }).catch(() => null);
            }

            if (val === "5") {
                await interaction.deferUpdate().catch(() => null);
                const roleRow = new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("twitch_role_select")
                        .setPlaceholder("Veuillez choisir les rôles streamer")
                        .setMinValues(0)
                        .setMaxValues(25)
                );
                return msg.edit({ components: [roleRow] }).catch(() => null);
            }
        });
    }
};
