import { MongoClient, MongoClientOptions } from 'mongodb';
import { error } from './common';

export type MongoOptions = {
    /**
     * 数据库连接地址
     */
    uri: string;
    /**
     * 数据库名称
     */
    database: string;
    /**
     * 数据库配置
     */
    options: MongoClientOptions;
}

export class Mongodb {

    private readonly _mongoOptions: MongoOptions;

    private _client: MongoClient;

    constructor(mongoOptions: MongoOptions, connectionCallback = () => {}) {
        const { uri, database } = mongoOptions;
        if (!uri) {
            throw error('ERR_MONGODB_CONNECTION', 'Mongodb connection uri must be required.')
        }
        if (!database) {
            throw error('ERR_MONGODB_DATABASE', 'Mongodb database must be set.')
        }
        this._mongoOptions = mongoOptions;
        this.connect().then(connectionCallback);
    }

    /**
     * 执行MongoDB查询方法
     * @param queryConditionsFunction
     */
    public async query(queryConditionsFunction): Promise<any> {
        const { _client, _mongoOptions } = this
        if (!_client || !_mongoOptions) {
            throw error('ERR_MONGODB_INIT', 'Mongodb is not init.')
        }
        if (!queryConditionsFunction) return;
        const db = _client.db(_mongoOptions.database)
        return queryConditionsFunction(db);
    }

    public async connect() {
        if (!this._client) {
            const { uri, options } = this._mongoOptions;
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
    public getMongoOptions() {
        return this._mongoOptions;
    }

    /**
     * 获取当前客户端
     */
    public getMongoClient() {
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
 * @param mongoOptions
 */
export const init = (mongoOptions: MongoOptions) => new Mongodb(mongoOptions);

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


