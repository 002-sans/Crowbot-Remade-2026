const { Client, Message, ActionRowBuilder,  EmbedBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "badword",
    description: "Paramètre les mots interdits du serveur",
    category: "Paramètres de modération",
    argument: "<add/del/list> [mot]",
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

        if (args[0] == "on"){
            if (db.badwords) return message.channel.send("Le système de badwords sont déjà activés");

            db.badwords = true;
            client.save(message.guildId);

            message.channel.send("Le système de badwords a été activé")
        }
        else if (args[0] == "off"){
            if (!db.badwords) return message.channel.send("Le système de badwords sont déjà désactivés");

            db.badwords = false;
            client.save(message.guildId);

            message.channel.send("Le système de badwords a été désactivé")
        }
        else if (args[0] === "add") {
            if (!args[1]) return message.channel.send(`Veuillez entrer un mot interdit`);
            const words = client.cleanInput(args.slice(1).join(' '));
            db.badword ??= [];
            const added = [];

            for (const w of words) {
                if (!db.badword.includes(w)) {
                    db.badword.push(w);
                    added.push(w);
                }
            }

            client.save(message.guildId);

            if (added.length === 1) {
                return message.channel.send(`\`${added[0]}\` est maintenant interdit`);
            }
            if (added.length > 1) {
                return message.channel.send(`\`${added.length}\` mot(s) sont maintenant interdits (\`${added.join(', ')}\`)`);
            }
            return message.channel.send(`Ce(s) mot(s) sont déjà interdits`);
        }
        else if (args[0] === "del") {
            if (!args[1]) return message.channel.send(`Veuillez entrer un mot interdit`);
            const words = client.cleanInput(args.slice(1).join(' '));
            db.badword ??= [];
            const removed = [];

            for (const w of words) {
                if (db.badword.includes(w)) {
                    db.badword = db.badword.filter(item => item !== w);
                    removed.push(w);
                }
            }

            client.save(message.guildId);

            if (removed.length === 1) {
                return message.channel.send(`\`${removed[0]}\` a été retiré des badwords`);
            }
            if (removed.length > 1) {
                return message.channel.send(`\`${removed.length}\` mot(s) ont été retirés des badwords`);
            }
            return message.channel.send(`Ce(s) mot(s) ne sont pas dans la liste`);
        }
        else if (args[0] == "list"){

            let p0 = 0;
            let p1 = 10;
            let page = 1;
            
            const embed = new EmbedBuilder()
                .setTitle('Liste des badword')
                .setColor(db.color)
                .setDescription(`${db.badword.length == 0 ? "Aucun mot" : db.badword
                    .map(r => r)
                    .map((m, i) => `\`${i+1}\` - **${m}**`)
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
    
            const msg = await message.channel.send({ embeds: [ embed ], components: db.badword.length > p1 ? [ row ] : null })
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
                    
                        embed.setDescription(`${db.badword
                            .map(r => r)
                            .map((m, i) => `\`${i+1}\` - **${m}**`)
                            .slice(p0, p1).join('\n')
                        }`)
    
                        msg.edit({ embeds: [ embed ] });
                        break;
    
                    case 'next':
                        if (page + 1 > Math.ceil(boosters.length / 10)) return;
    
                        p0 = p0 + 10;
                        p1 = p1 + 10;
                        page++;
            
                        embed.setDescription(`${db.badword
                            .map(r => r)
                            .map((m, i) => `\`${i+1}\` - **${m}**`)
                            .slice(p0, p1).join('\n')
                        }`)
    
                        msg.edit({ embeds: [ embed ] });
                        break;
                }
            })    
        }
    }
}