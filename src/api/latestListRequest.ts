import type { Dispatch } from '@reduxjs/toolkit';

// One active request per list and Redux store, without retaining disposed stores.
export const createLatestListRequest = () => {
    const active = new WeakMap<Dispatch, AbortController>();

    return (dispatch: Dispatch, externalSignal?: AbortSignal) => {
        active.get(dispatch)?.abort();
        const controller = new AbortController();
        active.set(dispatch, controller);
        const abort = () => controller.abort();
        externalSignal?.addEventListener('abort', abort, { once: true });
        if (externalSignal?.aborted) abort();

        return {
            signal: controller.signal,
            isCurrent: () => active.get(dispatch) === controller && !controller.signal.aborted,
            finish: () => {
                externalSignal?.removeEventListener('abort', abort);
                if (active.get(dispatch) !== controller) return false;
                active.delete(dispatch);
                return true;
            },
        };
    };
};
