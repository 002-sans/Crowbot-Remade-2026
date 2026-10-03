const { Client, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "autoreact",
    description: "Gère l'autoreact du serveur",
    category: "Gestion",
    argument: "[add/remove] [salon/numéro] [emoji]",
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

        if (args[0] == "add"){
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel || ![0].includes(channel.type)) return message.channel.send("Veuillez entrer un salon textuel valide");

            const reacted = await message.react(args[2]).catch(() => null);
            if (!reacted) return message.channel.send("L'emoji n'est pas valide");
            
            reacted.remove();
            db.autoreact.push({ channel: channel.id, reaction: args[2] });
            client.save(message.guildId);

            message.channel.send(`Je vais réagir automatiquement ${args[2]} dans le salon ${channel}`);
        }
        else if (args[0] == "remove"){
            if (isNaN(args[1])) return message.channel.send("Veuillez entrer un nombre valide");
            
            const index = parseInt(args[1], 10) - 1;
            if (index < 0 || index >= db.autoreact.length) return message.channel.send("Veuillez entrer un numéro valide.");
            
            db.autoreact.splice(index, 1)[0];
            client.save(message.guildId);

            message.channel.send(`L'autoreact avec comme numéro \`${args[1]}\` a été supprimé`)
        }
        else if (!args[0]){
            const data = db.autoreact?.map(r => `<#${r.channel}> (${r.reaction})`) || []

            let p0 = 0;
            let p1 = 10;
            let page = 1;
            
            const embed = new EmbedBuilder()
                .setTitle('Liste des auto react')
                .setColor(db.color)
                .setDescription(`${data.length == 0 ? "Aucun auto react" : data
                    .map(r => r)
                    .map((m, i) => `\`${i+1}\` - ${m}`)
                    .slice(p0, p1).join('\n')
                }`)
                
            const row = new ActionRowBuilder(
                new ButtonBuilder()
                    .setCustomId('back')
                    .setLabel('◀')
                    .setStyle(2),
                    
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶')
                    .setStyle(2),
            );
    
            const msg = await message.channel.send({ embeds: [ embed ], components: data.length > p1 ? [ row ] : null })
            const filter = i => { i.deferUpdate(); return i.user.id === message.author.id }
            const collector = msg.createMessageComponentCollector({ filter, time:  1000 * 60 * 10 });
    
            collector.on('end', () => msg.edit({ components: [] }));
            collector.on('collect', async i => {
                switch(i.customId){
                    case 'back':
                        if (page - 1 < 1) return;
                        
                        p0 = p0 - 10;
                        p1 = p1 - 10;
                        page = page - 1
                    
                        embed.setDescription(`${data
                            .map(r => r)
                            .map((m, i) => `\`${i+1}\` - ${m}`)
                            .slice(p0, p1).join('\n')
                        }`)
    
                        msg.edit({ embeds: [ embed ] });
                        break;
    
                    case 'next':
                        if (page + 1 > Math.ceil(data.length / 10)) return;
    
                        p0 = p0 + 10;
                        p1 = p1 + 10;
                        page++;
            
                        embed.setDescription(`${data
                            .map(r => r)
                            .map((m, i) => `\`${i+1}\` - ${m}`)
                            .slice(p0, p1).join('\n')
                        }`)
    
                        msg.edit({ embeds: [ embed ] });
                        break;
                }
            })    
        }
    },
}