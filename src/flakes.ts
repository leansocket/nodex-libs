
const pad = function (value, len, char): string {
    let n = value.toString().length;
    while (n < len) {
        value = char + value;
        n++;
    }
    return value;
};

/**
 * 雪花算法唯一编码生成器
 * * 此类采用flake算法生成唯一编码。
 * * 此类能同时支持156个节点，每个节点每毫秒生成2^24个唯一编码。
 * * 此类生成的唯一编码是一个由20个十六进制字符组成的串。
*/
class Flake {
    private nodeId: number;
    private start: number;
    private seq: number;

    /**
     * 构造器
     * @param {number} nodeId 节点ID，0-255.
    */
    constructor(nodeId: number) {
        this.nodeId = nodeId || 0;
        this.start = Date.UTC(2020, 0, 1);
        this.seq = 0;
    }

    /**
     * 获取编号
    */
    public get(): string {
        this.seq += 1;

        let t = (Date.now() - this.start).toString(16);
        let n = this.nodeId.toString(16);
        let s = this.seq.toString(16);

        t = pad(t, 12, '0');
        n = pad(n, 2, '0');
        s = pad(s, 6, '0');

        return `${t}${n}${s}`;
    }
}

/**
 * 创建一个flake对象
 * @param {number} 节点编号，0-255.
 * @returns {Flake} 雪花算法唯一编码生成器对象
*/
export const create = function (nodeId: number = 0): Flake {
    return new Flake(nodeId);
}
