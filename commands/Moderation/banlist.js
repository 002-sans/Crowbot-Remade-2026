const { PermissionsBitField, Client, Message, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "banlist",
    description: "Permet de voir la liste des utilisateurs bannis.",
    category: "Modération",
    aliases: [],
    permissions: [],
    perm: 2,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const bans = await message.guild.bans.fetch();

        let p0 = 0;
        let p1 = 10;
        let page = 1;
        
        const embed = new EmbedBuilder()
            .setTitle('Liste des bannissements')
            .setColor(db.color)
            .setDescription(`${bans.size == 0 ? "Aucun administrateur" : bans
                .map(r => r)
                .filter(r => message.guild.members.cache.get(r.user.id))
                .map((m, i) => `\`${i+1}\` - ${m.user} (\`${m.user.displayName}\`)`)
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

        const msg = await message.channel.send({ embeds: [ embed ], components: bans.length > p1 ? [ row ] : null })
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
                
                    embed.setDescription(`${bans
                        .map(r => r)
                        .filter(r => message.guild.members.cache.get(r.user.id))
                        .map((m, i) => `\`${i+1}\` - ${m.user} (\`${m.user.displayName}\`)`)
                        .slice(p0, p1).join('\n')
                    }`)

                    msg.edit({ embeds: [ embed ] });
                    break;

                case 'next':
                    if (page + 1 > Math.ceil(bans.length / 10)) return;

                    p0 = p0 + 10;
                    p1 = p1 + 10;
                    page++;
        
                    embed.setDescription(`${bans
                        .map(r => r)
                        .filter(r => message.guild.members.cache.get(r.user.id))
                        .map((m, i) => `\`${i+1}\` - ${m.user} (\`${m.user.displayName}\`)`)
                        .slice(p0, p1).join('\n')
                    }`)

                    msg.edit({ embeds: [ embed ] });
                    break;
            }
        })

    },
}