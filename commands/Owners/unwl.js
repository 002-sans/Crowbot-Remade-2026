const { Client, Message } = require("discord.js");

module.exports = {
    name: "unwl",
    description: "Permet d'enlever un utilisateur de la whitelist.",
    category: "Owners",
    argument: "<member/role>",
    aliases: [ "unwhitelist" ],
    permissions: [],
    perm: 6,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (!args.length) return message.channel.send(`Format incorrect: essayez \`${client.config.prefix}unwl <membre/rôle>\``);

        const db = client.get(message.guildId);
        db.whitelist ??= [];
        db.antiraid ??= {};
        db.antiraid.roles ??= [];

        const rawInputs = client.cleanInput(args.join(' '));
        const removedMembers = [];
        const removedRoles = [];

        for (const input of rawInputs) {
            const members = await client.resolveMembers(message.guild, input);
            if (members.length > 0) {
                for (const m of members) {
                    if (db.whitelist.includes(m.id)) {
                        db.whitelist = db.whitelist.filter(id => id !== m.id);
                        removedMembers.push(m.displayName);
                    }
                }
                continue;
            }

            const roles = await client.resolveRoles(message.guild, input);
            if (roles.length > 0) {
                for (const r of roles) {
                    if (db.antiraid.roles.includes(r.id)) {
                        db.antiraid.roles = db.antiraid.roles.filter(id => id !== r.id);
                        removedRoles.push(r.name);
                    }
                }
                continue;
            }
        }

        if (removedMembers.length > 0 || removedRoles.length > 0) {
            client.save(message.guildId);
            const msgs = [];
            if (removedMembers.length > 0) msgs.push(`\`${removedMembers.join(', ')}\` n'est plus whitelist`);
            if (removedRoles.length > 0) msgs.push(`Le rôle \`${removedRoles.join(', ')}\` n'est plus whitelist`);
            return message.channel.send(msgs.join('\n'));
        }

        return message.channel.send(`Aucun membre ou rôle correspondant à enlever de la whitelist pour \`${args.join(' ')}\``);
    },
};