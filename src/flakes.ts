
const pad = function (value, len, char): string {
    let n = value.toString().length;
    while (n < len) {
        value = char + value;
        n++;
    }
    return value;
};

class Flake {
    private nodeId: number;
    private start: number;
    private seq: number;

    constructor(nodeId: number) {
        this.nodeId = nodeId || 0;
        this.start = Date.UTC(2019, 0, 1);
        this.seq = 0;
    }

    public get(): string {
        this.seq += 1;

        let t = (Date.now() - this.start).toString(16);
        let n = this.nodeId.toString(16);
        let s = this.seq.toString(16);

        t = pad(t, 12, '0');
        n = pad(n, 2, '0');
        s = pad(s, 8, '0');

        return `${t}${n}${s}`;
    }
}

export const create = function (nodeId: number = 0): Flake {
    return new Flake(nodeId);
}
