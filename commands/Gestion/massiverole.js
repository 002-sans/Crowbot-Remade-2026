const { Client, Message, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, RoleSelectMenuBuilder } = require("discord.js");
const data = {};
module.exports = {
    name: "massiverole",
    description: "Ajoute/retire un rôle à plusieurs membres",
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
        .setTitle("Massiverole Settings")
        .setColor(db.color)
        .addFields({ name: "Action:", value: `\`${data[message.guild.id + "action"] ? "Retirer" : "Ajouter"}\``, inline: true })
        .addFields({ name: "Rôle", value: `${message.guild.roles.cache.get(data[message.guild.id + "role"]) ?? "\`Aucun\`"}`, inline: true})
        .addFields({ name: "Cible", value: `\`${data[message.guild.id + "filtre"] ?? "Tout le monde"}\``, inline: true})
        .addFields({ name: "Rôles Blacklists", value: `${data[message.guild.id + "banned"] ? data[message.guild.id + "banned"].map(roleId => message.guild.roles.cache.get(roleId) ?? "").join(', ') : "`Aucun rôle blacklist`"}`, inline: true });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
            .setCustomId(message.id + "massrole")
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder("Veuillez choisir une option")
            .addOptions([
                {
                    label: "Ajouter/Retirer un rôle",
                    value: "addremove"
                },
                {
                    label: "Modifier le rôle",
                    value: "editrole"
                },
                {
                    label: "Modifier le filtre",
                    value: "filtre"
                },
                {
                    label: "Modifier les rôles blacklists",
                    value: "addbl"
                },
                {
                    label: "Supprimer les rôles blacklists",
                    value: "delbl"
                },
                {
                    label: "Lancer",
                    value: "send"
                }
            ])
        )
        
        const msg = await message.channel.send({ embeds: [embed], components: [row] })
        const collector = await msg.createMessageComponentCollector({ time: 1000 * 60 * 5 })
        
        collector.on('end', () => msg.edit({ components: [] }));
        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) 
                return interaction.reply({content: "Vous ne pouvez pas utiliser ce menu", flags: 64})
                
                await interaction.deferUpdate().catch(() => null)
                
                if (interaction.customId === "role"){
                    data[message.guild.id + "role"] = interaction.values[0]
                    return await edit(client, message, msg)
                }
                if (interaction.customId === "blrole"){
                    data[message.guild.id + "banned"] = interaction.values
                    return await edit(client, message, msg)
                }
                if (interaction.values[0] === "addremove"){
                    if (data[message.guild.id + "action"]) data[message.guild.id + "action"] = false
                    else data[message.guild.id + "action"] = true
                    return await edit(client, message, msg)
                }
                if (interaction.values[0] === "delbl"){
                    delete data[message.guild.id + "banned"]
                    return await edit(client, message, msg)
                }

                else if (interaction.values[0] === "editrole"){
                    const embed = new EmbedBuilder()
                    .setDescription(`Veuillez me donner un rôle à ${data[message.guild.id + "action"] ? "retirer" : "ajouter"} ?`)
                    .setColor(db.color)

                    const rolemenu = new RoleSelectMenuBuilder()
                        .setCustomId('role')
                        .setMaxValues(1)
                        .setPlaceholder("Veuillez choisir un rôle")

                    const row = new ActionRowBuilder().addComponents(rolemenu)
                        
    
                    await msg.edit({embeds: [embed], components: [row]})
                }
                else if (interaction.values[0] === "addbl"){
                    const embed = new EmbedBuilder()
                    .setDescription(`Veuillez me donner des rôles blacklists`)
                    .setColor(db.color)

                    const rolemenu = new RoleSelectMenuBuilder()
                        .setCustomId('blrole')
                        .setMaxValues(10)
                        .setPlaceholder("Veuillez choisir des rôles")

                    const row = new ActionRowBuilder().addComponents(rolemenu)
                    await msg.edit({embeds: [embed], components: [row]})
                }
                else if (interaction.values[0] === "send"){
                    let err = 0
                    let noe = 0

                    const role = message.guild.roles.cache.get(data[message.guild.id + "role"]) 
                    if (!role) return interaction.channel.send({content: `Veuillez définir un rôle à ${data[message.guild.id + "action"] ? "retirer" : "ajouter"}`}).then(m => setTimeout(() => m.delete().catch(() => null), 5000))
                    
                    await message.guild.members.fetch()
                    let members = message.guild.members.cache;
                    
                    if (data[message.guild.id + "filtre"] === "Bots uniquement")    members = members.filter(m => m.user.bot)
                    if (data[message.guild.id + "filtre"] === "Membres uniquement") members = members.filter(m => !m.user.bot)
                    if (data[message.guild.id + "action"])  members = members.filter(m => m.roles.cache.has(role.id))
                    if (!data[message.guild.id + "action"]) members = members.filter(m => !m.roles.cache.has(role.id))
                    if (data[message.guild.id + "banned"])  members = members.filter(m => !m.roles.cache.some(r => data[message.guild.id + "banned"].includes(r.id)))
                    
                    
                    if (data[message.guild.id + "action"]) {
                        await edit(client, message, msg, true)
                        const m = await interaction.channel.send({content: `Je suis en train de retirer le rôle de **${members.size}** membres\nJ'ai retiré le rôle à **${noe}** membres\nJe n'ai pas pu retirer le rôle à **${err}** membres`})
                        const int = setInterval(() => m.edit({content: `Je suis en train de retirer le rôle de **${members.size}** membres\nJ'ai retiré le rôle à **${noe}** membres\nJe n'ai pas pu retirer le rôle à **${err}** membres`}), 2500);
                        for (const member of members.map(r => r)){
                            try{
                                await member.roles.remove(role)
                                noe++
                            }
                            catch { err++ }
                        }
                        m.edit({content: `Je suis en train de retirer le rôle de **${members.size}** membres\nJ'ai retiré le rôle à **${noe}** membres\nJe n'ai pas pu retirer le rôle à **${err}** membres`})
                        clearInterval(int)
                        setTimeout(() => m.delete().catch(() => null), 1000 * 10)
                        await edit(client, message, msg)
                    }
                    else {
                        await edit(client, message, msg, true)
                        const m = await interaction.channel.send({content: `Je suis en train d'ajouter le rôle à **${members.size}** membres\nJ'ai ajouter le rôle à **${noe}** membres\nJe n'ai pas pu ajouter le rôle à **${err}** membres`})
                        const int = setInterval(() => m.edit({content: `Je suis en train d'ajouter le rôle à **${members.size}** membres\nJ'ai ajouter le rôle à **${noe}** membres\nJe n'ai pas pu ajouter le rôle à **${err}** membres`}), 2500);
                        for (const member of members.map(r => r)){
                            try{
                                await member.roles.add(role)
                                noe++
                            }
                            catch { err++ }
                        }
                        m.edit({content: `Je suis en train d'ajouter le rôle à **${members.size}** membres\nJ'ai ajouter le rôle à **${noe}** membres\nJe n'ai pas pu ajouter le rôle à **${err}** membres`})
                        clearInterval(int)
                        setTimeout(() => m.delete().catch(() => null), 1000 * 10)
                        await edit(client, message, msg)
                    }    
                }
                else if (interaction.values[0] == "all"){
                    data[message.guild.id + "filtre"] = "Tout le monde"
                    return await edit(client, message, msg)
                }
                else if (interaction.values[0] == "bots"){
                    data[message.guild.id + "filtre"] = "Bots uniquement"
                    return await edit(client, message, msg)
                }
                else if (interaction.values[0] == "members"){
                    data[message.guild.id + "filtre"] = "Membres uniquement"
                    return await edit(client, message, msg)
                }
                else if (interaction.values[0] === "filtre"){
                    const embed = new EmbedBuilder()
                    .setDescription(`A qui voulez vous ${data[message.guild.id + "action"] ? "retirer" : "ajouter"} le rôle ?`)
                    .setColor(db.color)
    
                    const row = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId(message.id + "giving")
                        .setMaxValues(1)
                        .setMinValues(1)
                        .setPlaceholder("Veuillez choisir une option")
                        .addOptions([
                            {
                                label: "Tout le monde",
                                value: "all"
                            },
                            {
                                label: "Les bots uniquements",
                                value: "bots"
                            },
                            {
                                label: "Les membres uniquements",
                                value: "members"
                            }
                        ])
                    )
        
                    msg.edit({embeds: [embed], components: [row]})
            }
        })
    }
}

