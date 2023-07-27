import { MongoClient, MongoClientOptions, Db } from 'mongodb';
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

export class Mongo {

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
     * @param condition 查询语句方法
     */
    public async query(condition: (db: Db) => Promise<any>): Promise<any> {
        const { _client, _options } = this;
        if (!_client || !_options) {
            throw error('ERR_MONGODB_INIT', 'Mongodb is not init.')
        }
        if (!condition) { return; }
        const db = _client.db(_options.database);
        return condition(db);
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
            } catch (err: any) {
                throw error('ERR_MONGODB_CONNECTION', err.message);
            }
        }
    }

    /**
     * 关闭MongoDB连接
     * @param force
     */
    public async close(force?: boolean): Promise<void> {
        if (!this._client) { return; }
        if (!this.isConnected) { return; }
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
