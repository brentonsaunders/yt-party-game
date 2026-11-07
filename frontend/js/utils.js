export const generateQrCodeDataUrl = text => new Promise(resolve => {
    const el = document.createElement("div");

    new QRCode(el, text);

    setTimeout(() => {
        const canvas = el.querySelector("canvas");

        resolve(canvas.toDataURL());
    }, 0);
});

export const timeString = seconds => {
    const minutes = Math.floor(seconds / 60);

    seconds %= 60;

    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};
