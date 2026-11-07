import { App } from "../App.js";
import { GameState, TOKEN_COLORS } from "../constants.js";
import { GameLink } from "./GameLink.js";
import { MyPlayer } from "./MyPlayer.js";
import { PickToken } from "./PickToken.js";

export const Players = (props = {}) => {
    const {
        game,
    } = props;

    if (!game.players || !Object.keys(game.players).length) {
        return GameLink(props);
    }

    props.setOnRefreshGame(game => { 
        Players({...props, game});
    });

    props.element ??= document.createElement("div");

    props.element.className = "page";

    let playerList = `<div class="player-list">`;

    Object.entries(game.players)
        .map(([token, player]) => ({token, ...player}))
        .toSorted((a, b) => game.scores[b.token].total - game.scores[a.token].total)
        .forEach(({token, name, isActive}) => {
            const roundsPlayed = game.scores[token].rounds
                .filter(round => round !== null).length;

            const score = game.totalRounds > 0
                ? game.scores[token].total
                : "-";

            const previousScore = game.totalRounds > 1
                ? game.scores[token].cumulative[game.totalRounds - 2]
                : "";

            playerList += `<div class="player-list-item bg-color-${TOKEN_COLORS[game.tokens.indexOf(token)]}${isActive ? " active" : ""}">
                            <img src="img/tokens/${token}.svg">
                            <span class="name flex-1">${name}</span>
                            ${game.myPlayer?.token === token ? `<img src="img/icons/star.svg">` : ""}
                            <span>${roundsPlayed} round(s)</span>
                            <span class="score"><span class="strike">${previousScore}</span> ${score}</span>
                        </div>`;
        });

    playerList += "</div>";

    const activePlayers = Object.values(game.players)
        .filter(player => player.isActive);

    props.element.innerHTML = `<header>
                                    ${game.myPlayer || ![GameState.LOBBY, GameState.STARTING_ROUND].includes(game.state)
                                      ? `<button class="icon back a"></button>`
                                      : ""
                                   }
                                   <h1 class="title">Round ${game.totalRounds + 1} - ${game.name}</h1>
                                   <button class="icon qrcode c"></button>
                               </header>
                               <main class="gap-2">
                                   ${activePlayers.length < 4
                                        ? `<span class="text-center small-text">You need at least <span class="medium-text bold">4</span> active players to start a round</span>`
                                        : ""
                                    }
                                   ${playerList}
                               </main>
                               <footer>
                                    ${!game.myPlayer
                                        ? `<button id="joinGame" class="button orange">Join Game</button>`
                                        : ""
                                    }
                               </footer>`;

    const joinGameButton = props.element.querySelector("#joinGame");
    const qrCodeButton = props.element.querySelector(".qrcode");
    const backButton = props.element.querySelector(".back");

    if (joinGameButton) {
        joinGameButton.onclick = () => {
            App.pushPage(PickToken);
        };
    }

    if (qrCodeButton) {
        qrCodeButton.onclick = () => {
            App.pushPage(GameLink);
        };
    }

    if (backButton) {
        backButton.onclick = () => {
            App.popPage();
        };
    }

    return props.element;
};
