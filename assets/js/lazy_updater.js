export default class LazyUpdater {
    constructor(handler, timeout) {
        this._handler = handler;
        this._timeout = timeout;
        this._queue = [];
        this._intervalId = null;
        this._procLock = false;
    }

    push(value) {
        this._queue.push(value);
    }

    start() {
        if (this._intervalId === null) {
            this._intervalId = setInterval(
                () => {
                    if (this._queue.length && !this._procLock) {
                        this._procLock = true;
                        var queue = this._queue.slice();
                        this._handler(queue, () => {
                            this._queue.splice(0, queue.length);
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
