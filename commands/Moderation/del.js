const { PermissionsBitField, Client, Message } = require("discord.js");

module.exports = {
    name: "del",
    description: "Supprime une sanction ou retire un membre d'un ticket",
    category: "Modération",
    argument: "<membre> <nombre>",
    aliases: [],
    perm: 2,
    permissions: [PermissionsBitField.Flags.SendMessages],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);

        if (args[0] == "perm") {
            const isOwner = client.config.owners.includes(message.author.id) || client.config.buyer === message.author.id;
            if (!client.perm(8, message.author.id, message.channel.id, message.guild) && !isOwner) return;
            const { removePerm } = require('../../utiles/perms');
            if (!args[1] || !args[2]) {
                return message.channel.send(`Utilisation: \`${db.prefix}del perm <niveau> <commande|/[@role/@membre]>\``);
            }
            return removePerm(client, message, args[1], args.slice(2));
        }

        if (args[0] == "sanction") {
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || await message.guild.members.fetch(args[1]).catch(() => null);
            if (!member || !args[1]) return message.channel.send(`Aucun membre de trouvé pour \`${args[1] ?? "rien"}\``);
            if (isNaN(args[2])) return message.channel.send('Veuillez spécifier le numéro de la sanction à supprimer');

            const warns = db.warns.filter(c => c.id == member.id);
            if (warns.length == 0) return message.channel.send("Cet utilisateur n'a reçu aucune sanction");
            if (args[2] <= 0 || args[2] > warns.length) return message.channel.send(`Vous devez donner un numéro entre 1 et ${warns.length}`);

            const warned = warns.splice(args[2] - 1, 1)[0];
            db.warns = db.warns.map(w => {
                if (w.id === member.id)
                    return warns.shift();
                return w;
            }).filter(w => w !== undefined);

            client.save(message.guildId);
            return message.channel.send(`Sanction supprimée: ${warned.reason}`);
        }

        const ticket = (db.tickets?.open || []).find(t => t.channelId === message.channel.id);
        if (ticket) {
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null);
            if (!member) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] ?? "rien"}\``);
            await message.channel.permissionOverwrites.delete(member).catch(() => null);
            return message.channel.send(`${member} a été **retiré** du ticket`);
        }
    },
}
