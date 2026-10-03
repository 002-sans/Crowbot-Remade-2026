const { Client, Message } = require("discord.js");
const backup = require('@outwalk/discord-backup');

module.exports = {
    name: "backup",
    description: "Crée la backup des emojis ou du serveur",
    category: "Gestion",
    argument: "<emoji/serveur> <nom>",
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

        switch(args[0]){
            default:
                if (args[0] == "emoji"){

                    if (!args[1]) return message.channel.send("Veuillez entrer un nom à votre backup");
                    if (db.backups_emojis.find(c => c.id === args.slice(1).join(' '))) return message.channel.send("Une backup existe déjà sous ce nom")
                            
                    const data = {
                        emojis: message.guild.emojis.cache.map(r => r.toString()),
                        name: message.guild.name,
                        code: args.slice(1).join(' '),
                        size: message.guild.emojis.cache.size
                    }
                        
                    db.backups_emojis.push(data)
                    client.save(message.guildId)
            
                    message.channel.send(`La backup des emojis du serveur ${message.guild.name} a été crée. Pour la charger veuillez utiliser la commande \`${db.prefix ?? client.config.prefix}backup-load emoji ${args.slice(1).join(' ')}\``)        
                }
                else if (args[0] == "serveur"){
                    if (!args[1]) return message.channel.send("Veuillez entrer un nom à votre backup");
                    if (backup.list().includes(args.slice(1).join(' '))) return message.channel.send("Une backup existe déjà sous ce nom")
                    
                    message.channel.send("Création de la backup en cours...");
        
                    await backup.create(message.guild, {
                        backupId: args.slice(1).join(' '),
                        maxMessagesPerChannel: 0,
                        jsonSave: true,
                        jsonBeautify: true,
                        doNotBackup: [ "emojis", "bans" ],
                        backupMembers: false,
                        speed: 1,
                        ignore2FA: true
                    });
        
                    message.channel.send(`La backup du serveur a été crée. Pour la charger veuillez utiliser la commande \`${db.prefix ?? client.config.prefix}backup-load serveur ${args.slice(1).join(' ')}\``)        
                }        
                break;

            case 'load':
                if (args[1] == "emoji"){

                    if (!args[2]) return message.channel.send("Veuillez entrer un nom à votre backup");
                    if (!db.backups_emojis.find(c => c.code === args.slice(2).join(' '))) return message.channel.send("Aucune backup de trouvé pour ce nom")
           
                    const data = db.backups_emojis.find(c => c.code === args.slice(2).join(' '))
                    const m    = await message.channel.send(`Chargement de ${data.emojis.length} emojis !`)
                            
                    for (const emote of data.emojis.map(r => r)){
                        try {
                            let emoji = parseEmoji(emote);
                            if (emoji?.id) message.guild.emojis.create(`https://cdn.discordapp.com/emojis/${emoji?.id}.${emoji.animated ? 'gif' : 'png'}`, emoji.name)
                        }
                        catch { false }
                    }
            
                    m.edit("Les emojis ont été chargés")
                }
                else if (args[1] == "serveur"){
                    if (!args[2]) return message.channel.send("Veuillez entrer un nom à votre backup");
                    if (!backup.list().includes(args.slice(2).join(' '))) return message.channel.send("Aucune backup de trouvé pour ce nom")
        
                    message.channel.send("Chargement de la backup en cours...");
                    const backupData = await backup.load(args.slice(2).join(' '), message.guild, {
                        maxMessagesPerChannel: 0,
                        speed: 250,
                    }).catch(() => null);
        
                    if (!backupData && message.channel) return message.channel.send("Chargement de la backup impossible");
                }
                break;

            case "list":
                if (args[1] == "serveur"){
                    const backups = backup.list();
                    const backupFetched = [];
                    
                    for (const data of backups) {
                        const fetchedBackup = await backup.fetch(data)
                        backupFetched.push(fetchedBackup)
                    }
            
                    const backupInfos = (await Promise.all(backupFetched.sort(function(a, b) {
                      return a.data.name.localeCompare(b.data.name)
                    }).map((e, i) => `${i+1}・**${e.data.name}** (\`${e.id}\`)`))).join('\n')
            
            
        
                    const embed = new EmbedBuilder()
                        .setTitle("Liste des backups")
                        .setColor(db.color)
                        .setDescription(`${
                            backupInfos.length == 0 ?
                            "Aucune backup" :
                            backupInfos
                        }`)
        
                    message.channel.send({ embeds: [ embed ] })
                }
                
                else if (args[1] == "emoji"){
                    const embed = new EmbedBuilder()
                        .setTitle("Liste des backups")
                         .setColor(db.color)
                        .setDescription(`${
                            db.backups_emojis.length == 0 ?
                            "Aucune Backup" :
                            db.backups_emojis.map((e, i) => `${i+1}・**${e.name}** (\`${e.code}\`)`).join('\n')
                        }`)
                        
                    message.channel.send({ embeds: [ embed ] })
                }
                break;

            case "delete":
                if (args[1] == "serveur"){
                    if (backup.list().includes(args.slice(2).join(' '))){
                        backup.remove(args.slice(2).join(' '))
                            .then( () => message.channel.send(`La backup \`${args.slice(2).join(' ')}\` a été supprimée`))
                            .catch(() => message.channel.send(`Je n'ai pas pu supprimé la backup \`${args.slice(2).join(' ')}\``))
                    }
                } 
                
                else if (args[1] == "emoji"){
                    const emojis = db.backups_emojis.find(c => c.code === args.slice(2).join(' '));
        
                    if (emojis){
                        db.backups_emojis = db.backups_emojis.filter(c => c.code !== emojis.code)
                        message.channel.send(`La backup \`${args.slice(2).join(' ')}\` a été supprimée`)
                    }
                }
                break;

            case "info":
                const emojis = db.backups_emojis.find(c => c.code === args.slice(2).join(' '))
        
                if (args[1] == "serveur"){
                    if (backup.list().includes(args.slice(2).join(' '))){
                        const backupData = await backup.fetch(args.slice(2).join(' ')).catch(() => null)
                        if (!backupData) return message.channel.send(`Aucune backup de trouvée pour \`${args.slice(2).join(' ')}\``)
            
                        const embed = new EmbedBuilder()
                            .setTitle("Information de la backup")
                            .setColor(db.color)
                            .setDescription(`
                                > **Nom du serveur**: \`${backupData.data.name}\`
                                > **ID de la backup**: \`${backupData.id}\`
                                > **ID du serveur**: \`${backupData.data.guildID}\`
                                > **Taille du fichier**: \`${backupData.size}kb\`
                                > **Crée**: <t:${Math.round(backupData.data.createdTimestamp / 1000)}:R>`.replaceAll('  ', '')
                            )
                           
                        if (backupData.data.iconURL) embed.setThumbnail(backupData.data.iconURL)
                        if (backupData.data.bannerURL ?? backupData.data.splashURL) embed.setImage(backupData.data.bannerURL ?? backupData.data.splashURL)
            
                        message.channel.send({ embeds: [ embed ] })
                    }
                }
                
                else if (args[1] == "emoji"){
                    if (emojis){
                        const embed = new EmbedBuilder()
                            .setTitle("Information de la backup")
                            .setColor(db.color)
                            .setDescription(`
                                > **Nom du serveur**: \`${emojis.name}\`
                                > **ID de la backup**: \`${emojis.code}\`
                                > **Nombre d'emojis**: \`${emojis.size}\``.replaceAll('  ', '')
                            )
                        
                        message.channel.send({ embeds: [ embed ] })
                    }
                }
                break;        
                
        }
    },
}