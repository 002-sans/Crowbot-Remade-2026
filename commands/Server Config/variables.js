const { Client, Message, EmbedBuilder, ChannelType, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "variables",
    description: "Affiche les variables du bot",
    category: "Configuration du serveur",
    aliases: ["vars", "variable"],
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

        const counter = new EmbedBuilder()
            .setTitle("Variables Counters")
            .setColor(db.color)
            .addFields(
                { name: "`{memberCount}`",    value: `*Affiche le nombre de membres du serveur*\n**Exemple:** \`${message.guild.memberCount}\``, inline: true },
                { name: "`{humainCount}`",    value: `*Affiche le nombre de membres humain*\n**Exemple:** \`${message.guild.members.cache.filter(m => !m.user.bot).size}\``, inline: true },
                { name: "`{botCount}`",       value: `*Affiche le nombre de bots du serveur*\n**Exemple:** \`${message.guild.members.cache.filter(m => m.user.bot).size}\``, inline: true },
                { name: "`{channelCount}`",   value: `*Affiche le nombre de salons du serveur*\n**Exemple:** \`${message.guild.channels.cache.size}\``, inline: true },
                { name: "`{textCount}`",      value: `*Affiche le nombre de salons textuels du serveur*\n**Exemple:** \`${message.guild.channels.cache.filter(c => c.type == ChannelType.GuildText).size}\``, inline: true },
                { name: "`{voiceCount}`",     value: `*Affiche le nombre de salons vocaux du serveur*\n**Exemple:** \`${message.guild.channels.cache.filter(c => c.type == ChannelType.GuildVoice).size}\``, inline: true },
                { name: "`{roleCount}`",      value: `*Affiche le nombre de rôles du serveur*\n**Exemple:** \`${message.guild.roles.cache.size}\``, inline: true },
                { name: "`{emoteCount}`",     value: `*Affiche le nombre d'emojis du serveur*\n**Exemple:** \`${message.guild.emojis.cache.size}\``, inline: true },
                { name: "`{stickerCount}`",   value: `*Affiche le nombre de stickers du serveur*\n**Exemple:** \`${message.guild.stickers.cache.size}\``, inline: true },
                { name: "`{onlineCount}`",    value: `*Affiche le nombre de membes connectés*\n**Exemple:** \`${message.guild.members.cache.filter(m => m.presence && m.presence.status !== "invisible" && m.presence.status !== "offline").size}\``, inline: true },
                { name: "`{idleCount}`",      value: `*Affiche le nombre de membres inactifs*\n**Exemple:** \`${message.guild.members.cache.filter(m => (m.presence ?? {}).status === "idle").size}\``, inline: true },
                { name: "`{dndCount}`",       value: `*Affiche le nombre de membres en ne pas déranger*\n**Exemple:** \`${message.guild.members.cache.filter(m => (m.presence ?? {}).status === "dnd").size}\``, inline: true },
                { name: "`{offlineCount}`",   value: `*Affiche le nombre de membres hors ligne*\n**Exemple:** \`${message.guild.members.cache.filter(m => !m.presence || m.presence.status === "invisible" || m.presence.status === "offline").size}\``, inline: true },
                { name: "`{streamCount}`",    value: `*Affiche le nombre de membres qui Stream sur twitch*\n**Exemple:** \`${message.guild.members.cache.filter(m => m.presence?.activities?.some(a => a.type === ActivityType.Streaming)).size}\``, inline: true },
                { name: "`{vocCount}`",       value: `*Affiche le nombre de membres connectés en vocal*\n**Exemple:** \`${message.guild.members.cache.filter(m => m.voice.channel).size}\``, inline: true },
                { name: "`{muteCount}`",      value: `*Affiche le nombre de membres mutes en vocal*\n**Exemple:** \`${message.guild.members.cache.filter(m => m.voice.mute).size}\``, inline: true },
                { name: "`{deafCount}`",      value: `*Affiche le nombre de membres avec le casque coupé*\n**Exemple:** \`${message.guild.members.cache.filter(m => m.voice.deaf).size}\``, inline: true },
                { name: "`{webcamCount}`",    value: `*Affiche le nombre de membres avec la caméra activée*\n**Exemple:** \`${message.guild.members.cache.filter(m => m.voice.selfVideo).size}\``, inline: true },
                { name: "`{streamingCount}`", value: `*Affiche le nombre de membres en partage d'écran*\n**Exemple:** \`${message.guild.members.cache.filter(m => m.voice.streaming).size}\``, inline: true },
                { name: "`{hasRole/ROLEID}`", value: `*Affiche le nombre de membres possédant un rôle*\n**Exemple:** \`{hasRole/${message.guild.roles.cache.random().id}}\``, inline: true },
                { name: "`{noRole/ROLEID}`",  value: `*Affiche le nombre de membres ne possédant pas un rôle*\n**Exemple:** \`{noRole/${message.guild.roles.cache.random().id}}\``, inline: true },
            )

        const joinsettings = new EmbedBuilder()
            .setTitle("Variables de Join/Leave Settings")
            .setColor(db.color)
            .addFields(
                { name: "`{memberMention}`", value: `*Envoie la mention du membre*\n**Exemple:** ${message.member}`, inline: true },
                { name: "`{memberName}`", value: `*Envoie le pseudo du membre*\n**Exemple:** \`${message.author.username}\``, inline: true },
                { name: "`{MemberDisplayName}`", value: `*Envoie le pseudo affiche du membre*\n**Exemple:** \`${message.author.displayName}\``, inline: true },
                { name: "`{MemberJoinedAt}`", value: `*Envoie la date d'arrivée du membre*\n**Exemple:** <t:${Math.round(message.member.joinedTimestamp / 1000)}:d>`, inline: true },
                { name: "`{MemberCreatedAt}`", value: `*Envoie la date de création du compte du membre*\n**Exemple:** <t:${Math.round(message.author.createdTimestamp / 1000)}:d>`, inline: true },
                { name: "`{MemberID}`", value: `*Envoie l'ID du membre*\n**Exemple:** \`${message.author.id}\``, inline: true },
                { name: "`{MemberPic}`", value: `*Envoie le lien de l'icone du serveur*\n**Exemple:** \`${message.guild.iconURL() ?? "Pas d'icon"}\``, inline: true },
                { name: "`{ServerBoostsCount}`", value: `*Envoie le nombre de boosts du serveur*\n**Exemple:** \`${message.guild.premiumSubscriptionCount}\``, inline: true },
                { name: "`{ServerLevel}`", value: `*Envoie le niveau du serveur*\n**Exemple:** \`${message.guild.premiumTier ?? 0}\``, inline: true },
                { name: "`{ServerMembersCount}`", value: `*Envoie le nombre de membres du serveur*\n**Exemple:** \`${message.guild.memberCount}\``, inline: true },
                { name: "`{VocalMembersCount}`", value: `*Envoie le nombre de membres en vocal*\n**Exemple:** \`${message.guild.members.cache.filter(m => m.voice.channel).size}\``, inline: true },
                { name: "`{OnlineMembersCount}`", value: `*Envoie le nombre de membres en ligne*\n**Exemple:** \`${message.guild.members.cache.filter(m => m.presence?.status !== "offline" && m.presence?.status !== "invisible").size}\``, inline: true },
                { name: "`{OfflineMembersCount}`", value: `*Envoie le nombre de membres hors ligne*\n**Exemple:** \`${message.guild.members.cache.filter(m => m.presence?.status === "offline" && m.presence?.status === "invisible").size}\``, inline: true },
                { name: "`{ServerRolesCount}`", value: `*Envoie le nombre de rôles du serveur*\n**Exemple:** \`${message.guild.roles.cache.size}\``, inline: true },
                { name: "`{ServerChannelsCount}`", value: `*Envoie le nombre de salons du serveur*\n**Exemple:** \`${message.guild.channels.cache.size}\``, inline: true },
                { name: "`{InviterName}`", value: `*Envoie le pseudo du membre ayant fait l'invitation*\n**Exemple:** \`${message.author.displayName}\``, inline: true },
                { name: "`{InviterMention}`", value: `*Envoie la mention du membre ayant fait l'invitation*\n**Exemple:** ${message.member}`, inline: true },
                { name: "`{InviteCount}`", value: `*Envoie le nombre d'invitations effectuée*\n**Exemple:** \`1\``, inline: true },
            )
            
        createSimpleSlider(message, [ counter, joinsettings ])
            
    }
}


