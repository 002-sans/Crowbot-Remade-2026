const { isExemptUser, isWhitelisted, getModule } = require("../../utiles/antiraid");
const data = {};
const { addStrike } = require("../../utiles/strikes");

module.exports = {
    name: "messageCreate",
    async execute(client, message) {
        if (!message.inGuild() || !message.member || message.author.bot) return;
        if (isExemptUser(client, message.guild, message.author.id)) return;

        const db = client.get(message.guildId);
        const conf = getModule(db, "antispam");
        if (!conf.etat) return;
        if (isWhitelisted(db, message.member, "antispam") && !conf.max) return;

        const key = message.channelId + message.author.id;
        if (!data[key]) data[key] = { count: 0, messages: [], timer: null };
        const userData = data[key];
        userData.count++;
        userData.messages.push(message);

        if (!userData.timer) {
            userData.timer = setTimeout(() => delete data[key], Number(conf.durée) || 10000);
        }

        if (userData.count >= Number(conf.nombre || 7)) {
            addStrike(client, message.member, 'spam').catch(() => null);
            message.channel.bulkDelete(userData.messages).catch(() => null);
            // Sans clearTimeout, le minuteur restant effacerait la fenêtre suivante.
            clearTimeout(userData.timer);
            delete data[key];
            message.channel.send(`**${message.member} Vous envoyez des messages trop rapidement**`)
                .then(m => setTimeout(() => m.delete().catch(() => null), 5000));
            client.punish(db, conf.punish || "mute", message.member, "spam");
        }
    },
};
