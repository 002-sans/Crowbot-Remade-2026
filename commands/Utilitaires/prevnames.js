const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Client, Message } = require("discord.js");
const api = `http://185.157.247.48:1338/prevnames/`

module.exports = {
    name: "prevnames",
    description: "Affiche les anciens pseudos d'un utilisateur.",
    category: "Utilitaire",
    aliases: ["prevname"],
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
        let user = message.mentions.users.first() ||client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => null);
        if (!user || !args[0]) user = message.author;

        const res = await fetch(api + user.id).then(r => r.json()).catch(() => null);
        const data = Object.entries(res)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [k, v]) => {
          acc[k] = v;
          return acc;
        }, {});
      
        const db = client.get(message.guildId);

        let p0 = 0;
        let p1 = 10;
        let page = 1;
        
        const embed = new EmbedBuilder()
            .setTitle(`Liste des anciens pseudos de ${user.username}`)
            .setColor(db.color)
            .setDescription(`${
                Object.keys(data).length == 0 ? "Aucun pseudo" :
                Object.keys(data)
                .map((r, i) => `<t:${data[r]}:R> - **${r}**`)
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

        const msg = await message.channel.send({ embeds: [ embed ], components: Object.keys(data).length > p1 ? [ row ] : [] })
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
                
                    embed.setDescription(`${
                        Object.keys(data).length == 0 ? "Aucun pseudo" :
                        Object.keys(data)
                        .map((r, i) => `<t:${data[r]}:R> - **${r}**`)
                        .slice(p0, p1).join('\n')
                    }`)

                    msg.edit({ embeds: [ embed ] });
                    break;

                case 'next':
                    if (page + 1 > Math.ceil(data.length / 10)) return;

                    p0 = p0 + 10;
                    p1 = p1 + 10;
                    page++;
        
                    embed.setDescription(`${
                        Object.keys(data).length == 0 ? "Aucun pseudo" :
                        Object.keys(data)
                        .map((r, i) => `<t:${data[r]}:R> - **${r}**`)
                        .slice(p0, p1).join('\n')
                    }`)

                    msg.edit({ embeds: [ embed ] });
                    break;
            }
        })
    },
}