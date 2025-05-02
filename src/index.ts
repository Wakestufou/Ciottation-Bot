import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Event } from './types/Event';
import 'dotenv/config';

console.log('Lancement du bot...');
console.log('Vérification de la BDD...');

const filePath = path.join(__dirname, '..', 'bdd.json');

if (!fs.existsSync(filePath)) {
    console.error(
        "La BDD n'existe pas ! Merci de créer le fichier bdd.json à la racine du projet en ce basant sur le fichier bdd.json.exemple !"
    );
    process.exit(1);
} else {
    try {
        // Lire le fichier JSON en tant que chaîne de caractères
        const data = fs.readFileSync(filePath, 'utf-8');

        // Parser la chaîne de caractères en un objet JavaScript
        const parsedData = JSON.parse(data);

        // Vérifier si le contenu est bien un objet (et non un tableau ou autre)
        if (!parsedData.hasOwnProperty('authors') || !parsedData.hasOwnProperty('quotes')) {
            throw 'Base de donnée pas fonctionnel';
        }
    } catch (error) {
        console.error(
            'Erreur lors de la lecture ou du parsing du fichier JSON (Vérifier que la base est celle du bdd.json.exemple) : ',
            error
        );
        process.exit(1);
    }

    console.log('Bdd correct !');
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// ---------- Commands -----------------------------------------------------------------------
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolder = fs.readdirSync(foldersPath);

for (const folder of commandFolder) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath).default;

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

// ---------- Events -----------------------------------------------------------------------
const eventsPath = path.join(__dirname, 'events');
const eventFolder = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

for (const eventFile of eventFolder) {
    const eventPath = path.join(eventsPath, eventFile);
    const event = require(eventPath).default as Event;

    if (event.once) {
        client.once(event.type, event.function);
    } else {
        client.on(event.type, event.function);
    }
}

// ---------- Log in to Discord with client's token -----------------------------------------------------------------------
client.login(process.env.TOKEN);
