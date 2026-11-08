// Lifetime only: identity and credentials remain exclusively in Redux.
let controller = new AbortController();

export const getSessionSignal = () => controller.signal;

export const resetSessionScope = () => {
    const previous = controller;
    controller = new AbortController();
    previous.abort();
};
