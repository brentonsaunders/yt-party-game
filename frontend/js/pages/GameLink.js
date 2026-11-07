import { App } from "../App.js";
import { PickToken } from "./PickToken.js";

export const GameLink = (props = {}) => {
    const {
        game,
    } = props;

    props.element ??= document.createElement("div");

    props.element.className = "page";

    props.element.innerHTML = `<header>
                                  ${Object.keys(game.players).length
                                      ? `<button class="icon back a"></button>`
                                      : ""
                                   }
                                   <h1 class="title">Join Game</h1>
                               </header>
                               <main class="gap-2 items-center">
                                   <p class="text-center small-text">
                                       Tap the button below to join the game on this device, or copy the link/scan the QR code to join on another device.
                                   </p>
                                   <button class="copy-link"><span>${App.GAME_URL}</span></button>
                                   <div id="qrcode" class="hidden"></div>
                                   <img class="qrcode margin-auto" src="${App.GAME_QR_CODE_DATA_URL}">
                               </main>
                               <footer>
                                    ${!Object.keys(game.players).length
                                        ? `<button id="joinGame" class="button orange">Join Game</button>`
                                        : ""
                                    }
                               </footer>`;

    const copyLinkButton = props.element.querySelector(".copy-link");
    const joinGameButton = props.element.querySelector("#joinGame");
    const backButton = props.element.querySelector(".back");

    copyLinkButton.onclick = async () => {
        await navigator.clipboard.writeText(App.GAME_URL);

        copyLinkButton.classList.add("copied");
    };

    if (joinGameButton) {
        joinGameButton.onclick = () => {
            App.pushPage(PickToken);
        };
    }

    if (backButton) {
        backButton.onclick = () => {
            App.popPage();
        };
    }

    return props.element;
};
