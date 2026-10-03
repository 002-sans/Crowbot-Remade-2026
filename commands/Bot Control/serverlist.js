const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "serverlist",
    description: "Affiche la liste des serveurs du bot.",
    category: "Bot Control",
    aliases: ["sl"],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const guilds = client.guilds.cache;

        let p0 = 0;
        let p1 = 10;
        let page = 1;
        
        const embed = new EmbedBuilder()
            .setTitle('Liste des serveurs')
            .setColor(db.color)
            .setDescription(`${guilds.size == 0 ? "Aucun serveur" : guilds
                .map(r => r)
                .map((m, i) => `\`${i+1}\` - ${m.name} (\`${m.id}\`)`)
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

        const msg = await message.channel.send({ embeds: [ embed ], components: guilds.length > p1 ? [ row ] : null })
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
                
                    embed.setDescription(`${guilds
                        .map(r => r)
                        .map((m, i) => `\`${i+1}\` - ${m.name} (\`${m.id}\`)`)
                        .slice(p0, p1).join('\n')
                    }`)

                    msg.edit({ embeds: [ embed ] });
                    break;

                case 'next':
                    if (page + 1 > Math.ceil(guilds.length / 10)) return;

                    p0 = p0 + 10;
                    p1 = p1 + 10;
                    page++;
        
                    embed.setDescription(`${guilds
                        .map(r => r)
                        .map((m, i) => `\`${i+1}\` - ${m.name} (\`${m.id}\`)`)
                        .slice(p0, p1).join('\n')
                    }`)

                    msg.edit({ embeds: [ embed ] });
                    break;
            }
        })
    },
}