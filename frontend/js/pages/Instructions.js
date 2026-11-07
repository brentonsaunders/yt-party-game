import { App } from "../App.js";
import { Home } from "./Home.js";

const steps = [
    `<p>
        Tap New Game and enter a name for the game.
        It's recommended that you do this on a Smart TV or a PC connected to a
        large display. That way, it will be your master screen while each player
        joins on their own device.
    </p>
    <img src="img/screenshots/1.png">`,

    `<p>
        Players scan the QR code on their device, open the game link, and tap Join Game.
        Players then pick their token and enter their name.
    </p>
    <img src="img/screenshots/2.png">
    <img src="img/screenshots/3.png">
    <img src="img/screenshots/4.png">`,
    `<p>
        Once at least 4 players (maximum of 8) have joined the game, any player may
        start a new round by tapping Start Round.
    </p>
    <img src="img/screenshots/5.png">
    <img src="img/screenshots/6.png">`,
    `<p>
        Each player picks the question that they want to answer during the round.
        If a player fails to pick a question in the allotted time, a random one
        is chosen for them.
    </p>
    <img src="img/screenshots/7.png">`,
    `<p>
        After each player has picked a question, players then open the YouTube
        app or site, and pick a video that they believe answers their chosen question.
        If a player fails to pick a video in the allotted time, a random one
        is chosen for them.
    </p>
    <img src="img/screenshots/8.png">`,
    `<p>
        After each player has picked a video, players are then able to see the videos
        that their fellow players have chosen. Players must then guess the question
        that each video is attempting to answer.
    </p>
    <img src="img/screenshots/9.png">
    <img src="img/screenshots/10.png">`,
    `<p>
        After the allotted time has passed, the correct question for each video is shown.
    </p>
    <img src="img/screenshots/11.png">`,
    `<p>
        Players get a point for every question they correctly guess.
        (Players are able to guess the question for their <em>own</em> video for an easy point.)
    </p>
    <img src="img/screenshots/12.png">`,
    `<p>And that's that.</p>`,
];

export const Instructions = (props = {}) => {
    const {
        step = 0,
    } = props;

    props.element ??= document.createElement("div");

    props.element.className = "page instructions";

    props.element.innerHTML = `<header>
                                   <button class="icon back a"></button>
                                   <h1 class="title">Instructions</h1>
                                   ${
                                       step < steps.length - 1
                                       ? `<button class="icon forward c"></button>`
                                       : ``
                                   }
                               </header>
                               <main class="gap-3">
                                   ${steps[step]}
                               </main>
                               <footer>
                                   ${
                                       step === steps.length - 1
                                       ? `<button id="home" class="button pink">Home</button>`
                                       : ``
                                   }
                               </footer>`;

    const backButton = props.element.querySelector(".back");
    const forwardButton = props.element.querySelector(".forward");
    const homeButton = props.element.querySelector("#home");

    if (backButton) {
        backButton.onclick = () => {
            App.popPage();
        };
    }

    if (forwardButton) {
        forwardButton.onclick = () => {
            App.pushPage(Instructions, {step: step + 1});
        };
    }

    if (homeButton) {
        homeButton.onclick = () => {
            App.replacePage(Home);
        };
    }

    return props.element;
};