async function edit(client, message, msg, disabled){
    const db = client.get(message.guildId);

    const embed = new EmbedBuilder()
    .setTitle("Massrole Settings")
    .setColor(db.color)
    .addFields({ name: "Action:", value: `\`${data[message.guild.id + "action"] ? "Retirer" : "Ajouter"}\``, inline: true })
    .addFields({ name: "Rôle", value: `${message.guild.roles.cache.get(data[message.guild.id + "role"]) ?? "\`Aucun\`"}`, inline: true})
    .addFields({ name: "Cible", value: `\`${data[message.guild.id + "filtre"] ?? "Tout le monde"}\``, inline: true})
    .addFields({ name: "Rôles Blacklists", value: `${data[message.guild.id + "banned"] ? data[message.guild.id + "banned"].map(roleId => message.guild.roles.cache.get(roleId) ?? "").join(', ') : "`Aucun rôle blacklist`"}`, inline: true });

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
        .setCustomId(message.id + "massrole")
        .setMaxValues(1)
        .setMinValues(1)
        .setDisabled(disabled ?? false)
        .setPlaceholder("Veuillez choisir une option")
        .addOptions([
            {
                label: "Ajouter/Retirer un rôle",
                value: "addremove"
            },
            {
                label: "Modifier le rôle",
                value: "editrole"
            },
            {
                label: "Modifier le filtre",
                value: "filtre"
            },
            {
                label: "Modifier les rôles blacklists",
                value: "addbl"
            },
            {
                label: "Supprimer les rôles blacklists",
                value: "delbl"
            },
            {
                label: "Lancer",
                value: "send"
            }
        ])
    )
    
    if (msg) await msg.edit({embeds: [embed], components: [row]})

}