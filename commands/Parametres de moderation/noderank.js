const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "noderank",
    description: "Défini/supprime des rôles qui ne seront plus supprimé en cas de derank",
    category: "Paramètres de modération",
    argument: "<add/del/list> [rôle]",
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
        db.antiraid ??= {};
        db.antiraid.noderank ??= [];

        if (args[0] === 'list' || !args[0]) {
            const list = db.antiraid.noderank.filter(id => message.guild.roles.cache.has(id));
            const embed = new EmbedBuilder()
                .setTitle("Liste des rôles noderank")
                .setColor(typeof db.color === 'string' ? parseInt(db.color.replace('#', ''), 16) || 0xff0000 : (db.color || 0xff0000))
                .setDescription(list.length === 0 ? "Aucun rôle configuré" : list.map((id, i) => `\`${i + 1}\` - <@&${id}>`).join('\n'));
            return message.channel.send({ embeds: [embed] });
        }

        if (args[0] === 'add') {
            const roles = await client.resolveRoles(message.guild, args.slice(1).join(' '), message.mentions.roles);
            if (!roles.length) return message.channel.send(`Aucun rôle de trouvé pour \`${args.slice(1).join(' ') || 'rien'}\``);

            const added = [];
            for (const role of roles) {
                if (!db.antiraid.noderank.includes(role.id)) {
                    db.antiraid.noderank.push(role.id);
                    added.push(role.name);
                }
            }
            client.save(message.guildId);

            if (added.length === 1) {
                return message.channel.send(`Le rôle \`${added[0]}\` ne sera pas enlevé lors d'un derank`);
            }
            if (added.length > 1) {
                return message.channel.send(`Les rôles \`${added.join(', ')}\` ne seront pas enlevés lors d'un derank`);
            }
            return message.channel.send("Ces rôles sont déjà dans le noderank");
        }

        if (args[0] === 'del') {
            const roles = await client.resolveRoles(message.guild, args.slice(1).join(' '), message.mentions.roles);
            if (!roles.length) return message.channel.send(`Aucun rôle de trouvé pour \`${args.slice(1).join(' ') || 'rien'}\``);

            const removed = [];
            for (const role of roles) {
                if (db.antiraid.noderank.includes(role.id)) {
                    db.antiraid.noderank = db.antiraid.noderank.filter(id => id !== role.id);
                    removed.push(role.name);
                }
            }
            client.save(message.guildId);

            if (removed.length === 1) {
                return message.channel.send(`Le rôle \`${removed[0]}\` sera de nouveau enlevé lors d'un derank`);
            }
            if (removed.length > 1) {
                return message.channel.send(`Les rôles \`${removed.join(', ')}\` seront de nouveau enlevés lors d'un derank`);
            }
            return message.channel.send("Ces rôles ne sont pas dans le noderank");
        }
    },
};
