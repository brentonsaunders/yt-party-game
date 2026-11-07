import { createGame, getGame, guessQuestion, joinGame, pickQuestion, pickVideo, startRound } from "./service.js";

export const test = () => {
    (async () => {
        const gameId = "4MpyXi";
        const token = "cuffs";
        const secret = "IHco0G";

        // console.log(await createGame("Test"));

        // console.log(await joinGame(gameId, "cuffs", "Brenton", true));

        /*
        await joinGame(gameId, "ball-gag", "Hugo", true);
        await joinGame(gameId, "thong", "Serge", true);
        await joinGame(gameId, "stilettos", "Victor", true);
        */

        // await startRound(gameId);

        // await pickQuestion(gameId, token, secret, 2);

        // await pickVideo(gameId, token, secret, "TI014xFn6X8", 60);

        // await guessQuestion(gameId, token, secret, 4, 3);

        console.log(await getGame(gameId, token, secret));

        debugger
    })();
};
