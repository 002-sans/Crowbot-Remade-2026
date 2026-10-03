const { Client, Message, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "embed",
    description: "Envoie un panel pour crée un embed",
    category: "Gestion",
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
        const embedBuilderActionRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("embedbuilder")
                .setPlaceholder("Choisissez une option")
                .addOptions([
                    {
                        label: "Modifier le Titre",
                        value: "embedtitle",
                        emoji: "📝"
                    }, {
                        label: "Modifier la Description",
                        value: "embeddescription",
                        emoji: "💬"
                    }, {
                        label: "Modifier l'Auteur",
                        value: "embedauthor",
                        emoji: "🕵️‍♂️"
                    }, {
                        label: "Modifier le Footer",
                        value: "embedfooter",
                        emoji: "🔻"
                    }, {
                        label: "Modifier le Thumbnail",
                        value: "embedthumbnail",
                        emoji: "🔳"
                    }, {
                        label: "Modifier le Timestamp",
                        value: "embedtimestamp",
                        emoji: "🕙"
                    }, {
                        label: "Modifier l'Image",
                        value: "embedimage",
                        emoji: "🖼"
                    }, {
                        label: "Modifier l'URL",
                        value: "embedurl",
                        emoji: "🌐"
                    }, {
                        label: "Modifier la Couleur",
                        value: "embedcolor",
                        emoji: "🔴"
                    }
                ]
            )
        )
        
        const embed = new EmbedBuilder({color: 0x0000FF, description: "\u200B"})

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("embedsend")
                .setLabel("Envoyer l'embed")
                .setStyle(1)
                .setEmoji("✅")
        )

        const msg = await message.channel.send({ embeds: [embed], components: [embedBuilderActionRow, actionRow]})
        const collector = msg.createMessageComponentCollector({ time: 1000 * 60 * 10 });

        collector.on("collect", async i => {
            if (i.user.id !== message.author.id) 
                return i.reply({content: "Vous ne pouvez pas utiliser cette interaction", flags: 64})
            
            i.deferUpdate().catch(() => null)

            if(i.customId == "embedbuilder") {
                if(i.values[0] == "embedtitle") {
                    await edit(msg, embed, true)

                    let question = await message.channel.send({ content: "Veuillez saisir le titre de l'embed" })
                    let collected = await question.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1 })
                    let msgg = collected.first()
                    
                    question.delete().catch(() => null)
                    msgg.delete().catch(() => null)
                    
                    embed.setTitle(msgg.content)
                    await edit(msg, embed)
                }
                if(i.values[0] == "embeddescription") {
                    await edit(msg, embed, true)

                    let question = await message.channel.send({ content: "Veuillez saisir la description de l'embed" })
                    let collected = await question.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1 })
                    let msgg = collected.first()
                    question.delete().catch(() => null)
                    msgg.delete().catch(() => null)
                    
                    embed.setDescription(msgg.content)
                    await edit(msg, embed)
                }
                if(i.values[0] == "embedauthor") {
                    await edit(msg, embed, true)

                    let question = await message.channel.send({ content: "Veuillez saisir l'auteur de l'embed" })
                    let collected = await question.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1 })
                    let msgg = collected.first()
                    
                    question.delete().catch(() => null)
                    msgg.delete().catch(() => null)
                    
                    embed.setAuthor(msgg.content)
                    await edit(msg, embed)  
                }
                if(i.values[0] == "embedfooter") {
                    await edit(msg, embed, true)

                    let question = await message.channel.send({ content: "Veuillez saisir le footer de l'embed" })
                    let collected = await question.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1 })
                    let msgg = collected.first()

                    question.delete().catch(() => null)
                    msgg.delete().catch(() => null)
                    
                    embed.setFooter(msgg.content)
                    await edit(msg, embed)
                }
                if(i.values[0] == "embedthumbnail") {
                    await edit(msg, embed, true)

                    var yx = await message.channel.send({ content: "Quel sera le **Thumnail** de l'embed ?" })
                    let collected = await  message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000, errors: ["time"] })
                    var a;

                    if (collected.first().attachments.size > 0) {
                        const at = collected.first().attachments.first()
                        a = at.url
                    } else if (/^https?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg|svg)\??.*$/gmi.test(collected.first().content) === true) {
                        a = collected.first().content
                    } else {
                        a = false
                    }

                    collected.first().delete().catch(() => null)
                    yx.delete().catch(() => null)

                    if (a === false) {
                        return message.channel.send({ content: "L'image voulue est Invalide." }).then(m => setTimeout(() => m.delete().catch(() => null), 5000))
                    } else if (a !== false) {
                        embed.setThumbnail(a.toString());
                        await edit(msg, embed)
                    }
                }
                if (i.values[0] == "embedtimestamp") {
                    embed.setTimestamp(Date.now())
                    await edit(msg, embed)   
                }
                if(i.values[0] == "embedimage") {
                    await edit(msg, embed, true)

                    var yx = await message.channel.send({ content: "Quelle sera l'**Image** de l'embed ?" })
                    let collected = await  message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000, errors: ["time"] })
                    var a;

                    if (collected.first().attachments.size > 0) {
                        const at = collected.first().attachments.first()
                        a = at.url
                    } else if (/^https?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg|svg)\??.*$/gmi.test(collected.first().content) === true) {
                        a = collected.first().content
                    } else {
                        a = false
                    }

                    collected.first().delete().catch(() => null)
                    yx.delete().catch(() => null)

                    if (a === false) {
                        return message.channel.send({ content: "L'image voulue est Invalide." }).then(m => setTimeout(() => m.delete().catch(() => null), 5000))
                    } else if (a !== false) {
                        embed.setImage(a.toString());
                        await edit(msg, embed)
                    }
                }
                if (i.values[0] == "embedurl") {
                    await edit(msg, embed, true)

                    let question = await message.channel.send({ content: "Veuillez saisir l'URL de l'embed" })
                    let collected = await question.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1 })
                    let msgg = collected.first()

                    question.delete().catch(() => null)
                    msgg.delete().catch(() => null)

                    embed.setURL(msgg.content)
                    await edit(msg, embed)
                }
                if (i.values[0] == "embedcolor") {
                    await edit(msg, embed, true)

                    let question = await message.channel.send({ content: "Veuillez saisir la couleur de l'embed" })
                    let collected = await question.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1 })
                    let msgg = collected.first()

                    question.delete().catch(() => null)
                    msgg.delete().catch(() => null)

                    embed.setColor(msgg.content)
                    await edit(msg, embed)
                }
            
            }

            if (i.customId == "embedsend") {
                await edit(msg, embed, true)
                let question = await message.channel.send({ content: "Dans quel channel voulez-vous envoyer l'embed?" })
                let collected = await question.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1 })
                let msgg = collected.first()
                let channel = message.guild.channels.cache.get(msgg.content) || msgg.mentions.channels.first() 
                
                question.delete().catch(() => null)
                msgg.delete().catch(() => null)
                await edit(msg, embed)

                if (!channel) message.channel.send(`Aucun salon de trouvé pour \`${msgg.content || "rien"}\``).then(m => setTimeout(() => m.delete().catch(() => null), 5000))
                
                
                channel.send({ embeds: [embed]})
                    .then( () => message.channel.send(`L'embed a été envoyé dans le salon ${channel}`))
                    .catch(() => message.channel.send(`Je n'ai pas pu envoyé l'embed dans ${channel}`))
            }
        })
    }
}

