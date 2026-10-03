const { Client, Message, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, Guild, ActivityType } = require("discord.js");
const data = {};
module.exports = {
    name: "counters",
    description: "Envoie un panel pour gérer les counters du serveur",
    category: "Configuration du serveur",
    aliases: ["counter", "compteur", "compteurs"],
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
        if (!db.counters) {
            db.counters = [];
            client.save(message.guildId);
        }
        let i = 1;

        const embed = new EmbedBuilder()
        .setTitle('Paramètres des Counters')
        .setColor(db.color);
    
        const men = new StringSelectMenuBuilder()
        .setCustomId('menu')
        .setMaxValues(1)
        .setMinValues(1)
        .setPlaceholder("Veuillez choisir une option")
        .addOptions(
            { label: "Ajouter un counter", value: "addchannel", emoji: "➕" },
            { label: "Supprimer un counter", value: "removechannel", emoji: "➖" }
        )

        for (const object of db.counters){
            const channel   = message.guild.channels.cache.get(object.id)
            
            if (!channel) { 
                db.counters = db.counters.filter(c => c?.id !== object.id); 
                client.save(message.guildId); 
                continue;
            }

            embed.addFields({ name: `Counter ${i}`, value: `**Salon:** ${channel}\n\`${replaceText(object.name, message.guild)}\`` })
            i++
        }
    
        const row = new ActionRowBuilder().addComponents(men);
        const msg = await message.channel.send({ embeds: [embed], components: [row] });
        const collector = msg.createMessageComponentCollector({ time: 1000 * 60 * 10});
    
        collector.on('end', () => msg.edit({ components: [] }));
        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) 
                return interaction.reply({content: "Vous ne pouvez pas utiliser ce menu", flags: 64})
            
            interaction.deferUpdate().catch(() => null)


            if (interaction.customId == "channel"){
                const embed = new EmbedBuilder()
                    .setDescription(`Quel sera le nom du counter ?\n\`${db.prefix}variables\` pour afficher les variables du bot`)
                    .setColor(db.color)

                const row = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("channel")
                        .setChannelTypes(ChannelType.GuildCategory)
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setPlaceholder("Veuillez choisir un salon")
                        .setDisabled(true)
                    )

                msg.edit({ embeds: [embed], components: [row] })
                const collect = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 1000 * 60 * 5 })
                if (!collect || !collect.first().content) 
                    return menu(client, message, msg);

                collect.first().delete().catch(() => null)
                db.counters.push({ id: interaction.values[0], name: collect.first().content, guildId: message.guildId })
                client.save(message.guildId)
                menu(client, message, msg)

                const channel = message.guild.channels.cache.get(interaction.values[0])
                if (channel && channel.manageable) channel.setName(replaceText(collect.first().content, message.guild))
            }

            if (interaction.customId == "delchannel"){
                if (!db.counters.find(c => c?.id === interaction.values[0])) return interaction.reply({content: "Ce salon n'est pas un salon counter", flags: 64})
                db.counters = db.counters.filter(c => c?.id !== interaction.values[0])
                client.save(message.guildId)
                menu(client, message, msg)
            }

            switch(interaction.values[0]){
                case "addchannel":
                    const embed2 = new EmbedBuilder()
                        .setDescription("Veuillez choisir un salon pour en faire un counter")
                        .setColor(db.color)

                    const row2 = new ActionRowBuilder().addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId("channel")
                            .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildText])
                            .setMinValues(1)
                            .setMaxValues(1)
                            .setPlaceholder("Veuillez choisir un salon")
                    )

                    msg.edit({ embeds: [embed2], components: [row2] })
                    break

                case "removechannel":
                    const embed3 = new EmbedBuilder()
                        .setDescription("Veuillez choisir un salon")
                        .setColor(db.color)
    
                    const row3 = new ActionRowBuilder().addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId("delchannel")
                            .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildText])
                            .setMinValues(1)
                            .setMaxValues(1)
                            .setPlaceholder("Veuillez choisir un salon")
                    )
    
                    msg.edit({embeds: [embed3], components: [row3]})
                    break
            }
        })
    }
}

