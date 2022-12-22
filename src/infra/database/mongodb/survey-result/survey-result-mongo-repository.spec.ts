import { Collection, ObjectId } from 'mongodb'
import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest'

import { mockAddSurveyParams, mockAddAccountParams } from '@/domain/mocks'
import { AccountModel } from '@/domain/models/account'
import { SurveyModel } from '@/domain/models/survey'

import { MongoHelper } from '../helpers/mongo-helper'
import { SurveyResultMongoRepository } from './survey-result-mongo-repository'

let surveyCollection: Collection
let surveyResultCollection: Collection
let accountCollection: Collection

const makeSut = (): SurveyResultMongoRepository => new SurveyResultMongoRepository()

const mockSurvey = async (): Promise<SurveyModel> => {
  const model = mockAddSurveyParams()
  const res = await surveyCollection.insertOne(model)

  return MongoHelper.map<SurveyModel>(res.insertedId, model)
}

const mockAccount = async (): Promise<AccountModel> => {
  const model = mockAddAccountParams()

  const res = await accountCollection.insertOne(model)

  return MongoHelper.map<AccountModel>(res.insertedId, model)
}

describe('SurveyMongoRepository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(globalThis.__MONGO_URI__)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = await MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})

    surveyResultCollection = await MongoHelper.getCollection('surveyResults')
    await surveyResultCollection.deleteMany({})

    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('save()', () => {
    it('Should add a survey result if its new', async () => {
      const sut = makeSut()
      const survey = await mockSurvey()
      const account = await mockAccount()

      await sut.save({
        answer: survey.answers[0].answer,
        date: new Date(),
        accountId: account.id,
        surveyId: survey.id
      })

      const surveyResult = await surveyResultCollection.findOne({
        surveyId: new ObjectId(survey.id),
        accountId: new ObjectId(account.id)
      })

      expect(surveyResult).toBeTruthy()
    })

    it('Should update survey result if its not new', async () => {
      const sut = makeSut()
      const survey = await mockSurvey()
      const account = await mockAccount()

      await surveyResultCollection.insertOne({
        answer: survey.answers[0].answer,
        date: new Date(),
        accountId: account.id,
        surveyId: survey.id
      })

      await sut.save({
        answer: survey.answers[1].answer,
        date: new Date(),
        accountId: account.id,
        surveyId: survey.id
      })

      const surveyResult = await surveyResultCollection
        .find({
          surveyId: new ObjectId(survey.id),
          accountId: new ObjectId(account.id)
        })
        .toArray()

      expect(surveyResult).toBeTruthy()
      expect(surveyResult).toHaveLength(1)
    })
  })

  describe('loadBySurveyId()', () => {
    it('Should load a survey result', async () => {
      const sut = makeSut()
      const survey = await mockSurvey()
      const account = await mockAccount()

      await surveyResultCollection.insertMany([{
        surveyId: new ObjectId(survey.id),
        accountId: new ObjectId(account.id),
        answer: survey.answers[0].answer,
        date: new Date()
      }, {
        surveyId: new ObjectId(survey.id),
        accountId: new ObjectId(account.id),
        answer: survey.answers[0].answer,
        date: new Date()
      }])
      const surveyResult = await sut.loadBySurveyId(survey.id)

      expect(surveyResult).toBeTruthy()
      expect(surveyResult?.surveyId).toEqual(survey.id)
      expect(surveyResult?.answers[0].count).toBe(2)
      expect(surveyResult?.answers[0].percent).toBe(100)
      expect(surveyResult?.answers[1].count).toBe(0)
      expect(surveyResult?.answers[1].percent).toBe(0)
    })

    it('Should return null if there is no survey result', async () => {
      const sut = makeSut()
      const survey = await mockSurvey()

      const surveyResult = await sut.loadBySurveyId(survey.id)

      expect(surveyResult).toBeFalsy()
    })
  })
})
