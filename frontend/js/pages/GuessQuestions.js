import { App } from "../App.js";
import { Countdown } from "../component/Countdown.js";
import { GameState } from "../constants.js";
import { endRound } from "../service.js";
import { timeString } from "../utils.js";
import { Game } from "./Game.js";
import { PickQuestion } from "./PickQuestion.js";
import { Players } from "./Players.js";

export const GuessQuestions = (props = {}) => {
    const {
        game,
        isActivePage,
        videoIndex = 0,
    } = props;

    props.setOnRefreshGame(game => { 
        if (game.state === GameState.GUESSING_QUESTIONS) {
            Countdown({
                element: props.element.querySelector(".countdown"),
                seconds: game.timeRemaining,
                textContent: timeString,
            });
        }
    });

    const {videoId, videoStartTime, questions} = game.videos[videoIndex];
    const myGuess = game.myRound?.guesses[videoIndex] ?? null;

    const title = (game.state === GameState.GUESSING_QUESTIONS
        ? "Guessing Questions"
        : "Results"
    ) + ` - ${videoIndex + 1}/${game.videos.length}`;

    props.element ??= document.createElement("div");

    props.element.className = "page";

    props.element.innerHTML = `<header>
                                   ${
                                       videoIndex > 0
                                       ? `<button class="icon back a"></button>`
                                       : ``
                                   }
                                   <h1 class="title">${title}</h1>
                                   ${
                                       videoIndex < game.videos.length - 1 &&
                                       ([GameState.SHOWING_RESULTS, GameState.ENDING_ROUND].includes(game.state) ||
                                       (!game.myRound || videoIndex < game.myRound.guesses.length))
                                       ? `<button class="icon players b"></button>
                                          <button class="icon forward c"></button>`
                                       : `<button class="icon players c"></button>`
                                   }
                               </header>
                               <main class="gap-1">
                                   ${
                                       game.state === GameState.GUESSING_QUESTIONS
                                       ? `<span class="countdown self-center large-text bold"></span>
                                          <p class="text-center">What question does this video answer?</p>`
                                       : `<span class="text-center small-text">The Answer</span>
                                          <p class="text-center">${game.videos[videoIndex].questions[game.videos[videoIndex].pickedQuestion]}</p>`
                                   }
                                   ${
                                       isActivePage
                                       ? `<div class="loading" style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/${videoId}?rel=0&start=${videoStartTime}" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" allowfullscreen scrolling="no" allow="accelerometer *; clipboard-write *; encrypted-media *; gyroscope *; picture-in-picture *; web-share *;" referrerpolicy="strict-origin"></iframe></div>`
                                       : ``
                                   }
                                   ${
                                       game.state === GameState.GUESSING_QUESTIONS &&
                                       game.myRound &&
                                       Object.keys(game.myRound.guesses).length > videoIndex
                                       ? `<span class="text-center small-text">You Guessed</span>
                                          <p class="text-center">${questions[myGuess]}</p>
                                          <button class="icon edit self-center"></button>`
                                       : ``
                                   }
                               </main>
                               <footer>
                                   ${
                                       game.state === GameState.GUESSING_QUESTIONS &&
                                       game.myRound &&
                                       Object.keys(game.myRound.guesses).length <= videoIndex
                                       ? `<button id="guess" class="button red">Guess the Question</button>`
                                       : ([GameState.SHOWING_RESULTS, GameState.ENDING_ROUND].includes(game.state)
                                             ? `<button id="endRound" class="button green${game.state === GameState.ENDING_ROUND ? " cancel" : ""}">End Round</button>`
                                             : ``
                                         )
                                   }
                               </footer>`;

    if (game.state === GameState.GUESSING_QUESTIONS) {
        Countdown({
            element: props.element.querySelector(".countdown"),
            seconds: game.timeRemaining,
            textContent: timeString,
        });
    }

    const backButton = props.element.querySelector(".back");
    const forwardButton = props.element.querySelector(".forward");
    const editButton = props.element.querySelector(".edit");
    const guessButton = props.element.querySelector("#guess");
    const endRoundButton = props.element.querySelector("#endRound");

    props.element.querySelector(".players").onclick = () => {
        console.log("Here");
        App.pushPage(Players);
    };

    if (backButton) {
        backButton.onclick = () => {
            App.popPage();
        };
    }

    if (forwardButton) {
        forwardButton.onclick = () => {
            App.pushPage(GuessQuestions, {videoIndex: videoIndex + 1});
        };
    }

    if (editButton) {
        editButton.onclick = () => {
            App.pushPage(PickQuestion, {videoIndex, pickingQuestion: true});
        };
    }

    if (guessButton) {
        guessButton.onclick = () => {
            App.pushPage(PickQuestion, {videoIndex, pickingQuestion: true});
        };
    }

    if (endRoundButton) {
        if (game.state === GameState.ENDING_ROUND) {
            Countdown({
                element: endRoundButton,
                seconds: game.timeRemaining,
                textContent: seconds => `Ending in ... ${seconds}`,
            });
        }

        endRoundButton.onclick = async () => {
            endRoundButton.disabled = true;
            
            await endRound(game.id);

            App.replacePage(Game, {videoIndex});
        };
    }

    return props.element;
};
