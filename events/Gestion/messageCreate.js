const { Client, Message, ChannelType } = require("discord.js");
const { addStrike } = require("../../utiles/strikes");

module.exports = {
    name: "messageCreate",
    /**
     * @param {Client} client
     * @param {Message} message
    */
    async execute(client, message) {
        if (!message.inGuild() || message.author.bot) return;
        const db = client.get(message.guildId);

        if (db.autothreads?.includes(message.channelId)) {
            message.channel.threads.create({
                name: message.author.displayName,
                type: 12,
                autoArchiveDuration: 1440,
                invitable: false
            })
            .then((t) => t.send(`${message.author}`).catch(() => null))
            .catch(() => null);
        }
            
        if (message.channel.type === ChannelType.GuildAnnouncement && db.autopublish === true) {
            message.crosspost().catch(() => null);
        }

        if (db.badwords && db.badword?.some(w => message.content.toLocaleLowerCase().includes(w.toLocaleLowerCase())) && !client.perm(4, message.author.id, message.channelId, message.guild)) {
            addStrike(client, message.member, 'badwords').catch(() => null);
            message.delete().catch(() => null);
        }

        const data = (db.autoreact || []).filter(o => o.channel == message.channelId);
        if (data.length > 0) data.forEach(o => message.react(o.reaction).catch(() => null));
    }
};
