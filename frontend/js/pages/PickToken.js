import { App } from "../App.js";
import { TOKEN_COLORS } from "../constants.js";
import { joinGame } from "../service.js";
import { EnterName } from "./EnterName.js";
import { Game } from "./Game.js";

export const PickToken = (props = {}) => {
    const {
        game,
        selectedToken = null,
    } = props;

    props.setOnRefreshGame(game => { 
        PickToken({...props, game});
    });

    props.element ??= document.createElement("div");

    props.element.className = "page";

    let tokenList = `<div class="token-list">`;

    game.tokens.forEach(token => {
        tokenList += `<button data-token="${token}" class="token-list-item${token === selectedToken ? " selected" : ""}">
                          <div class="token bg-color-${TOKEN_COLORS[game.tokens.indexOf(token)]}">
                              <img src="img/tokens/${token}.svg">
                          </div>
                          ${
                              game.players[token]
                              ? `<span class="name flex-1">${game.players[token].name}</span>`
                              : ""
                          }
                      </button>`;
    });

    tokenList += "</div>";

    props.element.innerHTML = `<header>
                                   <button class="icon back a"></button>
                                   <h1 class="title">Pick Your Token</h1>
                               </header>
                               <main class="gap-1">
                                   ${tokenList}
                               </main>
                               <footer>
                                    ${
                                        selectedToken
                                        ? `<button id="continue" class="button blue">Continue</button>`
                                        : ""
                                    }
                               </footer>`;

    const continueButton = props.element.querySelector("#continue");

    props.element.querySelector(".back").onclick = () => {
        App.popPage();
    };

    props.element.querySelectorAll(".token-list button").forEach(button => {
        button.onclick = () => {
            PickToken({...props, selectedToken: button.dataset.token});
        };
    });

    if (continueButton) {
        continueButton.onclick = async () => {
            continueButton.disabled = true;

            const player = game.players[selectedToken];

            if (player) {
                await joinGame(game.id, selectedToken, player.name, true);

                App.replacePage(Game);
            } else {
                App.pushPage(EnterName, {token: selectedToken});
            }
        };
    }

    return props.element;
};
