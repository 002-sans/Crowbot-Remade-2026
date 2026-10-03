const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "alladmins",
    description: "Affiche la liste des administrateurs du serveur.",
    category: "Utilitaire",
    aliases: [ "all-admin", "alladmin" ],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const admins = message.guild.members.cache.filter(m => m.permissions.has(PermissionsBitField.Flags.Administrator) && !m.user.bot);

        let p0 = 0;
        let p1 = 10;
        let page = 1;
        
        const embed = new EmbedBuilder()
            .setTitle('Liste des administrateurs')
            .setColor(db.color)
            .setDescription(`${admins.size == 0 ? "Aucun administrateur" : admins
                .map(r => r)
                .filter(r => message.guild.members.cache.get(r.user.id))
                .map((m, i) => `\`${i+1}\` - ${m.user} (\`${m.user.displayName}\`)`)
                .slice(p0, p1).join('\n')
            }`)
            
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('back')
                .setLabel('◀')
                .setStyle(2),
                
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('▶')
                .setStyle(2),
        );

        const msg = await message.channel.send({ embeds: [ embed ], components: admins.length > p1 ? [ row ] : null })
        const collector = msg.createMessageComponentCollector({ time:  1000 * 60 * 10 });

        collector.on('end', () => msg.edit({ components: [] }));
        collector.on('collect', async i => {
            i.deferUpdate();
            if (i.user.id !== message.author.id) return;

            switch(i.customId){
                case 'back':
                    if (page - 1 < 1) return;
                    
                    p0 = p0 - 10;
                    p1 = p1 - 10;
                    page = page - 1
                
                    embed.setDescription(`${admins
                        .map(r => r)
                        .filter(r => message.guild.members.cache.get(r.user.id))
                        .map((m, i) => `\`${i+1}\` - ${m.user} (\`${m.user.displayName}\`)`)
                        .slice(p0, p1).join('\n')
                    }`)

                    msg.edit({ embeds: [ embed ] });
                    break;

                case 'next':
                    if (page + 1 > Math.ceil(admins.length / 10)) return;

                    p0 = p0 + 10;
                    p1 = p1 + 10;
                    page++;
        
                    embed.setDescription(`${admins
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