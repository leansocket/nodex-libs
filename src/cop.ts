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
export const make = function (arg0: any, arg1?: any) : CommonOperationPacket {
    if (arg0 instanceof Error) {
        let xdata: any = {};
        if (!arg0.name) {
            xdata.result = 'ERR_UNKNOWN';
        }
        else {
            let result = `${arg0.name}`.toUpperCase();
            if (result.startsWith('ERR_')) {
                xdata.result = result;
            }
            else if (result.startsWith('ER_')) {
                xdata.result = 'ERR_' + result.substr(3);
            }
            else if (result.startsWith('ERROR_')) {
                xdata.result = 'ERR_' + result.substr(6);
            }
            else {
                xdata.result = 'ERR_' + result;
            }
        }
        xdata.data = arg0.message;
        return xdata;
    }

    let data = undefined;
    if (arg0 !== undefined && arg0 !== null) {
        data = arg0;
    }
    else if (arg1 !== undefined && arg1 !== null) {
        data = arg1;
    }
    if (data !== undefined) {
        let xdata: any = {};
        xdata.result = 'ok';
        xdata.data = data;
        return xdata;
    }

    // fallback
    {
        let xdata: any = {};
        xdata.result = 'ERR_INVALID_XDATA';
        xdata.data = 'x-data is invalid.';
        return xdata;
    }
};