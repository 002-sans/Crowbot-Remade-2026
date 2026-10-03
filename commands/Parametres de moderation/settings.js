const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "settings",
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

        const embed = new EmbedBuilder()
            .setTitle('SETTINGS')
            .setColor(db.color)
            .setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' })
            .setDescription(`
**Antilink:** \`${db.antiraid.antilink.etat ? 'on' : 'off'} ${db.antiraid.antilink.type}\`
**Antimassmention:** \`${db.antiraid.antimassmention.etat ? 'on' : 'off'} ${db.antiraid.antimassmention.nombre}\`
**Antispam:** \`${db.antiraid.antispam.etat ? 'on' : 'off'} ${db.antiraid.antispam.nombre} / ${db.antiraid.antispam.durée / 1000}\`
**Autopublish:** \`${db.autopublish ? 'on' : 'off'}\`
**Bad Words:** \`${db.badwords ? 'on' : 'off'}\`
**Clear limit:** \`${db.clearlimit}\`
**Log de modération:** ${message.guild.channels.cache.get(db.logs.moderation) ?? '`off`'}
**Log des messages:** ${message.guild.channels.cache.get(db.logs.roles) ?? '`off`'}
**Log des rôles:** ${message.guild.channels.cache.get(db.logs.moderation) ?? '`off`'}
**Log des vocaux:** ${message.guild.channels.cache.get(db.logs.voices) ?? '`off`'}
**Logs des boosts:** ${message.guild.channels.cache.get(db.logs.boosts) ?? '`off`'}
**Prefix:** \`${db.prefix}\`
**Public:** \`${db.public.etat ? 'on' : 'off'}\`
**Rôles sans derank:** ${db.antiraid.noderank.filter(id => message.guild.roles.cache.get(id)).length == 0 ? '`aucun`' : db.antiraid.noderank.filter(id => message.guild.roles.cache.get(id).map(r => `- <@&${r}>`).join('\n'))}
**Salon autothreadé:** \`${db.autothreads.filter(id => message.guild.channels.cache.get(id)).length == 0 ? '`Nucun`' : db.autothreads.filter(id => message.guild.channels.cache.get(id)).map(r => `- <#${r}>`).join('\n')}\`
**Salons photos:** ${db.piconly.filter(id => message.guild.channels.cache.get(id)).length == 0 ? '`None`' : db.piconly.filter(id => message.guild.channels.cache.get(id)).map(r => `- <#${r}>`).join('\n')}
**Supprimer les commandes de snipe:** \`${db.snipe.delete_cmd ? 'on' : 'off'}\`
**Supprimer les réponses de snipe:** \`${db.snipe.delete_rep ? 'on' : 'off'}\`
**Thème:** \`${db.color}\``)

            message.channel.send({ embeds: [embed] })
    }
}