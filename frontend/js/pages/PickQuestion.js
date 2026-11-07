import { App } from "../App.js";
import { Countdown } from "../component/Countdown.js";
import { guessQuestion, pickQuestion } from "../service.js";
import { Game } from "./Game.js";
import { Players } from "./Players.js";
import { GameState } from "../constants.js";
import { timeString } from "../utils.js";

export const PickQuestion = (props = {}) => {
    const {
        game,
        pickedQuestion = null,
        pickingQuestion = game.myRound?.pickedQuestion === null,
        videoIndex,
    } = props;

    props.setOnRefreshGame(game => { 
        PickQuestion({...props, game});
    });

    props.element ??= document.createElement("div");

    props.element.className = "page";

    const questions = game.myRound
        ? (game.state === GameState.PICKING_QUESTION
            ? game.myRound.questions
            : game.videos[videoIndex].questions
        )
        : null;

    let questionsList = "";
    
    if (game.myRound) {
        questionsList += `<div class="questions-list">`;

        questions.forEach((question, index) => {
            questionsList += `<button data-index="${index}" ${index == pickedQuestion ? `class="selected"` : ""}>
                                  ${question}
                              </button>`;
        });

        questionsList += `</div>`;
    }

    props.element.innerHTML = `<header>
                                   ${
                                       game.state === GameState.GUESSING_QUESTIONS
                                       ? `<button class="icon back a"></button>`
                                       : ``
                                   }
                                   <h1 class="title">Pick a Question</h1>
                                   ${
                                       game.state === GameState.PICKING_QUESTION
                                       ? `<button class="icon players c"></button>`
                                       : ``
                                   }
                               </header>
                               <main class="gap-1">
                                   <span class="countdown self-center large-text bold"></span>
                                   ${
                                       game.myRound
                                       ? (pickingQuestion
                                             ? questionsList
                                             : `<span class="text-center small-text">You Picked</span>
                                                <button class="text-center">${game.myRound.questions[game.myRound.pickedQuestion]}</button>
                                                <button class="self-center icon edit"></button>`
                                         )
                                       : `<p class="text-center">Waiting for players to pick a question ...</p>`
                                   }
                               </main>
                               <footer>
                                   ${
                                       pickedQuestion
                                       ? `<button id="done" class="button red">Done</button>`
                                       : ``
                                   }
                               </footer>`;

    Countdown({
        element: props.element.querySelector(".countdown"),
        seconds: game.timeRemaining,
        textContent: timeString,
    });

    const backButton = props.element.querySelector(".back");
    const playersButton = props.element.querySelector(".players");
    const editButton = props.element.querySelector(".edit");
    const doneButton = props.element.querySelector("#done");

    if (backButton) {
        backButton.onclick = () => {
            App.popPage();
        };
    }

    if (playersButton) {
        playersButton.onclick = () => {
            App.pushPage(Players);
        };
    }

    if (game.myRound) {
        props.element.querySelectorAll(".questions-list button").forEach(button => {
            button.onclick = () => {
                PickQuestion({...props, pickedQuestion: button.dataset.index});
            };
        });
    }

    if (editButton) {
        editButton.onclick = () => {
            PickQuestion({...props, pickingQuestion: true});
        };
    }

    if (doneButton) {
        doneButton.onclick = async () => {
            doneButton.disabled = true;

            if (game.state === GameState.PICKING_QUESTION) {
                await pickQuestion(game.id, pickedQuestion);

                App.replacePage(Game);
            } else if (game.state === GameState.GUESSING_QUESTIONS) {
                await guessQuestion(game.id, videoIndex, pickedQuestion);

                App.popPage();
            }
        };
    }

    return props.element;
};
