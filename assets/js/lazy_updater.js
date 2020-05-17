export default class LazyUpdater {
    constructor(handler, timeout) {
        this._handler = handler;
        this._timeout = timeout;
        this._stack = [];
        this._intervalId = null;
        this._procLock = false;
    }

    push(value) {
        this._stack.push(value);
    }

    start() {
        if (this._intervalId === null) {
            this._intervalId = setInterval(
                () => {
                    if (this._stack.length && !this._procLock) {
                        this._procLock = true;
                        this._handler(this._stack, () => {
                            this._procLock = false;
                            this._stack.length = 0;
                        });
                    }
                },
                this._timeout
            );
        }
    }

    stop() {
        if (this._intervalId !== null) {
            clearInterval(this._intervalId);
        }
    }
}
