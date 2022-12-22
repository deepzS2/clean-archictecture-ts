import { Collection, MongoClient, Document, ObjectId } from 'mongodb'

export class MongoHelper {
  public static client: MongoClient | null
  public static url: string = ''

  static async connect (url = ''): Promise<void> {
    this.url = url
    this.client = await this.mongoConnect(this.url)
  }

  static async disconnect (): Promise<void> {
    await this.client?.close()
    this.client = null
  }

  static async getCollection<T extends Document> (name: string): Promise<Collection<T>> {
    if (!this.client) {
      this.client = await this.mongoConnect(this.url)
    }

    return this.client.db().collection<T>(name)
  }

  static map<T = any>(id: ObjectId, data: any): T {
    const { _id, ...rest } = data

    return {
      id: id.toString(),
      ...rest
    }
  }

  static mapCollection<T = any>(collection: any[]): T[] {
    return collection.map(c => MongoHelper.map<T>(c._id, c))
  }

  private static async mongoConnect (url: string): Promise<MongoClient> {
    return await MongoClient.connect(url)
  }
}
