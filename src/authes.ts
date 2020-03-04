
import * as crypto from "./crypto";

export class Token {
    private secret: string;
    private timeout: number;

    constructor(secret: string, timeout: number) {
        if (typeof (secret) !== 'string' || secret === '') {
            secret = '^dU~sTmYV$DjC&b*';
        }
        if (typeof (timeout) !== 'number') {
            timeout = 0;
        }
        this.secret = secret;
        this.timeout = timeout;
    }

    public sign(data: any): string {
        let str = JSON.stringify(data);
        let sgn = crypto.md5(this.secret + str);
        return sgn;
    }

    public make(data: any): string {
        let pack = [
            data,
            this.timeout > 0 ? Math.floor(Date.now() / 1000) : 0
        ];

        let sign = this.sign(pack).substr(12, 8);
        pack.push(sign);

        let str = crypto.encode_aes_256_cbc(this.secret, JSON.stringify(pack));
        return crypto.encode_hex64(str);
    };

    public check(token: string): any {
        let pack: any = null;
        try {
            let str = crypto.decode_hex64(token);
            str = crypto.decode_aes_256_cbc(this.secret, str);
            pack = JSON.parse(str);
        }
        catch (e) {
            console.log(e.message);
        }
        if (!pack || !Array.isArray(pack) || pack.length !== 3 ||
            pack[0] === undefined ||
            pack[1] === undefined ||
            pack[2] === undefined) {
            return undefined;
        }

        let sign = pack[2];
        pack.pop();
        if (sign !== this.sign(pack).substr(12, 8)) {
            return undefined;
        }

        let info = {
            data: pack[0],
            time: pack[1] * 1000,
            life: this.timeout * 1000
        };
        if (info.time > 0 && info.life > 0 && info.time + info.life < Date.now()) {
            return undefined;
        }
        return info;
    };
}

export class Code {
    private length: number;
    private timeout: number;

    private sessions: { [key: string]: any } = {};
    private interval: number = 10000;

    constructor(length: number, timeout: number) {
        if (typeof (length) !== 'number' || length <= 0) {
            length = 6;
        }
        if (typeof (timeout) !== 'number') {
            timeout = 0;
        }
        this.length = length;
        this.timeout = timeout;

        setInterval(() => {
            this.clear()
        }, this.interval);
    }

    public make(type: string, to: string): string {
        let k = `${type}:${to}`;
        let s = {
            type: type,
            to: to,
            code: crypto.rsod(this.length),
            time: Date.now(),
            life: this.timeout * 1000
        };
        this.sessions[k] = s;
        return s.code;
    };

    public check(type: string, to: string): any {
        let key = `${type}:${to}`;
        let s = this.sessions[key];
        if (s) {
            s.time = Date.now();
        }
        return s;
    };

    public clear(): void {
        let now = Date.now();

        let list: string[] = [];
        for (let key in this.sessions) {
            let s = this.sessions[key];
            if (now > s.time + this.timeout * 1000) {
                list.push(key);
            }
        }

        for (let i = 0; i < list.length; i++) {
            let key = list[i];
            delete this.sessions[key];
        }
    };
};

export class Key {
    private length: number;
    private timeout: number;

    private sessions: { [key: string]: any } = {};
    private interval: number = 10000;

    constructor(length: number, timeout: number) {
        if (typeof (length) !== 'number' || length <= 0) {
            length = 6;
        }
        if (typeof (timeout) !== 'number') {
            timeout = 0;
        }

        this.length = length;
        this.timeout = timeout;

        setInterval(() => {
            this.clear();
        }, this.interval);
    }

    public make(data: any): string {
        let k = crypto.rsod(this.length);
        while (this.sessions[k] !== undefined) {
            k = crypto.rsod(this.length);
        }

        let s = {
            key: k,
            data: data,
            time: Date.now(),
            life: this.timeout * 1000
        };
        this.sessions[k] = s;
        return s.key;
    };

    public check(key: string): any {
        let s = this.sessions[key];
        if (s) {
            s.time = Date.now();
        }
        return s;
    };

    public clear(): void {
        let now = Date.now();

        let list: string[] = [];
        for (let key in this.sessions) {
            let s = this.sessions[key];
            if (now > s.time + this.timeout * 1000) {
                list.push(key);
            }
        }

        for (let i = 0; i < list.length; i++) {
            let key = list[i];
            delete this.sessions[key];
        }
    };
};
