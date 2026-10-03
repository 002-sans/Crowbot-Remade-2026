const { Client, Message, parseEmoji } = require("discord.js");

module.exports = {
    name: "addemoji",
    description: "Ajoute un emoji au serveur",
    category: "Gestion",
    argument: "<emoji>",
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
        if (args.length > 1){
            let i = 0
            let n = 0
                const m = await message.channel.send(`Création de \`${args.length}\` emoji`)

                for (const emote of args.map(r => r)){    
                    try {
                        const emoji = parseEmoji(emote)
                        if (!emoji || !emoji?.id) continue;
                
                        await message.guild.emojis.create({
                            attachment: `https://cdn.discordapp.com/emojis/${emoji?.id}.${emoji.animated ? 'gif' : 'png'}`,
                            name: emoji.name
                        });
                        i++
                    } catch { n++ }  
                }
                m.edit(`\`${i}/${i+n}\` emojis ont été crées`)
            }
        else {
            if (!args[0]) return message.channel.send(`Veuillez fournir un emoji à cloner`);
    
            const emoji = parseEmoji(args[0])
            if (!emoji || !emoji?.id) return message.chnnel.send(`Format d'emoji incorrect`);
    
            await message.guild.emojis.create({ attachment: `https://cdn.discordapp.com/emojis/${emoji?.id}.${emoji.animated ? 'gif' : 'png'}`, name: emoji.name }).catch(() => null);
            message.channel.send(`Création de <${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}> terminé`);    
        }
    },
}