async function edit(msg, embed, disabled){
    const embedBuilderActionRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("embedbuilder")
            .setDisabled(disabled ?? false)
            .setPlaceholder("Choisissez une option")
            .addOptions([
                {
                    label: "Modifier le Titre",
                    value: "embedtitle",
                    emoji: "📝"
                }, {
                    label: "Modifier la Description",
                    value: "embeddescription",
                    emoji: "💬"
                }, {
                    label: "Modifier l'Auteur",
                    value: "embedauthor",
                    emoji: "🕵️‍♂️"
                }, {
                    label: "Modifier le Footer",
                    value: "embedfooter",
                    emoji: "🔻"
                }, {
                    label: "Modifier le Thumbnail",
                    value: "embedthumbnail",
                    emoji: "🔳"
                }, {
                    label: "Modifier le Timestamp",
                    value: "embedtimestamp",
                    emoji: "🕙"
                }, {
                    label: "Modifier l'Image",
                    value: "embedimage",
                    emoji: "🖼"
                }, {
                    label: "Modifier l'URL",
                    value: "embedurl",
                    emoji: "🌐"
                }, {
                    label: "Modifier la Couleur",
                    value: "embedcolor",
                    emoji: "🔴"
                }
            ]
        )
    )
    
    var actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("embedsend")
        .setLabel("Envoyer l'embed")
        .setStyle(1)
        .setEmoji("✅")
    )

    if (msg) msg.edit({ embeds: [embed], components: [embedBuilderActionRow, actionRow]})
}