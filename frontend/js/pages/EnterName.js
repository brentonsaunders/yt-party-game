import { App } from "../App.js";
import { joinGame } from "../service.js";
import { Game } from "./Game.js";

export const EnterName = (props = {}) => {
    const {
        game,
        token,
    } = props;
    
    props.element ??= document.createElement("div");

    props.element.className = "page";

    props.element.innerHTML = `<header>
                                   <button class="icon back a"></button>
                                   <h1 class="title">Enter Your Name</h1>
                               </header>
                               <main>
                                   <div class="flex-col gap-1 items-stretch">
                                       <input class="text-box" type="text" id="playerName">
                                       <button class="button green hidden" id="joinGame">
                                           ${game.myPlayer ? "Done" : "Join Game"}
                                       </button>
                                   </div>
                               </main>`;
    
    const playerNameInput = props.element.querySelector("#playerName");
    const joinGameButton = props.element.querySelector("#joinGame");

    playerNameInput.oninput = () => {
        joinGameButton.classList.toggle("hidden", !playerNameInput.value.length);
    };

    props.element.querySelector(".back").onclick = () => {
        App.popPage();
    };

    joinGameButton.onclick = async () => {
        joinGameButton.disabled = true;

        await joinGame(game.id, token, playerNameInput.value, true);

        App.replacePage(Game);
    };

    return props.element;
};
