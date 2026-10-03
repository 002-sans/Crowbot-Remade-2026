# Crowbot Remade 2026

Remade de Crowbot pour Discord — modération, anti-raid, logs, tickets, giveaways et configuration serveur.

Dépôt : [002-sans/Crowbot-Remade-2026](https://github.com/002-sans/Crowbot-Remade-2026)

---

## Sommaire

1. [Prérequis](#prérequis)
2. [Installation & lancement](#installation--lancement)
3. [Configuration (config.json)](#configuration-configjson)
4. [Système de permissions](#système-de-permissions)
5. [Liste complète des commandes](#liste-complète-des-commandes)
6. [Données & fichiers](#données--fichiers)
7. [Dépannage](#dépannage)

---

## Prérequis

- [Node.js](https://nodejs.org/) **18+** (LTS recommandé)
- Un bot Discord créé sur le [Developer Portal](https://discord.com/developers/applications)
- Intents **Privileged** activés sur le bot :
  - **Presence Intent**
  - **Server Members Intent**
  - **Message Content Intent**

---

## Installation & lancement

### 1. Télécharger / cloner le projet

```bash
git clone https://github.com/002-sans/Crowbot-Remade-2026.git
cd Crowbot-Remade-2026
```

Ou télécharge le ZIP depuis GitHub puis extrais le dossier.

### 2. Créer et remplir `config.json`

Si le fichier n'existe pas, copie l'exemple :

- Windows (CMD) : `copy config.example.json config.json`
- PowerShell : `Copy-Item config.example.json config.json`
- Linux / macOS : `cp config.example.json config.json`

Ouvre **`config.json`** et complète au minimum :

| Champ | À mettre |
| --- | --- |
| `token` | Token du bot (Portal → Bot → Reset Token) |
| `buyer` | Ton **ID Discord** (Paramètres → Avancés → Mode développeur → clic droit sur ton profil → Copier l'identifiant) |
| `prefix` | Préfixe des commandes (ex. `!`) |
| `color` | Couleur des embeds (ex. `#2f3136`) |
| `support` | Lien d'invitation / support |
| `owners` | Liste d'IDs owners (peut rester `[]` au début) |

Exemple minimal :

```json
{
    "token": "TON_TOKEN",
    "color": "#2f3136",
    "prefix": "!",
    "support": "https://discord.gg/ton-invite",
    "presence": {
        "status": "online",
        "type": 0,
        "name": "▸ Crow Bots",
        "url": "https://twitch.tv/exemple"
    },
    "buyer": "TON_ID_DISCORD",
    "owners": []
}
```

> Ne partage **jamais** ton `config.json` (token). Seul `config.example.json` doit être public.

### 3. Lancer le bot avec `start.bat` (Windows)

1. Vérifie que `config.json` est bien rempli
2. Double-clique sur **`start.bat`** (ou lance-le dans un terminal)

Le script :

1. Vérifie si `node_modules` existe
2. Lance `npm i` automatiquement si besoin
3. Démarre le bot avec `node .`

### Lancement manuel (Linux / macOS / sans bat)

```bash
npm install
node .
```

Ou :

```bash
npm start
```

---

## Configuration (config.json)

| Champ | Description |
| --- | --- |
| `token` | Token Discord du bot |
| `color` | Couleur hex des embeds |
| `prefix` | Préfixe global par défaut (modifiable par serveur) |
| `support` | Lien support / Crow Bots |
| `presence.status` | `online`, `idle`, `dnd`, `invisible` |
| `presence.type` | 0 Playing · 1 Streaming · 2 Listening · 3 Watching · 5 Competing |
| `presence.name` | Texte de l'activité |
| `presence.url` | URL Twitch (streaming) |
| `buyer` | Propriétaire du bot — **accès total** |
| `owners` | Owners du bot (gérés aussi via `owner` / `unowner`) |

### Buyer vs Owners

| Rôle | Droits |
| --- | --- |
| **Buyer** | Toutes les commandes + `owner` / `unowner` |
| **Owners** | Commandes réservées Owner + perms 1 à 9 |
| Autres | Selon les niveaux `setperm` sur le serveur |

---

## Système de permissions

Chaque commande a un niveau par défaut (**1** à **9**), ou est réservée **Owner** / **Buyer**.

### Hiérarchie

| Niveau | Accès |
| --- | --- |
| **Buyer** | Uniquement `config.buyer` |
| **Owner** | Buyer + `config.owners` |
| **Perm 9 → 1** | Membres / rôles ayant ce niveau **ou un niveau supérieur** |
| **Perm 1** | Aussi si les commandes publiques sont activées (`public`) |

Exemple : avoir la **perm 5** autorise les commandes en perm **1 à 5**.

### Gérer les permissions

| Commande | Effet |
| --- | --- |
| `perms` | Affiche buyer, owners, niveaux 1–9 et perms supplémentaires |
| `setperm <niveau> <@role/@membre>` | Ajoute un rôle/membre à un niveau |
| `setperm <niveau> <commande>` | Place une commande sur un niveau (ex. `setperm 9 ban`) |
| `setperm <commande> <@role/@membre>` | Donne uniquement cette commande |
| `set perm …` | Alias de `setperm` |
| `delperm …` / `del perm …` | Retire une attribution |
| `change <commande> <1-9/buyer/owner/@role>` | Change le niveau requis d'une commande |
| `changeall <de> <vers>` | Déplace toutes les commandes d'un niveau vers un autre |
| `change reset` | Remet les overrides de commandes par défaut |

Exemples (préfixe `!`) :

```text
!setperm 3 @Modérateurs
!setperm 9 ban
!setperm ban @Jean
!change kick 4
!delperm 3 @Modérateurs
!perms
```

### Niveaux par défaut (résumé)

| Niveau | Type de commandes |
| --- | --- |
| **1** | Utilitaires (`help`, `ping`, `user`, …) |
| **2** | Modération (`ban`, `kick`, `mute`, …) |
| **3** | Params modération + logs |
| **4** | Gestion (giveaways, embeds, backups, …) |
| **6** | Anti-raid |
| **7** | Config serveur (tickets, tempvoc, …) |
| **8** | Gestion des perms / blacklist / theme |
| **Owner** | Contrôle global du bot |
| **Buyer** | `owner`, `unowner` |

---

## Liste complète des commandes

> **204 commandes** — la permission indiquée est le niveau **par défaut** (modifiable avec `change` / `setperm`).


### Antiraid (23)

| Commande | Alias | Arguments | Permission | Description |
| --- | --- | --- | --- | --- |
| `antiban` | - | `<on/off/max> <nombre>/<durée>` | 6 | Permet de paramétrer l'antiban. |
| `antibot` | - | `<on/off/max>` | 6 | Permet de paramétrer l'antibot. |
| `antichannel` | - | `<on/off/max>` | 6 | Permet de paramétrer l'antichannel. |
| `antideco` | - | `<off/on/max> [nombre/durée]` | 6 | Active/désactive l'antideco |
| `antiemote` | - | `<on/off/max>` | 6 | Permet de paramétrer l'antiemote. |
| `antieveryone` | - | `<on/off/max>` | 6 | Permet de paramétrer l'antieveryone. |
| `antikick` | - | `<on/off/max>` | 6 | Permet de paramétrer l'antikick. |
| `antilink` | link | `<on/off> <invite/all>` | 6 | Active/désactive la protection contre les liens. |
| `antimassmention` | - | `<on/off/max/nombre>` | 6 | Permet de paramétrer l'antimassmention. |
| `antimove` | - | `<off/on/max> [nombre/durée]` | 6 | Active/désactive l'antimove |
| `antirank` | - | `<on/off/max>` | 6 | Permet de paramétrer l'antirank. |
| `antirole` | - | `<on/off/max>` | 6 | Permet de paramétrer l'antirole. |
| `antisticker` | - | `<on/off/max>` | 6 | Permet de paramétrer l'antisticker. |
| `antitoken` | - | `<on/off> <nombre>/<durée>` | 6 | Permet de paramétrer l'antitoken. |
| `antiunban` | - | `<on/off/max>` | 6 | Permet de paramétrer l'antiunban. |
| `antiupdate` | - | `<on/off/max>` | 6 | Permet de paramétrer l'antiupdate. |
| `antiwebhook` | - | `<on/off/max>` | 6 | Permet de paramétrer l'antiwebhook. |
| `blrank` | - | `[on/off/max/danger/all/add/del] [membre]` | 6 | Gère la blacklist rank |
| `crealimit` | - | `<durée>` | 6 | Permet de paramétrer la limite de création de compte. |
| `punish` | punition | `<all/module/add/del/setup> ...` | 6 | Gère les punitions antiraid ou strikes |
| `raidmode` | - | `-` | 6 | Permet d'empêcher de rejoindre le serveur. |
| `raidping` | - | `<rôle>` | 6 | Modifie les rôles mentionnés en cas de raid |
| `secur` | - | `[on/off/max]` | 6 | Affiche la sécurité du bot. |

### Bot Control (26)

| Commande | Alias | Arguments | Permission | Description |
| --- | --- | --- | --- | --- |
| `activity` | - | `<type> <texte>` | 8 | Modifie l'activité du bot (supporte plusieurs textes alternés séparés par `,,`) |
| `alias` | - | `<commande>` | Owner | Gère les alias des commandes |
| `compet` | - | `-` | Owner | Change l'activité du bot en participe à ... |
| `customactivity` | - | `-` | Owner | Change l'activité du bot en status personnalisé ... |
| `discussion` | - | `<ID/nombre>` | Owner | Permet de discuter à travers le bot sur un serveur |
| `dnd` | - | `-` | Owner | Met le bot en mode ne pas déranger. |
| `helpalias` | - | `<on/off>` | Owner | Active/désactive l'affichage des alias dans le help |
| `helptype` | - | `<button/select/hybrid>` | Owner | Change le mode de navigation du menu help |
| `idle` | - | `-` | Owner | Met le bot en mode inactif. |
| `invisible` | - | `-` | Owner | Met le bot en mode invisible. |
| `invite` | - | `<numéro/ID>` | Owner | Crée un lien d'invitation pour un serveur. |
| `leaveserver` | leavebot | `<numéro/ID>` | Owner | Quitte un serveur du bot. |
| `listen` | - | `-` | Owner | Change l'activité du bot en écoute ... |
| `mainprefix` | - | `[global] <prefix>` | Owner | Modifie le prefix du bot dans un serveur ou globalement |
| `mobile` | - | `-` | Owner | Met le bot en mode en ligne sur mobile. |
| `mpsettings` | - | `-` | Owner | Configure les messages privés du bot |
| `playto` | - | `-` | Owner | Change l'activité du bot en joue à ... |
| `remove` | - | `activity` | Owner | Supprime l'activité du bot |
| `reset` | resetall | `<server/all>` | Owner | Réinitialise les paramètres du bot |
| `say` | - | `<texte>` | Owner | Faire dire un message au bot |
| `serverlist` | sl | `-` | Owner | Affiche la liste des serveurs du bot. |
| `set` | - | `-` | - | Modifie le bot ou le rôle mute |
| `setprefix` | - | `[global] <prefix>` | Owner | Modifie le prefix du bot dans un serveur ou globalement |
| `stream` | - | `-` | Owner | Change l'activité du bot en stream sur ... |
| `streamurl` | - | `<lien>` | Owner | Modifie le lien twitch du bot |
| `watch` | - | `-` | Owner | Change l'activité du bot en regarde ... |

### Configuration du serveur (27)

| Commande | Alias | Arguments | Permission | Description |
| --- | --- | --- | --- | --- |
| `add` | - | `<membre>` | 7 | Ajoute un membre au ticket |
| `autodelete` | - | `<moderation/snipe> <commande/reply> <on/off>` | 7 | Active/désactive la suppression automatique des commandes |
| `autopublish` | - | `<on/off>` | 7 | Publie automatiquement un message dans un salon d'actualitées |
| `claim` | - | `-` | 7 | Permet de claim un ticket |
| `close` | - | `[raison]` | 7 | Ferme le ticket |
| `counters` | counter, compteur, compteurs | `-` | 7 | Envoie un panel pour gérer les counters du serveur |
| `custom` | - | `<mot-clé>` | 7 | Crée ou modifie une commande personnalisée |
| `customlist` | - | `-` | 7 | Affiche la liste des commandes custom |
| `join` | - | `settings` | 3 | Affiche le panneau de paramétrage des arrivées |
| `leave` | - | `-` | 3 | Affiche un menu interactif pour paramétrer les départs |
| `limit` | - | `-` | 1 | Permet de modifier la limite du vocal temporaire |
| `modmail` | - | `-` | 7 | Paramètre les modmails du bot |
| `open` | - | `-` | 1 | Permet d'ouvrir le vocal temporaire |
| `private` | - | `-` | 1 | Permet de rendre privé le vocal temporaire |
| `reminder` | - | `[nombre/list]` | 7 | Crée ou liste des reminders |
| `rename` | - | `<nom>` | 7 | Permet de renommer le vocal temporaire |
| `report` | - | `settings` | 7 | Paramètre les reports |
| `restrict` | - | `<émoji> <rôle>` | 7 | Rend un émoji accessible seulement à certains rôles |
| `rolemenu` | - | `-` | 7 | Affiche un menu interactif pour créer ou modifier un menu de rôles |
| `show` | showpics, showpic | `pics` | 7 | Envoie automatiquement des photos de profil |
| `soutien` | soutiens | `-` | 7 | Permet de récompenser les personnes qui soutiennent le serveur |
| `suggestion` | - | `<message/settings>` | 1 | Poste une suggestion ou configure le système |
| `tempvoc` | - | `-` | 7 | Affiche un menu interactif pour gérer les vocaux temporaires sur le serveur |
| `ticket` | - | `settings` | 7 | Affiche un menu permettant de gérer le système de ticket |
| `twitch` | - | `-` | 7 | Permet de régler des alertes lorsque des membres du serveur sont en live sur Twitch |
| `unrestrict` | - | `<émoji>` | 7 | Rend un émoji accessible à tout le monde |
| `variables` | vars, variable | `-` | 7 | Affiche les variables du bot |

### Devs (1)

| Commande | Alias | Arguments | Permission | Description |
| --- | --- | --- | --- | --- |
| `eval` | - | `-` | Owner | Eval un code. |

### Gestion (25)

| Commande | Alias | Arguments | Permission | Description |
| --- | --- | --- | --- | --- |
| `addemoji` | - | `<emoji>` | 4 | Ajoute un emoji au serveur |
| `autobackup` | - | `<serveur/emoji> <jours>` | 4 | Configure les backups automatiques |
| `autoreact` | - | `[add/remove] [salon/numéro] [emoji]` | 4 | Gère l'autoreact du serveur |
| `backup` | - | `<emoji/serveur> <nom>` | 4 | Crée la backup des emojis ou du serveur |
| `bringall` | - | `<salon>` | 4 | Déplace tous les membres en vocal dans un salon |
| `button` | - | `<add/del> <lien>` | 4 | Ajoute/supprime un bouton de décoration sur un message du bot |
| `choose` | - | `-` | 4 | Lance un tirage au sort instantané sur un message |
| `cleanup` | - | `<salon>` | 4 | Déconnecte tous les membres d'un salon vocal |
| `drop` | - | `-` | 4 | Envoie un panel pour crée un drop |
| `embed` | - | `-` | 4 | Envoie un panel pour crée un embed |
| `formulaire` | - | `[ID]` | 4 | Crée un formulaire avec bouton |
| `giveaway` | - | `[reroll/list/pause/unpause/end] [ID]` | 4 | Envoie un panel pour créer un giveaway |
| `loading` | - | `<temps> <texte>` | 4 | Envoie une barre de chargement |
| `massiverole` | - | `-` | 4 | Ajoute/retire un rôle à plusieurs membres |
| `newsticker` | - | `[nom]` | 4 | Crée un nouveau sticker sur le serveur |
| `openmodmail` | - | `<membre>` | 4 | Ouvre un ticket modmail manuellement |
| `participant` | - | `<ID du message>` | 4 | Affiche les participants d’un giveaway |
| `r` | - | `<message>` | 4 | Répond à un modmail |
| `reroll` | - | `<ID>` | 4 | Reroll un giveaway |
| `sync` | - | `<catégorie/salon/all> [salon]` | 4 | Synchronise les permissions des salons du serveur à leurs catégories |
| `temprole` | - | `<membre> <rôle> <durée>` | 4 | Ajoute un rôle à un membre pour une durée |
| `unmassiverole` | - | `[rôle] [rôle]` | 4 | Retire un rôle à tous les membres |
| `untemprole` | - | `<membre> <rôle>` | 4 | Supprime un temprôle d'un membre |
| `voicekick` | - | `<membre>` | 4 | Permet d'expulser un membre du vocal temporaire |
| `voicemove` | - | `<vocal1> <vocal2>` | 4 | Déplace les membres d'un salon vocal vers un autre salon vocal |

### Logs (9)

| Commande | Alias | Arguments | Permission | Description |
| --- | --- | --- | --- | --- |
| `autoconfiglog` | - | `-` | 3 | Crée la configuration des logs automatiquement. |
| `boostlog` | boostembed | `on/off [salon]` | 3 | Active/désactive les logs des boosts. |
| `messagelog` | - | `on/off [salon]` | 3 | Active/désactive les logs de messages. |
| `nolog` | - | `add/del [salon]` | 3 | Retire une activité textuel/vocal des logs. |
| `raidlog` | - | `on/off [salon]` | 3 | Active/désactive les logs des raids. |
| `rolelog` | - | `on/off [salon]` | 3 | Active/désactive les logs des rôles. |
| `set-modlogs` | set-modlog | `-` | 3 | Paramètre les événements affichés dans les logs de modération. |
| `updatelog` | - | `on/off [salon]` | 3 | Active/désactive les logs des update. |
| `voicelog` | - | `on/off [salon]` | 3 | Active/désactive les logs des vocaux. |

### Modération (38)

| Commande | Alias | Arguments | Permission | Description |
| --- | --- | --- | --- | --- |
| `addrole` | - | `<membre> <role>` | 2 | Permet de donner un ou des rôles a un membre. |
| `ban` | - | `<membre> [raison]` | 2 | Permet de bannir un utilisateur du serveur. |
| `banclear` | - | `-` | 3 | Supprime les messages récents lors d'un bannissement. |
| `banlist` | - | `-` | 2 | Permet de voir la liste des utilisateurs bannis. |
| `clear` | - | `[nombre] [membre]` | 2 | Permet de supprimer un certain nombre de messages. |
| `cmute` | - | `<membre> [raison]` | 2 | Mute un ou plusieurs membres sur le salon actuel, une raison peut être précisée. |
| `del` | - | `<membre> <nombre>` | 2 | Supprime une sanction ou retire un membre d'un ticket |
| `del-sanction` | delsanction | `<membre> <nombre>` | 2 | Supprime une sanction pour un membre |
| `delrole` | - | `<membre> <role>` | 2 | Permet d'enlever un ou des rôles a un membre. |
| `derank` | - | `<membre> [raison]` | 2 | Permet de retirer tous les rôles a un membre. |
| `hide` | - | `[salon/all]` | 2 | Permet de cacher un channel. |
| `hideall` | - | `-` | 2 | Cache tous les salons du serveur |
| `kick` | - | `<membre> [raison]` | 2 | Permet d'expulser un membre du serveur. |
| `lock` | - | `[salon/all]` | 2 | Permet de verrouiller un channel. |
| `lockall` | - | `-` | 2 | Ferme tous les salons du serveur |
| `lockname` | - | `<membre> <pseudo>` | 2 | Verrouille le pseudo d'un membre. |
| `locknamelist` | - | `-` | 2 | Affiche la liste des pseudos verrouillés. |
| `move` | forcemove | `<membre/channel> [channel]` | 2 | Permet de déplacer un utilisateur ou tous les utilisateurs dans votre salon vocal. |
| `mute` | - | `<membre> [temps] [raison]` | 2 | Permet de mute l'utilisateur mentionné. |
| `mutelist` | - | `-` | 2 | Permet de visionner la liste des utilisateurs en timeout. |
| `nick` | - | `<membre> [nom]` | 2 | Change le pseudo d'un membre sur le serveur. |
| `note` | - | `<membre> [raison]` | 2 | Ajoute une note de modération à un membre ou consulte ses notes. |
| `renew` | - | `[salon]` | 2 | Permet de recrée un salon. |
| `sanctions` | - | `<membre>` | 2 | Affiche les sanctions reçues par un membre |
| `slowmode` | - | `<temps> [salon]` | 3 | Met un cooldown dans un salon. |
| `tempban` | - | `<membre> <durée> [raison]` | 2 | Bannit un ou plusieurs membres du serveur pour une durée déterminée, une raison peut être précisée. |
| `tempcmute` | - | `<membre> [raison]` | 2 | Mute un ou plusieurs membres sur le salon actuel, une raison peut être précisée. |
| `tempmute` | - | `<membre> <durée> [raison]` | 2 | Mute un membre pour une durée déterminée |
| `unban` | - | `<membre/all>` | 2 | Permet de débannir un membre. |
| `uncmute` | - | `<membre>` | 2 | Met fin au cmute d'un ou plusieurs membres. |
| `unhide` | - | `[salon/all]` | 2 | Permet de rendre visible un channel. |
| `unhideall` | - | `-` | 2 | Affiche tous les salons du serveur |
| `unlock` | - | `[salon/all]` | 2 | Permet de déverrouiller un channel. |
| `unlockall` | - | `-` | 2 | Réouvre tous les salons du serveur |
| `unlockname` | - | `<membre>` | 2 | Déverrouille le pseudo d'un membre. |
| `unmute` | - | `<membre/all>` | 2 | Permet d'unmute un utilisateur. |
| `unmuteall` | - | `-` | 2 | Supprime tous les mutes en cours |
| `warn` | - | `<membre> [raison]` | 2 | Donne un warn à un ou plusieurs membres, une raison peut être précisée |

### Owners (16)

| Commande | Alias | Arguments | Permission | Description |
| --- | --- | --- | --- | --- |
| `bl` | blacklist | `[user] [raison]` | 8 | Blacklist un utilisateur du bot |
| `blinfo` | - | `[user]` | 8 | Affiche les informations d'un utilisateur blacklist |
| `change` | - | `<commande> <perm_number/perm_role>` | 8 | Modifie la permission requise pour une commande |
| `changeall` | - | `<permission> <permission>` | 8 | Transfere toutes les commandes d'une permission vers une autre |
| `delperm` | - | `<perm/commande> <role/user>` | 8 | Retire une permission (niveau ou commande) à un rôle ou un membre |
| `mp` | dm | `<membre> <texte>` | 8 | Envoie un message privé à un memebre du serveur |
| `owner` | - | `[user]` | Buyer | Ajoute un utilisateur à la liste des owners du bot |
| `owners` | - | `[user]` | Owner | Affiche al liste des owners |
| `perms` | - | `-` | 8 | Affiche la liste des permissions |
| `revive` | - | `<user>` | 8 | Unblacklist et débanni un utilisateurs de tous les serveurs |
| `setperm` | - | `<niveau> <commande\|@role/@membre> \| <commande> <@role/@membre>` | 8 | Donne une permission (niveau ou commande) à un rôle ou un membre |
| `theme` | - | `<couleur>` | 8 | Modifie la couleur des embeds du serveur |
| `unbl` | unblacklist | `<user>` | 8 | Retire un utilisateur de la blacklist du bot |
| `unowner` | - | `<user>` | Buyer | Retire un owner du bot |
| `unwl` | unwhitelist | `<member/role>` | 6 | Permet d'enlever un utilisateur de la whitelist. |
| `wl` | whitelist | `[member/role/clear]` | 6 | Permet d'afficher la whitelist d'un serveur. |

### Paramètres de modération (12)

| Commande | Alias | Arguments | Permission | Description |
| --- | --- | --- | --- | --- |
| `ancien` | - | `<durée>` | 3 | Définit au bout de combien de temps un membre est considéré comme ancien |
| `antispam` | spam | `<on/off/max> <nombre>/<durée>` | 6 | Désactive ou active l'antispam sur un salon spécifique. |
| `autothread` | - | `<add/del> [salon]` | 3 | Défini/supprime un salon où un thread sera automatiquement créé sur chaque message |
| `badword` | - | `<add/del/list> [mot]` | 3 | Paramètre les mots interdits du serveur |
| `modlog` | - | `settings / on / off [salon]` | 3 | Permet de configurer les logs de modérations |
| `muterole` | - | `-` | 3 | Crée ou met à jour le rôle mute |
| `noderank` | - | `<add/del/list> [rôle]` | 3 | Défini/supprime des rôles qui ne seront plus supprimé en cas de derank |
| `piconly` | - | `<add/del/list> [salon]` | 3 | Paramètre les piconly du serveur |
| `public` | - | `<on/off> <allow/deny/reset> [salon]` | 3 | Autorise/interdit les commandes publiques |
| `settings` | - | `<add/del/list> [mot]` | 3 | Paramètre les mots interdits du serveur |
| `strikes` | - | `[déclencheur] [nombre] [ancien/nouveau]` | 3 | Affiche ou modifie les strikes |
| `timeout` | - | `<on/off>` | 3 | Active/désactive l'utilisation du Timeout Discord |

### Utilitaire (27)

| Commande | Alias | Arguments | Permission | Description |
| --- | --- | --- | --- | --- |
| `alladmins` | all-admin, alladmin | `-` | 1 | Affiche la liste des administrateurs du serveur. |
| `allbot` | all-bot, all-bots, allbots | `-` | 1 | Affiche la liste des bots du serveur. |
| `banner` | - | `-` | 1 | Affiche la bannière d'un utilisateur. |
| `boosters` | boosts | `-` | 1 | Affiche la liste des boosteurs du serveur. |
| `botadmins` | bot-admins | `-` | 1 | Affiche la liste des bots ayant la permission administrateur. |
| `botinfo` | bot-info | `-` | 1 | Afficher les informations du bot. |
| `calc` | - | `<calcul>` | 1 | Résout des calculs |
| `changelogs` | - | `-` | 1 | Affiche les dernières notes de mise à jour |
| `channel` | channelinfo, channel-info | `[channel]` | 1 | Affiche les informations d'un salon. |
| `crowbots` | - | `-` | 1 | Affiche le serveur support. |
| `emoji` | - | `<émoji>` | 1 | Récupère l'image d'un émoji |
| `help` | aide | `-` | 1 | Afficher la liste des commandes du bot. |
| `inviteinfo` | invite-info, inviteinfos | `-` | 1 | Affiche les informations d'une invitation. |
| `lb` | - | `suggestions` | 1 | Affiche les suggestions les mieux notées |
| `member` | - | `[membre]` | 1 | Affiche les informations relatives à un membre |
| `online` | - | `-` | Owner | Met le bot en ligne. |
| `pic` | avatar, pp, pfp | `[user]` | 1 | Affiche l'avatar d'un utilisateur. |
| `ping` | - | `-` | 1 | Afficher le ping du bot. |
| `prevnames` | prevname | `-` | 1 | Affiche les anciens pseudos d'un utilisateur. |
| `role` | - | `<role>` | 1 | Affiche les informations d'un rôle. |
| `rolemembers` | - | `<role>` | 1 | Affiche la liste des membres ayant un rôle précis. |
| `server` | servericon, icone | `-` | 1 | Permet de récupérer l'icône du serveur. |
| `serverinfo` | server-info, si | `-` | 1 | Affiche les informations du serveur. |
| `snipe` | - | `[chiffre]` | 1 | Afficher les derniers messages supprimés. |
| `uptime` | - | `-` | 1 | Afficher l'activité du bot. |
| `user` | userinfo, ui | `[user]` | 1 | Affiche les informations d'un utilisateur. |
| `vocinfo` | - | `[user]` | 1 | Affiche les statistiques vocales du serveur. |

---

## Données & fichiers

| Chemin | Rôle |
| --- | --- |
| `config.json` | Secrets & config globale (à créer) |
| `config.example.json` | Modèle sans secrets |
| `start.bat` | Lanceur Windows |
| `serveurs/example.json` | Schéma par défaut d'un serveur |
| `data/store/` | Données runtime (créé automatiquement) |
| `backups/` | Backups Discord créées par le bot |
| `commands/` | Commandes |
| `events/` | Événements |
| `utiles/` | Helpers internes |

---

## Dépannage

| Problème | Solution |
| --- | --- |
| Le bot ne démarre pas | Vérifie Node 18+, `token` valide, `npm install` OK |
| Aucune réponse aux commandes | Active les 3 intents Privileged + Message Content |
| Permission refusée / silence | Niveau insuffisant — buyer/owners bypassent |
| `start.bat` échoue sur `npm i` | Installe Node, ouvre un terminal dans le dossier, `npm i` puis `node .` |
| Token invalide | Régénère le token sur le Developer Portal |

---

## Crédit

Projet open-source — remade Crowbot 2026  
GitHub : [https://github.com/002-sans/Crowbot-Remade-2026](https://github.com/002-sans/Crowbot-Remade-2026)
