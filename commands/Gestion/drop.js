const { Client, Message, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js");
const data = {};

module.exports = {
    name: "drop",
    description: "Envoie un panel pour crée un drop",
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
        const db = client.get(message.guildId);

        const embed = new EmbedBuilder()
            .setTitle("Settings Drop")
            .setColor(db.color)
            .addFields({name: "Salon", value: `${message.guild.channels.cache.get(data[message.guild.id + "channel"]) ?? "`Aucun`"}`, inline: true})
            .addFields({name: "Prix", value: `\`${data[message.guild.id + "prix"] ?? "`Aucun`"}\``, inline: true})
            .addFields({name: "Titre du message", value: `\`${data[message.guild.id + "title"] ?? "🎉 **DROP** 🎉"}\``, inline: true})
            .addFields({name: "Description du message", value: `\`${data[message.guild.id + "description"] ?? "Réagis en premier avec 🎉 pour gagner le drop"}\``, inline: true})
            .addFields({name: "Réaction", value: `${data[message.guild.id + "reaction"] ? data[message.guild.id + "reaction"].startsWith("<") ? data[message.guild.id + "reaction"] : `\`${data[message.guild.id + "reaction"]}\`` : "`🎉`"}`, inline: true})
            .addFields({name: "Lanceur du drop", value: `${message.guild.members.cache.get(data[message.guild.id + "lanceur"]) ?? "`Non`"}`, inline: true})
    
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
            .setCustomId(message.id + "drop")
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder("Veuillez choisir une option")
            .setOptions([
                {
                    label: "Modifier le salon",
                    value: "channel"
                },
                {
                    label: "Modifier le prix à gagner",
                    value: "prix"
                },
                {
                    label: "Modifier le titre du message",
                    value: "title"
                },
                {
                    label: "Modifier la description du message",
                    value: "description"
                },
                {
                    label: "Modifier la réaction du drop",
                    value: "reaction"
                },
                {
                    label: "Modifier le nombre de gagnants",
                    value: "winners"
                },
                {
                    label: "Activer/désactiver le lanceur",
                    value: "onoff"
                },
                {
                    label: "Lancer le drop",
                    value: "send"
                }
            ])
        )

        const msg = await message.channel.send({embeds: [embed], components: [row]})
        const collector = await msg.createMessageComponentCollector({time: 1000 * 60 * 5})
        
        collector.on('end', () => msg.edit({ components: [] }));
        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) return interaction.reply({content: "Vous ne pouvez pas utiliser ce menu", flags: 64})
            await interaction.deferUpdate().catch(() => null)

            if (interaction.values[0] === "channel"){
                edit(client, message, msg, true)
                const question = await message.channel.send("Dans quel salon voulez vous envoyer le drop ?")
                const collect = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000, errors: ["time"] })
                if (!collect || collect.size === 0) return edit(client, message, msg)

                collect.first().delete().catch(() => null)
                question.delete().catch(() => null)

                const channel = collect.first().mentions.channels.first() || message.guild.channels.cache.get(collect.first().content)
                if (!channel) {
                    message.channel.send(`Aucun salon de trouvé pour \`${collect.first().content || "rien"}\``).then(m => setTimeout(() => m.delete().catch(() => null), 5000))
                    return edit(client, message, msg)
                }

                data[message.guild.id + "channel"] = channel.id
                return edit(client, message, msg)
            }
            if (interaction.values[0] === "prix"){
                edit(client, message, msg, true)
                const question = await message.channel.send("Quel sera le prix à gagner ?")
                const collect = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000, errors: ["time"] })
                if (!collect || collect.size === 0) return edit(client, message, msg)

                collect.first().delete().catch(() => null)
                question.delete().catch(() => null)

                data[message.guild.id + "prix"] = collect.first().content
                return edit(client, message, msg)
            }
            else if (interaction.values[0] === "title"){
                edit(client, message, msg, true)
                const question = await message.channel.send("Quel sera le titre du message ?")
                const collect = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000, errors: ["time"] })
                if (!collect || collect.size === 0) return edit(client, message, msg)

                collect.first().delete().catch(() => null)
                question.delete().catch(() => null)

                data[message.guild.id + "title"] = collect.first().content
                return edit(client, message, msg)
            }
            else if (interaction.values[0] === "description"){
                edit(client, message, msg, true)
                const question = await message.channel.send("Quel sera la description du message ?")
                const collect = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000, errors: ["time"] })
                if (!collect || collect.size === 0) return edit(client, message, msg)

                collect.first().delete().catch(() => null)
                question.delete().catch(() => null)

                data[message.guild.id + "description"] = collect.first().content
                return edit(client, message, msg)
            }
            else if (interaction.values[0] === "reaction"){
                edit(client, message, msg, true)
                const question = await message.channel.send("Quel sera la réaction du drop ?")
                const collect = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000, errors: ["time"] })
                if (!collect || collect.size === 0) return edit(client, message, msg)

                collect.first().react(collect.first().content)
                    .then(() => {
                        collect.first().delete().catch(() => null)
                        question.delete().catch(() => null)
        
                        data[message.guild.id + "reaction"] = collect.first().content
                        return edit(client, message, msg)        
                    })
                    .catch(() => {
                        collect.first().delete().catch(() => null)
                        question.delete().catch(() => null)
                        edit(client, message, msg)
                        return message.channel.send("Le bot n'a pas pu réagir avec cet emoji.").then(m => setTimeout(() => m.delete().catch(() => null), 5000))
                    })
            }
            else if (interaction.values[0] === "winners"){
                edit(client, message, msg, true)
                const question = await message.channel.send("Combien y aura t'il de gagnant ?")
                const collect = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 60000, errors: ["time"] })
                if (!collect || collect.size === 0) return edit(client, message, msg)

                collect.first().delete().catch(() => null)
                question.delete().catch(() => null)

                if (isNaN(parseInt(collect.first().content))) {
                    edit(client, message, msg)
                    return message.channel.send("Veuillez indiquer un nombre valide.").then(m => setTimeout(() => m.delete().catch(() => null), 5000))
                }

                data[message.guild.id + "winners"] = parseInt(collect.first().content)
                return edit(client, message, msg)
            }
            else if (interaction.values[0] === "onoff"){
                if (data[message.guild.id + "lanceur"]) data[message.guild.id + "lanceur"] = false
                else data[message.guild.id + "lanceur"] = message.author.id
                return edit(client, message, msg)
            }
            else if (interaction.values[0] === "send"){
                const channel = message.guild.channels.cache.get(data[message.guild.id + "channel"])
                if (!channel) return message.channel.send(`Veuillez d'abord configurer un salon`).then(m => setTimeout(() => m.delete().catch(() => null), 5000))
                if (!data[message.guild.id + "prix"]) return message.channel.send(`Veuillez d'abord indiquer un prix à gagner`).then(m => setTimeout(() => m.delete().catch(() => null), 5000))


                await client.giveawaysManager.start(channel, {
                    prize: data[message.guild.id + "prix"],
                    duration: data[message.guild.id + "end"] ?? client.ms("12h"),
                    winnerCount: parseInt(data[message.guild.id + "winners"] ?? "1"),
                    hostedBy: data[message.guild.id + "lanceur"] ? message.author : false,
                    isDrop: true,
                    messages: {
                        drop: `${data[message.guild.id + "title"] ?? "🎉 **DROP** 🎉"}`,
                        dropEnded: `🎉 **DROP TERMINÉ** 🎉`,
                        inviteToParticipate: `${data[message.guild.id + "description"] ?? "Réagis en premier avec 🎉 pour gagner le drop!"}`,
                        embedColor: db.color,
                        winMessage: `Félicitations, {winners}! Tu as gagné **${data[message.guild.id + "prix"]}**!`,
                        noWinner: 'drop annulé, aucun participant valide.',
                        hostedBy: `Organisé par: ${message.author}`,
                        winners: `Gagnant${parseInt(data[message.guild.id + "winners"] ?? "1") > 1 ? "s" : ""}`,
                        endedAt: 'Terminé le'
                    }
                });

                message.channel.send(`Drop lancé dans le salon ${channel}`).then(m => setTimeout(() => m.delete().catch(() => null), 5000))
            }
        })
    }
}

