import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

export interface SlashCommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: Function;
}
