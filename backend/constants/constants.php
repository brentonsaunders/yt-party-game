<?php
const BRA = "bra";
const COLLAR = "collar";
const CUFFS = "cuffs";
const HEELS = "heels";
const LIPS = "lips";
const ROPE = "rope";
const THONG = "thong";
const WHIP = "whip";

const TOKENS = [
    BRA,
    COLLAR,
    CUFFS,
    HEELS,
    LIPS,
    ROPE,
    THONG,
    WHIP,
];

const LOBBY = "lobby";
const STARTING_ROUND = "starting-round";
const PICKING_QUESTION = "picking-question";
const PICKING_VIDEO = "picking-video";
const GUESSING_QUESTIONS = "guessing-questions";
const SHOWING_RESULTS = "showing-results";
const ENDING_ROUND = "ending-round";

const GAME_STATES = [
    LOBBY,
    STARTING_ROUND,
    PICKING_QUESTION,
    PICKING_VIDEO,
    GUESSING_QUESTIONS,
    SHOWING_RESULTS,
    ENDING_ROUND,
];

const TIME_TO_START_ROUND = 30;
const TIME_TO_PICK_QUESTION = 60;
const TIME_TO_PICK_VIDEO = 3 * 60;
const TIME_TO_GUESS_QUESTIONS = 5 * 60;
const TIME_TO_END_ROUND = 30;
