import { App } from "./App.js";
import { generateQrCodeDataUrl } from "./utils.js";

(async () => {
    if (GAME_ID) {
        App.GAME_URL = UI_BASE_URL + "/" + GAME_ID;

        App.GAME_QR_CODE_DATA_URL = await generateQrCodeDataUrl(App.GAME_URL);
    }

    App();
})();
