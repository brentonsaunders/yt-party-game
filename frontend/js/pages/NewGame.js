import { App } from "../App.js";
import { UI_BASE_URL } from "../constants.js";
import { createGame } from "../service.js";

export const NewGame = (props = {}) => {
    props.element ??= document.createElement("div");

    props.element.className = "page";

    props.element.innerHTML = `<header>
                                   <button class="icon back a"></button>
                                   <h1 class="title">Enter Game Name</h1>
                               </header>
                               <main>
                                   <div class="flex-col gap-1 items-stretch">
                                       <input class="text-box" type="text" id="gameName">
                                       <button class="button green hidden" id="createGame">Create Game</button>
                                   </div>
                               </main>`;
    
    const gameNameInput = props.element.querySelector("#gameName");
    const createGameButton = props.element.querySelector("#createGame");

    gameNameInput.oninput = () => {
        createGameButton.classList.toggle("hidden", !gameNameInput.value.length);
    };

    props.element.querySelector(".back").onclick = () => {
        App.popPage();
    };

    createGameButton.onclick = async () => {
        createGameButton.disabled = true;

        const { gameId } = await createGame(gameNameInput.value);
        
        if (gameId) {
            window.location.href = UI_BASE_URL + `/${gameId}`;
        }

        createGameButton.disabled = false;
    };

    return props.element;
};
