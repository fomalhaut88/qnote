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
                        var stack = this._stack.slice();
                        this._handler(stack, () => {
                            this._stack.splice(0, stack.length);
                            this._procLock = false;
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
