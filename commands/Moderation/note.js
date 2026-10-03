const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "note",
    description: "Ajoute une note de modération à un membre ou consulte ses notes.",
    category: "Modération",
    argument: "<membre> [raison]",
    aliases: [],
    permissions: [],
    perm: 2,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);

        const isDelete = args[0]?.toLowerCase() === "delete";
        const memberArg = isDelete ? args[1] : args[0];
        const member = message.mentions.members.first() || message.guild.members.cache.get(memberArg) || await message.guild.members.fetch(memberArg).catch(() => null);
        if (!member || !args[0]) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] ?? "rien"}\``);

        if (isDelete) {
            const deleteArg = args[2]?.toLowerCase();
            const notes = db.notes?.[member.id] ?? [];

            if (!deleteArg || (deleteArg !== "all" && !/^\d+$/.test(deleteArg))) {
                return message.channel.send(`Utilisation : \`${db.prefix ?? "+"}note delete @user <nombre/all>\``);
            }

            let deletedCount = 0;
            if (deleteArg === "all") {
                deletedCount = notes.length;
                if (db.notes?.[member.id]) delete db.notes[member.id];
            } else {
                const noteIndex = Number(deleteArg) - 1;
                if (noteIndex >= 0 && noteIndex < notes.length) {
                    notes.splice(noteIndex, 1);
                    deletedCount = 1;
                }
            }

            if (!deletedCount) return message.channel.send(`Aucune note trouvée pour ${member.user.displayName}.`);

            return message.channel.send(
                deletedCount === 1
                    ? `Une note a été supprimée de ${member.user.displayName}`
                    : `${deletedCount} notes ont été supprimées de ${member.user.displayName}`
            );
        }

        if (!args[1]){
            const notes = db.notes?.[member.id] ?? [];
            const embed = new EmbedBuilder()
                .setTitle(`Notes de ${member.user.displayName}`)
                .setColor(db.color)
                .setDescription(notes.length
                    ? notes.map((note, i) => {
                        const timestamp = Math.floor((note.time ?? note.date ?? Date.now()) / 1000);
                        return `**${i + 1}.** <t:${timestamp}:R> : ${member.user.displayName} (${member.id})\n\`\n${note.reason}\n\``;
                    }).join("\n")
                    : "Aucune note")
                .setFooter({ text: `1/1 • ${db.footer ?? 'ζ͜͡Crow Bots'}` });

            return message.channel.send({ embeds: [embed] });
        }
        else {
            if (!db.notes)
                db.notes = {};
            if (!db.notes[member.id])
                db.notes[member.id] = [];

            db.notes[member.id].push({ time: Date.now(), reason: args.slice(1).join(" ") });
            return message.channel.send(`Note ajoutée pour ${member}.`);
        }
    }
};
