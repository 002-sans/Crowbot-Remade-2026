const { Client, Message, ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "piconly",
    description: "Paramètre les piconly du serveur",
    category: "Paramètres de modération",
    argument: "<add/del/list> [salon]",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 3,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);

        if (args[0] === "add") {
            const channels = client.resolveChannels(message.guild, args.slice(1).join(' '), message.mentions.channels);
            if (!channels.length) return message.channel.send(`Aucun salon de trouvé pour \`${args.slice(1).join(' ') || "rien"}\``);

            db.piconly ??= [];
            const added = [];
            for (const channel of channels) {
                if (!db.piconly.includes(channel.id)) {
                    db.piconly.push(channel.id);
                    added.push(`<#${channel.id}>`);
                }
            }
            client.save(message.guildId);

            if (added.length === 1) {
                return message.channel.send(`${added[0]} est maintenant un piconly`);
            }
            if (added.length > 1) {
                return message.channel.send(`${added.join(', ')} sont maintenant des piconly`);
            }
            return message.channel.send("Ces salons sont déjà des piconly");
        }
        else if (args[0] === "del") {
            const channels = client.resolveChannels(message.guild, args.slice(1).join(' '), message.mentions.channels);
            if (!channels.length) return message.channel.send(`Aucun salon de trouvé pour \`${args.slice(1).join(' ') || "rien"}\``);

            db.piconly ??= [];
            const removed = [];
            for (const channel of channels) {
                if (db.piconly.includes(channel.id)) {
                    db.piconly = db.piconly.filter(w => w !== channel.id);
                    removed.push(`<#${channel.id}>`);
                }
            }
            client.save(message.guildId);

            if (removed.length === 1) {
                return message.channel.send(`${removed[0]} a été retiré des piconly`);
            }
            if (removed.length > 1) {
                return message.channel.send(`${removed.join(', ')} ont été retirés des piconly`);
            }
            return message.channel.send("Ces salons ne sont pas des piconly");
        }
        else if (args[0] == "list"){

            let p0 = 0;
            let p1 = 10;
            let page = 1;
            
            const embed = new EmbedBuilder()
                .setTitle('Liste des piconly')
                .setColor(db.color)
                .setDescription(`${db.piconly.filter(c => message.guild.channels.cache.get(c)).length == 0 ? "Aucun salon" : db.piconly
                    .map(r => r)
                    .filter(r => message.guild.channels.cache.get(r))
                    .map((m, i) => `\`${i+1}\` - <#${m}> (\`${m}\`)`)
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
    
            const msg = await message.channel.send({ embeds: [ embed ], components: db.piconly.length > p1 ? [ row ] : null })
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
                    
                        embed.setDescription(`${db.piconly
                            .map(r => r)
                            .filter(r => message.guild.channels.cache.get(r))
                            .map((m, i) => `\`${i+1}\` - <#${m}> (\`${m}\`)`)
                            .slice(p0, p1).join('\n')
                        }`)
    
                        msg.edit({ embeds: [ embed ] });
                        break;
    
                    case 'next':
                        if (page + 1 > Math.ceil(db.piconly.length / 10)) return;
    
                        p0 = p0 + 10;
                        p1 = p1 + 10;
                        page++;
            
                        embed.setDescription(`${db.piconly
                            .map(r => r)
                            .filter(r => message.guild.channels.cache.get(r))
                            .map((m, i) => `\`${i+1}\` - <#${m}> (\`${m}\`)`)
                            .slice(p0, p1).join('\n')
                        }`)
    
                        msg.edit({ embeds: [ embed ] });
                        break;
                }
            })    
        }
    }
}