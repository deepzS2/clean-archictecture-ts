import { it, describe, beforeEach, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { MongoHelper } from '../../infra/database/mongodb/helpers/mongo-helper'
import { Express } from 'express'
import { setupApp } from '../config/app'
import { Collection } from 'mongodb'
import { sign } from 'jsonwebtoken'
import env from '../config/env'

let app: Express
let accountCollection: Collection
let surveyCollection: Collection

describe('Survey Routes', () => {
  beforeAll(async () => {
    await MongoHelper.connect(globalThis.__MONGO_URI__)
    app = await setupApp()
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = await MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})

    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('POST /surveys', () => {
    it('Should return 403 if no access token is provided', async () => {
      await request(app).post('/api/surveys').send({
        question: 'Question',
        answers: [{
          answer: 'Answer',
          image: 'image'
        }, {
          answers: 'Answer 2'
        }]
      }).expect(403)
    })

    it('Should return 204 on add survey with valid access token is provided', async () => {
      const res = await accountCollection.insertOne({
        name: 'Alan',
        email: 'alanr.developer@hotmail.com',
        password: '123',
        role: 'admin'
      })

      const id = res.insertedId
      const accessToken = await sign({ id }, env.jwtSecret)

      await accountCollection.updateOne({ _id: id }, { $set: { accessToken } })

      await request(app).post('/api/surveys').set('x-access-token', accessToken).send({
        question: 'Question',
        answers: [{
          answer: 'Answer',
          image: 'image'
        }, {
          answers: 'Answer 2'
        }]
      }).expect(204)
    })
  })
})
