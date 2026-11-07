import { App } from "../App.js";
import { Countdown } from "../component/Countdown.js";
import { GameState } from "../constants.js";
import { pickVideo } from "../service.js";
import { timeString } from "../utils.js";
import { Game } from "./Game.js";
import { Players } from "./Players.js";

export const PickVideo = (props = {}) => {
    const {
        game,
        videoId = game.myRound?.videoId,
        videoStartTime = game.myRound?.videoStartTime,
        pickingVideo = videoId === null,
    } = props;

    props.setOnRefreshGame(game => { 
        Countdown({
            element: props.element.querySelector(".countdown"),
            seconds: game.timeRemaining,
            textContent: timeString,
        });
    });

    props.element ??= document.createElement("div");

    props.element.className = "page";

    props.element.innerHTML = `<header>
                                   <h1 class="title">Pick a Video</h1>
                                   <button class="icon players c"></button>
                               </header>
                               <main class="gap-2">
                                   <span class="countdown self-center large-text bold"></span>
                                   ${
                                       game.myRound
                                       ? `<p class="text-center">${game.myRound.questions[game.myRound.pickedQuestion]}</p>`
                                       : ``
                                   }
                                   ${
                                       game.myRound
                                       ? (pickingVideo
                                            ? `<p class="small-text text-center">
                                                   Open the YouTube app on your device, and find a video that you
                                                   think answers the question above.<br><br>
                                                   Next, tap the Share <span class="icon share valign-middle"></span> button and
                                                   then the Copy Link <span class="icon copy valign-middle"></span> button.<br><br>
                                                   Then come back to this screen, and tap Done.
                                               </p>`
                                            : `<div class="flex-col gap-1">
                                                   <div class="loading" style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/${videoId}?rel=0&start=${videoStartTime}" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" allowfullscreen scrolling="no" allow="accelerometer *; clipboard-write *; encrypted-media *; gyroscope *; picture-in-picture *; web-share *;" referrerpolicy="strict-origin"></iframe></div>
                                                   <button class="self-center icon edit"></button>
                                               </div>`
                                       )
                                       : `<p class="text-center">Waiting for players to pick a video ...</p>`
                                   }
                               </main>
                               <footer>
                                   ${
                                       pickingVideo
                                       ? `<button id="done" class="button red">Done</button>`
                                       : ``
                                   }
                               </footer>`;

    Countdown({
        element: props.element.querySelector(".countdown"),
        seconds: game.timeRemaining,
        textContent: timeString,
    });
    
    const editButton = props.element.querySelector(".edit");
    const doneButton = props.element.querySelector("#done");

    props.element.querySelector(".players").onclick = () => {
        App.pushPage(Players);
    };

    if (editButton) {
        editButton.onclick = () => {
            PickVideo({...props, pickingVideo: true});
        };
    }

    if (doneButton) {
        doneButton.onclick = async () => {
            const idRegex = new RegExp(`(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?\/\s]{11})`);
            const timeRegex = new RegExp(`&t=([0-9]{1,})`);

            const text = await navigator.clipboard.readText();

            const idMatch = text.match(idRegex);

            if (!idMatch) {
                return;
            }

            const timeMatch = text.match(timeRegex);

            const videoId = idMatch[1];
            const videoStartTime = timeMatch ? parseInt(timeMatch[1]) : 0;

            doneButton.disabled = true;

            await pickVideo(game.id, videoId, videoStartTime);

            App.replacePage(Game);
        };
    }

    return props.element;
};
