export interface CancellableAction {
    Abort: () => void;
    busy: boolean;
}
interface CancellablePromiseWrap<T> {
    action: CancellableAction;
    promise: Promise<T> ;
}
class CancellablePromise {
    public static initValues: CancellableAction = {
        busy: false,
        Abort(){}
    }
    public static wrap<S>(p1: Promise<S>) {
        const wrapObject: CancellablePromiseWrap<S> = {
            action: {
                Abort: () => {},
                busy: true,
            },
            promise: p1,
        }

        const p2 = new Promise((resolve, reject) => {
            wrapObject.action.Abort = () => {
                wrapObject.action.busy = false;
                reject('Action was canceled');
            }
        });
        wrapObject.promise = Promise.race([p1, p2]) as Promise<S>;

        return wrapObject;
    }
}

export {
    CancellablePromise
}