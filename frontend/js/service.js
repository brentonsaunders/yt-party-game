import { API_BASE_URL } from "./constants.js";

const GET_GAME_URL = API_BASE_URL + "/getGame.php";
const CREATE_GAME_URL = API_BASE_URL + "/createGame.php";
const JOIN_GAME_URL = API_BASE_URL + "/joinGame.php";
const START_ROUND_URL = API_BASE_URL + "/startRound.php";
const PICK_QUESTION_URL = API_BASE_URL + "/pickQuestion.php";
const PICK_VIDEO_URL = API_BASE_URL + "/pickVideo.php";
const GUESS_QUESTION_URL = API_BASE_URL + "/guessQuestion.php";
const END_ROUND_URL = API_BASE_URL + "/endRound.php";

const storage = localStorage;

const get = async url => {
    const response = await fetch(url);

    return await response.json();
};

const post = async (url, data) => {
    const formData = new FormData();

    for (const key in data) {
        formData.append(key, data[key]);
    }

    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });

    try {
        return await response.json();
    } catch (err) {}
};

const tokenAndSecret = gameId => {
    const games = JSON.parse(storage.getItem("games")) ?? {};

    return {
        token: games[gameId]?.token,
        secret: games[gameId]?.secret,
    };
};

export const getGame = async gameId => {
    const games = JSON.parse(storage.getItem("games")) ?? {};

    const token = games[gameId]?.token;
    const secret = games[gameId]?.secret;

    return get(GET_GAME_URL + "?" + new URLSearchParams({gameId, token, secret}));
};

export const createGame = async name => post(CREATE_GAME_URL, {name});

export const joinGame = async (gameId, token, name, isActive) => {
    const player = await post(JOIN_GAME_URL, {gameId, token, name, isActive});

    const games = JSON.parse(storage.getItem("games")) ?? {};

    games[gameId] = {
        token: player.token,
        secret: player.secret,
    };

    storage.setItem("games", JSON.stringify(games));
};

export const leaveGame = async gameId => {
    const games = JSON.parse(storage.getItem("games")) ?? {};

    if (!games[gameId]) {
        return;
    }

    const {token} = games[gameId];

    await joinGame(gameId, token, "", false);

    delete games[gameId];

    storage.setItem("games", JSON.stringify(games));
};

export const startRound = async gameId => {
    await post(START_ROUND_URL, {gameId});
};

export const pickQuestion = async (gameId, questionIndex) => {
    await post(PICK_QUESTION_URL, {gameId, ...tokenAndSecret(gameId), questionIndex});
};

export const pickVideo = async (gameId, videoId, videoStartTime) => {
    await post(PICK_VIDEO_URL, {gameId, ...tokenAndSecret(gameId), videoId, videoStartTime});
};

export const guessQuestion = async (gameId, videoIndex, questionIndex) => {
    await post(GUESS_QUESTION_URL, {gameId, ...tokenAndSecret(gameId), videoIndex, questionIndex});
};

export const endRound = async gameId => {
    await post(END_ROUND_URL, {gameId});
};
