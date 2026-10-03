const { PermissionsBitField, EmbedBuilder, Client, Message, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "rolemembers",
    description: "Affiche la liste des membres ayant un rôle précis.",
    category: "Utilitaire",
    aliases: [],
    permissions: [],
    perm: 1,
    argument: "<role>",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || await message.guild.roles.fetch(args[0]).catch(() => null);
        if (!role || !args[0]) return message.channel.send(`\`❌\`・Aucun rôle de trouvé pour \`${args[0] ?? "rien"}\``);

        const members = message.guild.members.cache.filter(m => m.roles.cache.has(role.id));

        let p0 = 0;
        let p1 = 10;
        let page = 1;
        
        const embed = new EmbedBuilder()
            .setTitle('Liste des membres')
            .setColor(db.color)
            .setDescription(`${members.size == 0 ? "Aucun utilisateur" : members
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

        const msg = await message.channel.send({ embeds: [ embed ], components: members.length > p1 ? [ row ] : null })
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
                
                    embed.setDescription(`${members
                        .map(r => r)
                        .filter(r => message.guild.members.cache.get(r.user.id))
                        .map((m, i) => `\`${i+1}\` - ${m.user} (\`${m.user.displayName}\`)`)
                        .slice(p0, p1).join('\n')
                    }`)

                    msg.edit({ embeds: [ embed ] });
                    break;

                case 'next':
                    if (page + 1 > Math.ceil(members.length / 10)) return;

                    p0 = p0 + 10;
                    p1 = p1 + 10;
                    page++;
        
                    embed.setDescription(`${members
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