function edit(client, message, msg, disabled){
    const db = client.get(message.guildId);

    const embed = new EmbedBuilder()
        .setTitle("Settings Drop")
        .setColor(db.color)
        .addFields({name: "Salon", value: `${message.guild.channels.cache.get(data[message.guild.id + "channel"]) ?? "`Aucun`"}`, inline: true})
        .addFields({name: "Prix", value: `\`${data[message.guild.id + "prix"] ?? "`Aucun`"}\``, inline: true})
        .addFields({name: "Titre du message", value: `\`${data[message.guild.id + "title"] ?? "🎉 **DROP** 🎉"}\``, inline: true})
        .addFields({name: "Description du message", value: `\`${data[message.guild.id + "description"] ?? "Réagis en premier avec 🎉 pour gagner le drop"}\``, inline: true})
        .addFields({name: "Réaction", value: `${data[message.guild.id + "reaction"] ? data[message.guild.id + "reaction"].startsWith("<") ? data[message.guild.id + "reaction"] : `\`${data[message.guild.id + "reaction"]}\`` : "`🎉`"}`, inline: true})
        .addFields({name: "Lanceur du drop", value: `${message.guild.members.cache.get(data[message.guild.id + "lanceur"]) ?? "`Non`"}`, inline: true})

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
        .setCustomId(message.id + "drop")
        .setMaxValues(1)
        .setMinValues(1)
        .setDisabled(disabled ?? false)
        .setPlaceholder("Veuillez choisir une option")
        .setOptions([
            {
                label: "Modifier le salon",
                value: "channel"
            },
            {
                label: "Modifier le prix à gagner",
                value: "prix"
            },
            {
                label: "Modifier le titre du message",
                value: "title"
            },
            {
                label: "Modifier la description du message",
                value: "description"
            },
            {
                label: "Modifier la réaction du drop",
                value: "reaction"
            },
            {
                label: "Modifier le nombre de gagnants",
                value: "winners"
            },
            {
                label: "Activer/désactiver le lanceur",
                value: "onoff"
            },
            {
                label: "Lancer le drop",
                value: "send"
            }
        ])
    )

    if (msg) msg.edit({embeds: [embed], components: [row]})
}

