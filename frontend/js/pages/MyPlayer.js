import { App } from "../App.js";
import { Countdown } from "../component/Countdown.js";
import { GameState, TOKEN_COLORS } from "../constants.js";
import { joinGame, leaveGame, startRound } from "../service.js";
import { EnterName } from "./EnterName.js";
import { Game } from "./Game.js";
import { Players } from "./Players.js";

export const MyPlayer = (props = {}) => {
    const {
        game,
    } = props;

    props.setOnRefreshGame(game => {
        MyPlayer({...props, game});
    });

    const activePlayers = Object.values(game.players)
        .filter(player => player.isActive);

    const token = game.myPlayer.token;
    const name = game.myPlayer.name;
    const isActive = game.myPlayer.isActive;

    const score = game.scores[token].total;

    let place = 1 + Object.values(game.scores)
        .filter(({total}) => total > score).length;

    switch (place) {
        case 1:
            place = place + "st Place";
            break;
        case 2:
            place = place + "nd Place";
            break;
        case 3:
            place = place + "rd Place";
            break;
        default:
            place = place + "th Place";
            break;
    }

    const roundsPlayed = game.scores[token].rounds
            .filter(round => round !== null).length;

    props.element ??= document.createElement("div");

    props.element.className = "page";

    props.element.innerHTML = `<header>
                                   ${
                                       game.state === GameState.LOBBY
                                       ? `<button class="icon exit a"></button>`
                                       : ``
                                   }
                                   <h1 class="title">Round ${game.totalRounds + 1} - ${game.name}</h1>
                                   <button class="icon players c"></button>
                               </header>
                               <main>
                                   <div class="self-center flex-col gap-1 items-center">
                                       <div class="flex-row flex-wrap gap-1">
                                           <span class="x-large-text bold">${name}</span>
                                           <button class="icon edit"></button>
                                       </div>
                                       <div class="self-center token bg-color-${TOKEN_COLORS[game.tokens.indexOf(token)]}">
                                           <img src="img/tokens/${token}.svg">
                                       </div>
                                       <span class="large-text bold">${place}</span>
                                       <span class="large-text">${score} points</span>
                                       <span class="small-text">${roundsPlayed} round(s) played</span>
                                       ${
                                           game.state === GameState.LOBBY
                                           ? `<button id="isActive" class="flex-row gap-1 items-center">
                                                  <span class="checkbox${isActive ? " checked" : ""}"></span>
                                                  <span>I'm Playing Next Round</span>
                                              </button>`
                                           : ``
                                       }
                                   </div>
                               </main>
                               <footer>
                                    ${isActive && activePlayers.length >= 4
                                        ? `<button id="startRound" class="button green${game.state === GameState.STARTING_ROUND ? " cancel" : ""}">Start Round</button>`
                                        : ""
                                    }
                               </footer>`;

    const startRoundButton = props.element.querySelector("#startRound");
    const isActiveButton = props.element.querySelector("#isActive");
    const exitButton = props.element.querySelector(".exit");
    const editButton = props.element.querySelector(".edit");

    props.element.querySelector(".players").onclick = () => {
        App.pushPage(Players);
    };

    if (isActiveButton) {
        isActiveButton.onclick = async () => {
            isActiveButton.disabled = true;

            await joinGame(game.id, token, name, !isActive);

            App.replacePage(Game);
        };
    }

    editButton.onclick = () => {
        App.pushPage(EnterName, {token});
    };

    if (exitButton) {
        exitButton.onclick = async () => {
            await leaveGame(game.id);

            App.replacePage(Game);
        };
    }

    if (startRoundButton) {
        if (game.state === GameState.STARTING_ROUND) {
            Countdown({
                element: startRoundButton,
                seconds: game.timeRemaining,
                textContent: seconds => `Starting in ... ${seconds}`,
            });
        }

        startRoundButton.onclick = async () => {
            startRoundButton.disabled = true;
            
            await startRound(game.id);

            App.replacePage(Game);
        };
    }

    return props.element;
};
