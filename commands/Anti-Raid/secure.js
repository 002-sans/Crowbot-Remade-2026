const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "secur",
    description: "Affiche la sécurité du bot.",
    category: "Antiraid",
    argument: "[on/off/max]",
    aliases: [],
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
        const db = client.get(message.guildId);

        if (args[0] === 'invite') {
            if (!client.config.owners.includes(message.author.id) && client.config.buyer !== message.author.id) return;
            if (!['on', 'off'].includes(args[1])) return message.channel.send(`Utilisation: \`${db.prefix}secur invite <on/off>\``);
            client.config.securinvite = args[1] === 'on';
            client.saveConfig();
            return message.channel.send(`Secur invite **${args[1] === 'on' ? 'activé' : 'désactivé'}**`);
        }

        switch(args[0]){
            default: 
                const ar = db.antiraid || {};
                const embed = new EmbedBuilder()
                    .setTitle("Securisation du serveur")
                    .setColor(db.color || 16711680)
                    .setDescription(`**Antiban:** \`${ar.antiban?.etat ? "on" : "off"} - ${ar.antiban?.nombre ?? 1} / ${parseTime(ar.antiban?.durée ?? 60000)} ${ar.antiban?.punish ?? ar.punish ?? "derank"}\`
**Antispam:** \`${ar.antispam?.etat ? "on" : "off"} - ${ar.antispam?.nombre ?? 5} / ${parseTime(ar.antispam?.durée ?? 5000)} mute\`
**Antibot:** \`${ar.antibot?.etat ? "on" : "off"} - ${ar.antibot?.punish ?? ar.punish ?? "kick"}\`
**Antichannel:** \`${ar.antichannel?.etat ? "on" : "off"} - ${ar.antichannel?.punish ?? ar.punish ?? "derank"}\`
**Antiemote:** \`${ar.antiemote?.etat ? "on" : "off"} - ${ar.antiemote?.punish ?? ar.punish ?? "derank"}\`
**Antieveryone:** \`${ar.antieveryone?.etat ? "on" : "off"} - ${ar.antieveryone?.punish ?? ar.punish ?? "derank"}\`
**Antikick:** \`${ar.antikick?.etat ? "on" : "off"} - ${ar.antikick?.punish ?? ar.punish ?? "derank"}\`
**Antilink:** \`${ar.antilink?.etat ? "on" : "off"} - ${ar.antilink?.punish ?? ar.punish ?? "mute"}\`
**Antirank:** \`${ar.antirank?.etat ? "on" : "off"} - ${ar.antirank?.punish ?? ar.punish ?? "derank"}\`
**Antirole:** \`${ar.antirole?.etat ? "on" : "off"} - ${ar.antirole?.punish ?? ar.punish ?? "derank"}\`
**Antisticker:** \`${ar.antisticker?.etat ? "on" : "off"} - ${ar.antisticker?.punish ?? ar.punish ?? "derank"}\`
**Antitoken:** \`${ar.antitoken?.etat ? "on" : "off"} - ${ar.antitoken?.nombre ?? 3} / ${parseTime(ar.antitoken?.durée ?? 10000)} ${ar.antitoken?.punish ?? ar.punish ?? "kick"}\`
**Antiunban:** \`${ar.antiunban?.etat ? "on" : "off"} - ${ar.antiunban?.punish ?? ar.punish ?? "derank"}\`
**Antiupdate:** \`${ar.antiupdate?.etat ? "on" : "off"} - ${ar.antiupdate?.punish ?? ar.punish ?? "derank"}\`
**Antiwebhook:** \`${ar.antiwebhook?.etat ? "on" : "off"} - ${ar.antiwebhook?.punish ?? ar.punish ?? "derank"}\`
**Crealimit:** \`${parseTime(ar.crealimit ?? 0)}\`
**Logs de raid:**  ${message.guild.channels.cache.get(db.logs?.raid) || "\`None\`"}`);

                message.channel.send({ embeds: [ embed ] });
                break;
    
            case "on":
                Object.values(db.antiraid || {}).forEach((value) => {
                    if (value && typeof value === 'object') value.etat = true;
                });

                client.save(message.guildId);
                
                const on = new EmbedBuilder()
                    .setTitle("Securisation du serveur")
                    .setColor(db.color)
                    .setDescription(`**Antiban:** \`${db.antiraid.antiban.etat ? "on" : "off"} - ${db.antiraid.antiban.nombre} / ${parseTime(db.antiraid.antiban.durée)} ${db.antiraid.antiban.punish  ?? db.antiraid.punish}\`
                        **Antispam:** \`${db.antiraid.antispam.etat ? "on" : "off"} - ${db.antiraid.antispam.nombre} / ${parseTime(db.antiraid.antispam.durée)} mute\`
                        **Antibot:** \`${db.antiraid.antibot.etat ? "on" : "off"} - ${db.antiraid.antibot.punish  ?? db.antiraid.punish}\`
                        **Antichannel:** \`${db.antiraid.antichannel.etat ? "on" : "off"} - ${db.antiraid.antichannel.punish  ?? db.antiraid.punish}\`
                        **Antiemote:** \`${db.antiraid.antiemote.etat ? "on" : "off"} - ${db.antiraid.antiemote.punish  ?? db.antiraid.punish}\`
                        **Antieveryone:** \`${db.antiraid.antieveryone.etat ? "on" : "off"} - ${db.antiraid.antieveryone.punish  ?? db.antiraid.punish}\`
                        **Antikick:** \`${db.antiraid.antikick.etat ? "on" : "off"} - ${db.antiraid.antikick.punish  ?? db.antiraid.punish}\`
                        **Antilink:** \`${db.antiraid.antilink.etat ? "on" : "off"} - ${db.antiraid.antilink.punish  ?? db.antiraid.punish}\`
                        **Antirank:** \`${db.antiraid.antirank.etat ? "on" : "off"} - ${db.antiraid.antirank.punish  ?? db.antiraid.punish}\`
                        **Antirole:** \`${db.antiraid.antirole.etat ? "on" : "off"} - ${db.antiraid.antirole.punish  ?? db.antiraid.punish}\`
                        **Antisticker:** \`${db.antiraid.antisticker.etat ? "on" : "off"} - ${db.antiraid.antisticker.punish  ?? db.antiraid.punish}\`
                        **AntiMassMention:** \`${db.antiraid.antimassmention.etat ? "on" : "off"} - \`${db.antiraid.antimassmention.nombre}\` ${db.antiraid.antimassmention.punish  ?? db.antiraid.punish}\`
                        **Antiunban:** \`${db.antiraid.antiunban.etat ? "on" : "off"} - ${db.antiraid.antiunban.punish  ?? db.antiraid.punish}\`
                        **Antiupdate:** \`${db.antiraid.antiupdate.etat ? "on" : "off"} - ${db.antiraid.antiupdate.punish  ?? db.antiraid.punish}\`
                        **Antiwebhook:** \`${db.antiraid.antiwebhook.etat ? "on" : "off"} - ${db.antiraid.antiwebhook.punish  ?? db.antiraid.punish}\`
                        **Crealimit:** \`${parseTime(db.antiraid.crealimit)}\`
                        **Logs de raid:**  ${message.guild.channels.cache.get(db.logs.raid) || "\`None\`"}`.replaceAll("                        ", ""))

                message.channel.send({ embeds: [ on ] });
                break;
    

            case 'off':
                Object.values(db.antiraid).forEach((value) => {
                    value.etat = false
                })
            
                client.save(message.guildId);
                
                const off = new EmbedBuilder()
                    .setTitle("Securisation du serveur")
                    .setColor(db.color)
                    .setDescription(`**Antiban:** \`${db.antiraid.antiban.etat ? "on" : "off"} - ${db.antiraid.antiban.nombre} / ${parseTime(db.antiraid.antiban.durée)} ${db.antiraid.antiban.punish  ?? db.antiraid.punish}\`
                        **Antispam:** \`${db.antiraid.antispam.etat ? "on" : "off"} - ${db.antiraid.antispam.nombre} / ${parseTime(db.antiraid.antispam.durée)} mute\`
                        **Antibot:** \`${db.antiraid.antibot.etat ? "on" : "off"} - ${db.antiraid.antibot.punish  ?? db.antiraid.punish}\`
                        **Antichannel:** \`${db.antiraid.antichannel.etat ? "on" : "off"} - ${db.antiraid.antichannel.punish  ?? db.antiraid.punish}\`
                        **Antiemote:** \`${db.antiraid.antiemote.etat ? "on" : "off"} - ${db.antiraid.antiemote.punish  ?? db.antiraid.punish}\`
                        **Antieveryone:** \`${db.antiraid.antieveryone.etat ? "on" : "off"} - ${db.antiraid.antieveryone.punish  ?? db.antiraid.punish}\`
                        **Antikick:** \`${db.antiraid.antikick.etat ? "on" : "off"} - ${db.antiraid.antikick.punish  ?? db.antiraid.punish}\`
                        **Antilink:** \`${db.antiraid.antilink.etat ? "on" : "off"} - ${db.antiraid.antilink.punish  ?? db.antiraid.punish}\`
                        **Antirank:** \`${db.antiraid.antirank.etat ? "on" : "off"} - ${db.antiraid.antirank.punish  ?? db.antiraid.punish}\`
                        **Antirole:** \`${db.antiraid.antirole.etat ? "on" : "off"} - ${db.antiraid.antirole.punish  ?? db.antiraid.punish}\`
                        **Antisticker:** \`${db.antiraid.antisticker.etat ? "on" : "off"} - ${db.antiraid.antisticker.punish  ?? db.antiraid.punish}\`
                        **AntiMassMention:** \`${db.antiraid.antimassmention.etat ? "on" : "off"} - \`${db.antiraid.antimassmention.nombre}\` ${db.antiraid.antimassmention.punish  ?? db.antiraid.punish}\`
                        **Antiunban:** \`${db.antiraid.antiunban.etat ? "on" : "off"} - ${db.antiraid.antiunban.punish  ?? db.antiraid.punish}\`
                        **Antiupdate:** \`${db.antiraid.antiupdate.etat ? "on" : "off"} - ${db.antiraid.antiupdate.punish  ?? db.antiraid.punish}\`
                        **Antiwebhook:** \`${db.antiraid.antiwebhook.etat ? "on" : "off"} - ${db.antiraid.antiwebhook.punish  ?? db.antiraid.punish}\`
                        **Crealimit:** \`${parseTime(db.antiraid.crealimit)}\`
                        **Logs de raid:**  ${message.guild.channels.cache.get(db.logs.raid) || "\`None\`"}`.replaceAll("                        ", ""))

                message.channel.send({ embeds: [ off ] });
                break;
    
            
            case 'max':

                Object.values(db.antiraid).forEach((value) => {
                    value.max = true
                    value.etat = true
                })

                client.save(message.guildId);
                
                const max = new EmbedBuilder()
                    .setTitle("Securisation du serveur")
                    .setColor(db.color)
                    .setDescription(`**Antiban:** \`${db.antiraid.antiban.etat ? "on" : "off"} - ${db.antiraid.antiban.nombre} / ${parseTime(db.antiraid.antiban.durée)} ${db.antiraid.antiban.punish  ?? db.antiraid.punish}\`
                        **Antispam:** \`${db.antiraid.antispam.etat ? "on" : "off"} - ${db.antiraid.antispam.nombre} / ${parseTime(db.antiraid.antispam.durée)} mute\`
                        **Antibot:** \`${db.antiraid.antibot.etat ? "on" : "off"} - ${db.antiraid.antibot.punish  ?? db.antiraid.punish}\`
                        **Antichannel:** \`${db.antiraid.antichannel.etat ? "on" : "off"} - ${db.antiraid.antichannel.punish  ?? db.antiraid.punish}\`
                        **Antiemote:** \`${db.antiraid.antiemote.etat ? "on" : "off"} - ${db.antiraid.antiemote.punish  ?? db.antiraid.punish}\`
                        **Antieveryone:** \`${db.antiraid.antieveryone.etat ? "on" : "off"} - ${db.antiraid.antieveryone.punish  ?? db.antiraid.punish}\`
                        **Antikick:** \`${db.antiraid.antikick.etat ? "on" : "off"} - ${db.antiraid.antikick.punish  ?? db.antiraid.punish}\`
                        **Antilink:** \`${db.antiraid.antilink.etat ? "on" : "off"} - ${db.antiraid.antilink.punish  ?? db.antiraid.punish}\`
                        **Antirank:** \`${db.antiraid.antirank.etat ? "on" : "off"} - ${db.antiraid.antirank.punish  ?? db.antiraid.punish}\`
                        **Antirole:** \`${db.antiraid.antirole.etat ? "on" : "off"} - ${db.antiraid.antirole.punish  ?? db.antiraid.punish}\`
                        **Antisticker:** \`${db.antiraid.antisticker.etat ? "on" : "off"} - ${db.antiraid.antisticker.punish  ?? db.antiraid.punish}\`
                        **AntiMassMention:** \`${db.antiraid.antimassmention.etat ? "on" : "off"} - \`${db.antiraid.antimassmention.nombre}\` ${db.antiraid.antimassmention.punish  ?? db.antiraid.punish}\`
                        **Antiunban:** \`${db.antiraid.antiunban.etat ? "on" : "off"} - ${db.antiraid.antiunban.punish  ?? db.antiraid.punish}\`
                        **Antiupdate:** \`${db.antiraid.antiupdate.etat ? "on" : "off"} - ${db.antiraid.antiupdate.punish  ?? db.antiraid.punish}\`
                        **Antiwebhook:** \`${db.antiraid.antiwebhook.etat ? "on" : "off"} - ${db.antiraid.antiwebhook.punish  ?? db.antiraid.punish}\`
                        **Crealimit:** \`${parseTime(db.antiraid.crealimit)}\`
                        **Logs de raid:**  ${message.guild.channels.cache.get(db.logs.raid) || "\`None\`"}`.replaceAll("                        ", ""))

                message.channel.send({ embeds: [ max ] });
                break
        }
    },
}

function parseTime(ms) {
    const timeUnits = [
        { label: 'j', value: 86400000 },
        { label: 'h', value: 3600000 },
        { label: 'm', value: 60000 },
        { label: 's', value: 1000 },
    ];

    let remainingTime = ms;
    let result = '';

    for (const unit of timeUnits) {
        const amount = Math.floor(remainingTime / unit.value);
        if (amount > 0) {
            result += `${amount}${unit.label} `;
            remainingTime %= unit.value;
        }
    }

    return result.trim() || '0s';
}
