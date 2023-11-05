/**
 * 通用操作结果封包。此结构用于对操作结果数据传输和交换的封装。
*/
export interface CommonOperationPacket {
    /**
     * 操作结果，ok表示无错误，否则是错误名称。
    */
    result: 'ok' | string;
    /**
     * 数据，如果无错误表示结果数据，有错误则是错误信息。
    */
    data: any
};

/**
 * 包装函数参数到一个通用操作封包对象，此函数可能的使用场景如下：
 * ```
 * makeCOP(err);
 * makeCOP(ret);
 * makeCOP(null, ret);
 * ```
*/
export const make = function (arg0: any, arg1?: any): CommonOperationPacket {
    if (arg0 === undefined && arg1 === undefined) {
        return {
            result: 'ERR_INVALID_COPDATA',
            data: 'data of COP is invalid.',
        };
    }

    if (arg0 instanceof Error) {
        let packet: CommonOperationPacket = {
            result: '',
            data: null
        };
        if (!arg0.name) {
            packet.result = 'ERR_UNKNOWN';
        }
        else {
            let result = `${arg0.name}`.toUpperCase();
            if (result.startsWith('ERR_')) {
                packet.result = result;
            }
            else if (result.startsWith('ER_')) {
                packet.result = 'ERR_' + result.substr(3);
            }
            else if (result.startsWith('ERROR_')) {
                packet.result = 'ERR_' + result.substr(6);
            }
            else {
                packet.result = 'ERR_' + result;
            }
        }
        packet.data = arg0.message;
        return packet;
    }

    let data = undefined;
    if (arg0 !== undefined) {
        data = arg0;
    }
    if (arg1 !== undefined) {
        data = arg1;
    }
    if (data !== undefined) {
        return {
            result: 'ok',
            data: data
        };
    }

    return {
        result: 'ERR_UNKNOWN',
        data: 'Unknown error occurred.'
    };
};