const { Client, Message } = require("discord.js");

module.exports = {
    name: "change",
    description: "Modifie la permission requise pour une commande",
    category: "Owners",
    aliases: [],
    permissions: [],
    argument: "<commande> <perm_number/perm_role>",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 8,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);

        if (args[0] === 'reset' || (args[0] === 'all' && args[1] === 'reset')) {
            db.perms.change = {};
            client.save(message.guildId);
            return message.channel.send("Les permissions des commandes ont été **réinitialisées**");
        }
        
        if (!args[0] || !args[1]) {
            return message.channel.send('Usage: `+change <commande> <perm_number/perm_role>`');
        }

        const commandName = args[0].toLowerCase();
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
        if (!command) {
            return message.channel.send(`Aucune commande trouvée pour \`${commandName}\``);
        }

        if (!db.perms.change) db.perms.change = {};

        const special = String(args[1]).toLowerCase();
        if (special === "buyer" || special === "owner") {
            db.perms.change[command.name] = special;
            client.save(message.guildId);
            return message.channel.send(`La permission de la commande \`${command.name}\` a été changée à \`${special}\``);
        }

        if (!isNaN(args[1])) {
            const permLevel = parseInt(args[1]);
            
            if (permLevel < 1 || permLevel > 9) {
                return message.channel.send('Le niveau de permission doit être entre 1 et 9');
            }

            db.perms.change[command.name] = permLevel;
            client.save(message.guildId);
            return message.channel.send(`La permission de la commande \`${command.name}\` a été changée au niveau \`${permLevel}\``);
        } else {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]) || await message.guild.roles.fetch(args[1]).catch(() => null);
            
            if (!role) {
                return message.channel.send('Rôle introuvable. Utilisez une mention, un ID, `buyer` ou `owner`.');
            }

            db.perms.change[command.name] = role.id;
            client.save(message.guildId);
            return message.channel.send(`La permission de la commande \`${command.name}\` a été changée au rôle ${role}`);
        }
    },
}
