const { PermissionsBitField, Client, Message } = require("discord.js");
const { sendModLog } = require("../../utiles/modlog");

module.exports = {
    name: "tempban",
    description: "Bannit un ou plusieurs membres du serveur pour une durée déterminée, une raison peut être précisée.",
    category: "Modération",
    argument: "<membre> <durée> [raison]",
    aliases: [],
    perm: 2,
    permissions: [PermissionsBitField.Flags.BanMembers],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null)
        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => null)
        const reason = args[1] ? `Banni par ${message.author.displayName} (${message.author.id}): ${args.slice(1).join(' ')}` : `Banni par ${message.author.displayName} (${message.author.id})`

        if (!member && !user || !args[0]) return message.channel.send(`Aucun utilisateur de trouvé pour \`${args[0] ?? "rien"}\``)
        if (isNaN(client.ms(args[1])) || client.ms(args[1]) < 0) return message.channel.send('Durée invalide');

        db.tempban = db.tempban.filter(c => c.userId !== user.id);
        db.tempban.push({ date: Date.now() + client.ms(args[1]), userId: user.id })
        client.save(message.guildId);

        if (!member && user){
            message.guild.bans.create(user, { reason, deleteMessageSeconds: 60 * 60 * 7 })
                .then( () => { sendModLog(client, message.guild, "tempban", "Tempban", `${user} a été tempban par ${message.author}`); return message.channel.send(`${user} (\`${user.globalName}\`) a été banni ${args[1] ? `pour \`${args.slice(1).join(' ')}\`` : ''}`); })
                .catch(() => message.channel.send(`${user} (\`${user.globalName}\`) n'a pas pu être banni`))
        }
        else {
            if (message.member.roles.highest <= member.roles.highest) return message.channel.send(`Vous ne pouvez pas bannir ${member.displayName}`);
            if (member.id == message.guild.ownerId) return message.channel.send("Vous ne pouvez pas bannir le propriétaire du serveur");

            message.guild.bans.create(user, { reason, deleteMessageSeconds: 60 * 60 * 7 })
                .then( () => { sendModLog(client, message.guild, "tempban", "Tempban", `${user} a été tempban par ${message.author}`); return message.channel.send(`${user} (\`${user.globalName}\`) a été **banni** ${args[1] ? `pour \`${args.slice(1).join(' ')}\`` : ''}`); })
                .catch(() => message.channel.send(`${user} (\`${user.globalName}\`) n'a pas pu être **banni**`))
        }
    },
}
