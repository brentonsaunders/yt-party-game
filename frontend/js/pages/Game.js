import { GameState } from "../constants.js";
import { GameLink } from "./GameLink.js";
import { GuessQuestions } from "./GuessQuestions.js";
import { MyPlayer } from "./MyPlayer.js";
import { PickQuestion } from "./PickQuestion.js";
import { PickToken } from "./PickToken.js";
import { PickVideo } from "./PickVideo.js";
import { Players } from "./Players.js";

export const Game = (props = {}) => {
    const {
        game,
    } = props;

    props.setOnRefreshGame(game => { 
        Game({...props, game});
    });

    switch (game.state) {
        case GameState.LOBBY:
        case GameState.STARTING_ROUND:
            return game.myPlayer
                ? MyPlayer(props)
                : Players(props);
        case GameState.PICKING_QUESTION:
            return PickQuestion(props);
        case GameState.PICKING_VIDEO:
            return PickVideo(props);
        case GameState.GUESSING_QUESTIONS:
        case GameState.SHOWING_RESULTS:
        case GameState.ENDING_ROUND:
            return GuessQuestions(props);
    }

    return GameLink(props);
};
