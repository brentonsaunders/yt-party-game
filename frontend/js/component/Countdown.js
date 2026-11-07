let timer = null;

export const Countdown = (props = {}) => {
    props.seconds ??= 0;

    props.textContent ??= seconds => seconds.toString();

    props.element ??= document.createElement("div");

    clearInterval(timer);

    timer = setInterval(() => {
        if (props.seconds > 0) {
            --props.seconds;
        }

        props.element.innerHTML = props.textContent(props.seconds);
    }, 1000);

    props.element.innerHTML = props.textContent(props.seconds);

    return props.element;
};

Countdown.clear = () => {
    clearInterval(timer);
};
