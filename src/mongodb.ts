import { MongoClient, MongoClientOptions } from 'mongodb';
import { error } from './common';

export interface MongoOptions extends MongoClientOptions {
    /**
     * 数据库连接地址
     */
    uri: string;
    /**
     * 数据库名称
     */
    database: string;
}

export class Mongodb {

    private _options: MongoOptions;

    private _client: MongoClient;

    constructor(options: MongoOptions, connectionCallback = (...args) => {}) {
        if (!options.uri) {
            throw error('ERR_MONGODB_CONNECTION', 'Mongodb connection uri must be required.')
        }
        if (!options.database) {
            throw error('ERR_MONGODB_DATABASE', 'Mongodb database must be set.')
        }
        this._options = options;
        this.connect().then(connectionCallback.bind(null, this));
    }

    /**
     * 执行MongoDB查询方法
     * @param queryConditionsFunction
     */
    public async query(queryConditionsFunction): Promise<any> {
        const { _client, _options } = this
        if (!_client || !_options) {
            throw error('ERR_MONGODB_INIT', 'Mongodb is not init.')
        }
        if (!queryConditionsFunction) return;
        const db = _client.db(_options.database)
        return queryConditionsFunction(db);
    }

    public async connect() {
        if (!this._client) {
            const { uri, database, ...options } = this._options;
            this._client = new MongoClient(uri, options);
        }
        if (!this._client.isConnected()) {
            try {
                return this._client.connect();
            } catch (err) {
                console.error(err);
                throw error('ERR_MONGODB_CONNECTION', err.message)
            }
        }
    }

    /**
     * 关闭MongoDB连接
     * @param force
     */
    public async close(force?: boolean): Promise<void> {
        if (!this._client) { return; }
        return this._client.close(force);
    }

    /**
     * 获取当前连接参数
     */
    public get options() {
        return this._options;
    }

    /**
     * 获取当前客户端
     */
    public get client() {
        return this._client;
    }

    /**
     * 判断当前是否已连接
     */
    public isConnected() {
        return this._client.isConnected()
    }
}

/**
 * 初始化一个MongoDB实例
 * @param options
 */
export const init = (options: MongoOptions) => new Mongodb(options);

/**
 * 连接MongoDB
 * @param mongodbInstance
 */
export const connect = (mongodbInstance: Mongodb) => mongodbInstance.connect();

/**
 * 关闭MongoDB连接
 * @param mongodbInstance
 */
export const close = (mongodbInstance: Mongodb) => mongodbInstance.close();


