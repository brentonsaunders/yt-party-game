import { App } from "../App.js";
import { NewGame } from "./NewGame.js";
import { Instructions } from "./Instructions.js";

export const Home = (props = {}) => {
    props.element ??= document.createElement("div");

    props.element.className = "page";

    props.element.innerHTML = `<header>
                               </header>
                               <main>
                                   <div class="flex-col gap-3">
                                       <img class="logo" alt="YT Party Game" src="img/logo2.png">
                                       <div class="flex-col gap-1 items-center">
                                           <button class="button purple" id="newGame">New Game</button>
                                           <button class="button yellow" id="instructions">How to Play</button>
                                       </div>
                                   </div>
                               </main>`;

    props.element.querySelector("#newGame").onclick = () => {
        App.pushPage(NewGame);
    };

    props.element.querySelector("#instructions").onclick = () => {
        App.pushPage(Instructions);
    };

    return props.element;
};
