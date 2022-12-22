import { Collection, WithId, Document } from 'mongodb'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { mockAddAccountParams } from '@/domain/mocks'
import { faker } from '@faker-js/faker'

import { MongoHelper } from '../helpers/mongo-helper'
import { AccountMongoRepository } from './account-mongo-repository'

let accountCollection: Collection
const makeSut = (): AccountMongoRepository => new AccountMongoRepository()

describe('AccountMongoRepository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(globalThis.__MONGO_URI__)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('add()', () => {
    it('Should return an account on success', async () => {
      const sut = makeSut()
      const addAccountParams = mockAddAccountParams()

      const account = await sut.add(addAccountParams)

      expect(account).toBeTruthy()
      expect(account?.id).toBeTruthy()
      expect(account.name).toBe(addAccountParams.name)
      expect(account.email).toBe(addAccountParams.email)
      expect(account.password).toBe(addAccountParams.password)
    })
  })

  describe('loadByEmail()', () => {
    it('Should return an account on success', async () => {
      const sut = makeSut()
      const addAccountParams = mockAddAccountParams()

      await accountCollection.insertOne(addAccountParams)
      const account = await sut.loadByEmail(addAccountParams.email)

      expect(account).toBeTruthy()
      expect(account?.id).toBeTruthy()
      expect(account?.name).toBe(addAccountParams.name)
      expect(account?.email).toBe(addAccountParams.email)
      expect(account?.password).toBe(addAccountParams.password)
    })

    it('Should return null if loadByEmail fails', async () => {
      const sut = makeSut()

      const account = await sut.loadByEmail(faker.internet.email())

      expect(account).toBeFalsy()
    })
  })

  describe('loadByToken()', () => {
    let name = faker.name.fullName()
    let email = faker.internet.email()
    let password = faker.internet.password()
    let accessToken = faker.datatype.uuid()

    beforeEach(() => {
      name = faker.name.fullName()
      email = faker.internet.email()
      password = faker.internet.password()
      accessToken = faker.datatype.uuid()
    })

    it('Should return an account on loadByToken without role', async () => {
      const sut = makeSut()

      await accountCollection.insertOne({
        name,
        email,
        password,
        accessToken
      })

      const account = await sut.loadByToken(accessToken)

      expect(account).toBeTruthy()
      expect(account?.id).toBeTruthy()
      expect(account?.name).toBe(name)
      expect(account?.email).toBe(email)
      expect(account?.password).toBe(password)
    })

    it('Should return an account on loadByToken with admin role', async () => {
      const sut = makeSut()

      await accountCollection.insertOne({
        name,
        email,
        password,
        accessToken,
        role: 'admin'
      })
      const account = await sut.loadByToken(accessToken, 'admin')

      expect(account).toBeTruthy()
      expect(account?.id).toBeTruthy()
      expect(account?.name).toBe(name)
      expect(account?.email).toBe(email)
      expect(account?.password).toBe(password)
    })

    it('Should return an account on loadByToken if user is admin', async () => {
      const sut = makeSut()

      await accountCollection.insertOne({
        name,
        email,
        password,
        accessToken,
        role: 'admin'
      })
      const account = await sut.loadByToken(accessToken)

      expect(account).toBeTruthy()
      expect(account?.id).toBeTruthy()
      expect(account?.name).toBe(name)
      expect(account?.email).toBe(email)
      expect(account?.password).toBe(password)
    })

    it('Should return null on loadByToken with invalid role', async () => {
      const sut = makeSut()

      await accountCollection.insertOne({
        name,
        email,
        password,
        accessToken
      })
      const account = await sut.loadByToken(accessToken, 'admin')

      expect(account).toBeFalsy()
    })

    it('Should return null if loadByToken fails', async () => {
      const sut = makeSut()

      const account = await sut.loadByToken(accessToken)

      expect(account).toBeFalsy()
    })
  })

  describe('updateAccessToken()', () => {
    it('Should update the account accessToken on updateAccessToken success', async () => {
      const sut = makeSut()
      const addAccountParams = mockAddAccountParams()

      const { insertedId } = await accountCollection.insertOne(addAccountParams)

      let account = await accountCollection.findOne({ _id: insertedId }) as WithId<Document>

      expect(account?.accessToken).toBeFalsy()

      const accessToken = faker.datatype.uuid()
      await sut.updateAccessToken(account._id.toString(), accessToken)

      account = await accountCollection.findOne({ _id: insertedId }) as WithId<Document>

      expect(account).toBeTruthy()
      expect(account?.accessToken).toBe(accessToken)
    })
  })
})
