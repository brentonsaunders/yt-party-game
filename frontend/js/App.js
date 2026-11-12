import { Countdown } from "./component/Countdown.js";
import { GAME_REFRESH_TIME } from "./constants.js";
import { Game } from "./pages/Game.js";
import { Home } from "./pages/Home.js";
import { getGame } from "./service.js";

const PUSH = "push";
const POP = "pop";
const REPLACE = "replace";

let pageStack = null;
let pageStackEvent = null;
let timer = null;
let onRefreshGame = null;
let game = null;

export const App = async (props = {}) => {
    const element = document.getElementById("app");

    clearTimeout(timer);

    Countdown.clear();

    if (GAME_ID) {
        game = await getGame(GAME_ID);

        if (game) {
            pageStack ??= [{page: Game}];

            timer = setInterval(async () => {
                const lastGameState = game.state;
                
                game = await getGame(GAME_ID);

                if (game.state !== lastGameState) {
                    App.replacePage(Game);
                } else {
                    onRefreshGame && onRefreshGame(game);
                }
            }, GAME_REFRESH_TIME);
        } else {
            window.location.href = UI_BASE_URL;
        }
    } else {
        pageStack ??= [{page: Home}];
    }

    element.innerHTML = "";

    const activePageIndex = pageStackEvent === POP
        ? pageStack.length - 2
        : pageStack.length - 1;

    pageStack.forEach(({page, props}, index) => {
        const isActivePage = index === activePageIndex;
        
        const setOnRefreshGame = callback => {
            if (isActivePage) {
                onRefreshGame = callback;
            }
        };

        const pageElement = page({
            game,
            isActivePage,
            setOnRefreshGame,
            ...(props ? props : {}),
        });

        if (pageStackEvent === PUSH) {
            if (index === pageStack.length - 1) {
                pageElement.classList.add("slide-in-left");
            } else if (index === pageStack.length - 2) {
                pageElement.classList.add("slide-out-left");
            }
        } else if (pageStackEvent === POP) {
            if (index === pageStack.length - 1) {
                pageElement.classList.add("slide-out-right");
            } else if (index === pageStack.length - 2) {
                pageElement.classList.add("slide-in-right");
            }
        } else if (pageStackEvent === REPLACE) {
            if (index === pageStack.length - 1) {
                pageElement.classList.add("fade-in");
            }
        }

        element.appendChild(pageElement);
    });

    if (pageStackEvent === POP) {
        pageStack = pageStack.slice(0, -1);
    } else if (pageStackEvent === REPLACE) {
        pageStack = [pageStack[pageStack.length - 1]];
    }

    pageStackEvent = null;
};

App.pushPage = (page, props) => {
    pageStackEvent = PUSH;

    pageStack.push({page, props});

    App();
};

App.popPage = () => {
    pageStackEvent = POP;

    App();
};

App.replacePage = (page, props) => {
    pageStackEvent = REPLACE;

    pageStack.push({page, props});

    App();
};
