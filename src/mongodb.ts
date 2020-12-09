import { MongoClient, MongoClientOptions, Db, MongoError } from 'mongodb';
import { error } from './common';

export * from 'bson';
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

    constructor(options: MongoOptions) {
        if (!options.uri) {
            throw error('ERR_MONGODB_CONNECTION', 'Mongodb connection uri must be required.');
        }
        if (!options.database) {
            throw error('ERR_MONGODB_DATABASE', 'Mongodb database must be set.');
        }
        this._options = options;
    }

    /**
     * MongoDB查询方法
     * @param queryConditionsFunction 查询语句方法
     * @param errorCallbackFunction 错误回调
     */
    public async query(queryConditionsFunction: (db: Db) => Promise<any>, errorCallbackFunction?: (error: MongoError) => any): Promise<any> {
        const { _client, _options } = this;
        if (!_client || !_options) {
            throw error('ERR_MONGODB_INIT', 'Mongodb is not init.')
        }
        if (!queryConditionsFunction) { return; }
        const db = _client.db(_options.database);
        return queryConditionsFunction(db).catch(errorCallbackFunction);
    }

    /**
     * 连接MongoDB
     */
    public async connect() {
        if (!this._client) {
            const { uri, database, ...options } = this._options;
            this._client = new MongoClient(uri, options);
        }
        if (!this._client.isConnected()) {
            try {
                await this._client.connect();
            } catch (err) {
                console.error(err);
                throw error('ERR_MONGODB_CONNECTION', err.message);
            }
        }
        return this;
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
     * 获取当前连接状态
     */
    public get isConnected() {
        return this._client.isConnected();
    }
}

/**
 * 初始化一个MongoDB实例
 * @param options
 */
export const init = async (options: MongoOptions) => new Mongodb(options).connect();

/**
 * 连接MongoDB
 * @param mongodbInstance
 */
export const connect = async (mongodbInstance: Mongodb) => mongodbInstance.connect();

/**
 * 关闭MongoDB连接
 * @param mongodbInstance
 */
export const close = async (mongodbInstance: Mongodb) => mongodbInstance.close();


