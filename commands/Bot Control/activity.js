const { ActivityType, Client, Message } = require("discord.js");

const typeMap = {
    play: ActivityType.Playing,
    playing: ActivityType.Playing,
    joue: ActivityType.Playing,
    watch: ActivityType.Watching,
    watching: ActivityType.Watching,
    regarde: ActivityType.Watching,
    listen: ActivityType.Listening,
    listening: ActivityType.Listening,
    ecoute: ActivityType.Listening,
    écoute: ActivityType.Listening,
    stream: ActivityType.Streaming,
    streaming: ActivityType.Streaming,
    compet: ActivityType.Competing,
    competing: ActivityType.Competing,
    custom: ActivityType.Custom
};

let rotateInterval = null;

module.exports = {
    name: "activity",
    description: "Modifie l'activité du bot (supporte plusieurs textes alternés séparés par `,,`)",
    category: "Bot Control",
    argument: "<type> <texte>",
    aliases: [],
    permissions: [],
    perm: 8,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (args.length < 2) return message.channel.send(`Format incorrect: essayez \`${client.config.prefix}activity <play/watch/listen/stream/compet> <texte1,,texte2>\``);

        const typeInput = args[0].toLowerCase();
        const actType = typeMap[typeInput] ?? ActivityType.Playing;

        const rawText = args.slice(1).join(' ');
        const phrases = client.cleanInput(rawText);

        if (!phrases.length) return message.channel.send("Veuillez spécifier au moins un texte d'activité.");

        if (rotateInterval) {
            clearInterval(rotateInterval);
            rotateInterval = null;
        }

        client.config.presence ??= {};
        client.config.presence.type = actType;
        client.config.presence.name = phrases[0];
        client.config.presence.phrases = phrases;
        client.saveConfig();

        if (phrases.length === 1) {
            client.user.setActivity({
                name: phrases[0],
                type: actType,
                url: client.config.presence.url || "https://twitch.tv/crowbot"
            });
            return message.channel.send(`L'activité du bot a été définie sur **${phrases[0]}**`);
        }

        let idx = 0;
        client.user.setActivity({
            name: phrases[0],
            type: actType,
            url: client.config.presence.url || "https://twitch.tv/crowbot"
        });

        rotateInterval = setInterval(() => {
            idx = (idx + 1) % phrases.length;
            client.user.setActivity({
                name: phrases[idx],
                type: actType,
                url: client.config.presence.url || "https://twitch.tv/crowbot"
            });
        }, 15000);

        return message.channel.send(`L'activité du bot alternera entre : \`${phrases.join('` / `')}\``);
    },
};