async function createSimpleSlider(message, embeds){
    let currentPage = 0;
    
    const fowardButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel("▶")
        .setCustomId('next-page')
        .setDisabled(embeds.length > 1 ? false : true);

    const backButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel("◀")
        .setCustomId('back-page')
        .setDisabled(embeds.length > 1 ? false : true);
        
    const interactiveButtons = new ActionRowBuilder().addComponents([backButton, fowardButton])
    const msg = await message.channel.send({ components: [interactiveButtons], embeds: [embeds[0]] });

    setTimeout(() =>  msg.edit({components: []}).catch(() => null), 1000 * 60 * 10);
    const collector = msg.createMessageComponentCollector();
    
    collector.on('collect', b => {
        if (b.user.id !== message.author.id) return b.reply({content: "Vous ne pouvez pas utiliser cette interaction", flags: 64})
        b.deferUpdate().catch(() => null);
        
        if (b.customId == 'next-page') {
            (currentPage + 1 == embeds.length ? currentPage = 0 : currentPage += 1);
            msg.edit({ embeds:[ embeds[currentPage]], components: [interactiveButtons] });
        }
        if (b.customId == 'back-page') {
            (currentPage - 1 < 0 ? currentPage = embeds.length - 1 : currentPage -= 1);
            msg.edit({ embeds: [embeds[currentPage]], components: [interactiveButtons] });
        }
    })
}