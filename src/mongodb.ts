import { MongoClient } from 'mongodb';
import { MongoClientOptions } from 'mongodb';
import assert from "assert";
import { error } from "./common";

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

    private readonly mongoOptions: MongoOptions;

    private client: MongoClient;

    constructor(mongoOptions: MongoOptions, connectionCallback = () => {}) {
        assert(mongoOptions.uri, 'Mongodb connection uri must be required.')
        assert(mongoOptions.database, 'Mongodb database must be set.')
        this.mongoOptions = mongoOptions;
        this.connect().then(connectionCallback);
    }

    /**
     * 执行MongoDB查询方法
     * @param queryConditionsFunction
     */
    public async query(queryConditionsFunction) {
        const { client, mongoOptions } = this
        if (!client || !mongoOptions) {
            throw error('ERR_MONGODB_INIT', 'Mongodb is not init.')
        }
        if (!queryConditionsFunction) return;
        const db = client.db(mongoOptions.database)
        return queryConditionsFunction(db);
    }

    public async connect() {
        if (this.client) {
            return this.client.connect();
        }
        const { uri, options } = this.mongoOptions;
        this.client = new MongoClient(uri, options);
        try {
            return this.client.connect();
        } catch (err) {
            console.error(err);
            throw error('ERR_MONGODB_CONNECTION', err.message)
        }
    }

    /**
     * 关闭MongoDB连接
     * @param force
     */
    public close(force?: boolean) {
        if (!this.client) return;
        return this.client.close(force);
    }

    /**
     * 获取当前连接参数
     */
    public getMongoOptions() {
        return this.mongoOptions;
    }

    /**
     * 获取当前客户端
     */
    public getMongoClient() {
        return this.client;
    }
}

/**
 * 初始化一个MongoDB实例
 * @param mongoOptions
 */
export const init = (mongoOptions: MongoOptions) => new Mongodb(mongoOptions);

/**
 * 连接MongoDB
 * @param MongodbInstance
 */
export const connect = (MongodbInstance: Mongodb) => MongodbInstance.connect();

/**
 * 关闭MongoDB连接
 * @param MongodbInstance
 */
export const close = (MongodbInstance: Mongodb) => MongodbInstance.close();


