/**
 * 微信小程序通知广播模式类,降低小程序之间的耦合度
 */
export class EcjiaNotificationCenter {

    __notices = [];

    isDebug = true;

    constructor() {

    }

    /**
     * addNotification
     * 注册通知对象方法
     *
     * 参数:
     * name： 注册名，一般let在公共类中
     * selector： 对应的通知方法，接受到通知后进行的动作
     * observer: 注册对象，指Page对象
     */
    addNotification(name, selector, observer) {
        if (name && selector) {
            if (! observer) {
                this.isDebug && console.log("addNotification Warning: no observer will can't remove notice");
            }

            this.isDebug && console.log("addNotification:" + name);

            let newNotice = {
                name: name,
                selector: selector,
                observer: observer
            };

            this.addNotices(newNotice);

        } else {
            this.isDebug && console.log("addNotification error: no selector or name");
        }
    }

    /**
     * 仅添加一次监听
     *
     * 参数:
     * name： 注册名，一般let在公共类中
     * selector： 对应的通知方法，接受到通知后进行的动作
     * observer: 注册对象，指Page对象
     */
    addOnceNotification(name, selector, observer) {
        if (this.__notices.length > 0) {
            for (let i = 0; i < this.__notices.length; i++) {
                let notice = this.__notices[i];
                if (notice.name === name) {
                    if (notice.observer === observer) {
                        return;
                    }
                }
            }
        }

        this.addNotification(name, selector, observer)
    }


    addNotices(newNotice) {
        if (this.__notices.length > 0) {
            for (let i = 0; i < this.__notices.length; i++) {
                let hisNotice = this.__notices[i];
                //当名称一样时进行对比，如果不是同一个 则放入数组，否则跳出
                if (newNotice.name === hisNotice.name) {
                    if (!cmp(hisNotice, newNotice)) {
                        this.__notices.push(newNotice);
                    }
                    return;
                }
                else {
                    this.__notices.push(newNotice);
                }

            }
        } else {
            this.__notices.push(newNotice);
        }
    }

    /**
     * removeNotification
     * 移除通知方法
     *
     * 参数:
     * name: 已经注册了的通知
     * observer: 移除的通知所在的Page对象
     */
    removeNotification(name, observer = null) {
        this.isDebug && console.log("removeNotification:" + name);

        for (let i = 0; i < this.__notices.length; i++) {
            let notice = this.__notices[i];
            if (notice.name === name) {
                if (observer === null) {
                    this.__notices.splice(i, 1);
                    return;
                }
                else if (notice.observer === observer) {
                    this.__notices.splice(i, 1);
                    return;
                }
            }
        }

    }

    /**
     * postNotificationName
     * 发送通知方法
     *
     * 参数:
     * name: 已经注册了的通知
     * info: 携带的参数
     */
    postNotificationName(name, info = {}) {
        // this.isDebug && console.log("postNotificationName:" + name);
        if (this.__notices.length === 0) {
            // this.isDebug && console.log("postNotificationName error: u hadn't add any notice.");
            return;
        }

        for (let i = 0; i < this.__notices.length; i++) {
            let notice = this.__notices[i];
            if (notice.name === name) {
                if (notice.observer.hasOwnProperty(notice.selector)) {
                    notice.observer[notice.selector]();
                } else {
                    typeof notice.selector === 'function' && notice.selector(info);
                }
            }
        }

    }


    // 用于对比两个对象是否相等
    static cmp(x, y) {
        // If both x and y are null or undefined and exactly the same
        if (x === y) {
            return true;
        }

        // If they are not strictly equal, they both need to be Objects
        if (! (x instanceof Object) || !(y instanceof Object)) {
            return false;
        }

        // They must have the exact same prototype chain, the closest we can do is
        // test the constructor.
        if (x.constructor !== y.constructor) {
            return false;
        }

        for (let p in x) {
            // Inherited properties were tested using x.constructor === y.constructor
            if (x.hasOwnProperty(p)) {
                // Allows comparing x[ p ] and y[ p ] when set to undefined
                if (!y.hasOwnProperty(p)) {
                    return false;
                }

                // If they have the same strict value or identity then they are equal
                if (x[p] === y[p]) {
                    continue;
                }

                // Numbers, Strings, Functions, Booleans must be strictly equal
                if (typeof(x[p]) !== "object") {
                    return false;
                }

                // Objects and Arrays must be tested recursively
                if (!Object.equals(x[p], y[p])) {
                    return false;
                }
            }
        }

        for (let p in y) {
            // allows x[ p ] to be set to undefined
            if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
                return false;
            }
        }

        return true;
    }

    //静态方法
    static getInstance() {
        if (!this.instance) {
            this.instance = new EcjiaNotificationCenter();
        }
        return this.instance;
    }
}