function menu(client, message, msg){
    const db = client.get(message.guildId)
    let i = 1

    const embed = new EmbedBuilder()
        .setTitle('Paramètres des Counters')
        .setColor(db.color)
    
    const men = new StringSelectMenuBuilder()
        .setCustomId('menu')
        .setMaxValues(1)
        .setMinValues(1)
        .setPlaceholder("Veuillez choisir une option")
        .addOptions(
        { label: "Ajouter un counter", value: "addchannel", emoji: "➕" },
        { label: "Supprimer un counter", value: "removechannel", emoji: "➖" }
    )

    for (const object of db.counters){            
        const channel   = message.guild.channels.cache.get(object.id)
            
        if (!channel) { 
            db.counters = db.counters.filter(c => c?.id !== object.id); 
            client.save(message.guildId); 
            continue;
        }

        embed.addFields({ name: `Counter ${i}`, value: `**Salon:** ${channel}\n\`${replaceText(object.name, message.guild)}\`` })
        i++
    }
    
    const row = new ActionRowBuilder().addComponents(men);
    if (msg) msg.edit({embeds: [embed], components: [row]})
}

/**
 * @param {string[]} text
 * @param {Guild} guild
*/

function replaceText(text, guild) {
    if (!text) return false;

    let text2 = text
        .replaceAll('{memberCount}', guild.memberCount)
        .replaceAll('{humainCount}', guild.members.cache.filter(m => !m.user.bot).size)
        .replaceAll('{botCount}', guild.members.cache.filter(m => m.user.bot).size)
        .replaceAll('{channelCount}', guild.channels.cache.size)
        .replaceAll('{textCount}', guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size)
        .replaceAll('{voiceCount}', guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size)
        .replaceAll('{roleCount}', guild.roles.cache.size)
        .replaceAll('{emoteCount}', guild.emojis.cache.size)
        .replaceAll('{stickerCount}', guild.stickers.cache.size)
        .replaceAll('{onlineCount}', guild.members.cache.filter(m => m.presence && m.presence.status !== "invisible" && m.presence.status !== "offline").size)
        .replaceAll('{offlineCount}', guild.members.cache.filter(m => !m.presence || m.presence.status === "invisible" || m.presence.status === "offline").size)
        .replaceAll('{dndCount}', guild.members.cache.filter(m => (m.presence ?? {}).status === "dnd").size)
        .replaceAll('{idleCount}', guild.members.cache.filter(m => (m.presence ?? {}).status === "idle").size)
        .replaceAll('{streamCount}', guild.members.cache.filter(m => m.presence?.activities?.some(a => a.type === ActivityType.Streaming)).size)
        .replaceAll('{vocCount}', guild.members.cache.filter(m => m.voice.channel).size)
        .replaceAll('{muteCount}', guild.members.cache.filter(m => m.voice.mute).size)
        .replaceAll('{deafCount}', guild.members.cache.filter(m => m.voice.deaf).size)
        .replaceAll('{webcamCount}', guild.members.cache.filter(m => m.voice.selfVideo).size)
        .replaceAll('{streamingCount}', guild.members.cache.filter(m => m.voice.streaming).size)
        .replaceAll('{ServerBoostsCount}', guild.premiumSubscriptionCount || 0)
        .replaceAll('{ServerLevel}', guild.premiumTier || "0");

    guild.roles.cache.forEach(role => {
        text2 = text2.replaceAll(`{hasRole/${role.id}}`, guild.members.cache.filter(m => m.roles.cache.has(role.id)).size);
        text2 = text2.replaceAll(`{noRole/${role.id}}`, guild.members.cache.filter(m => !m.roles.cache.has(role.id)).size);
    });
    return text2;
}
