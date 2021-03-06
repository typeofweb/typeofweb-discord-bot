import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import { getConfig } from './config';

export const initDb = (() => {
  let mongoClient: MongoClient | undefined = undefined;

  return async () => {
    const mongoUrl = getConfig('MONGO_URL');
    const dbName = mongoUrl.split('/').pop();
    if (!mongoClient) {
      const m = new MongoClient(mongoUrl, { keepAlive: true });
      mongoClient = await m.connect();
    }

    const db = mongoClient.db(dbName);
    return db;
  };
})();

export type StatsCollection = {
  readonly memberId: string;
  readonly memberName: string;
  readonly messagesCount: number | undefined | null;
  readonly updatedAt: Date;
  readonly yearWeek?: string | null;
};

export const getStatsCollection = (db: Db) => {
  return db.collection<StatsCollection>('stats');
};

export type KarmaCollection = {
  readonly from: string;
  readonly to: string;
  readonly value: number;
  readonly description?: string | null;
  readonly createdAt: Date;
};

export const getKarmaCollection = (db: Db) => {
  return db.collection<KarmaCollection>('karma');
};
