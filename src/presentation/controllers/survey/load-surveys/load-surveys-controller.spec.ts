import MockDate from 'mockdate'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { noContent, ok, serverError } from '@/presentation/helpers/http/http-helper'
import { LoadSurveysSpy } from '@/presentation/mocks'
import { faker } from '@faker-js/faker'

import { LoadSurveysController } from './load-surveys-controller'
import { HttpRequest } from './load-surveys-protocols'

interface SutTypes {
  sut: LoadSurveysController
  loadSurveysSpy: LoadSurveysSpy
}

const mockRequest = (): HttpRequest => ({
  accountId: faker.datatype.uuid()
})

const makeSut = (): SutTypes => {
  const loadSurveysSpy = new LoadSurveysSpy()
  const sut = new LoadSurveysController(loadSurveysSpy)

  return { sut, loadSurveysSpy }
}

describe('LoadSurveys Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  it('Should call LoadSurveysUseCase with correct value', async () => {
    const { sut, loadSurveysSpy } = makeSut()

    const httpRequest = mockRequest()
    await sut.handle(httpRequest)

    expect(loadSurveysSpy.accountId).toBe(httpRequest.accountId)
  })

  it('Should return 200 on success', async () => {
    const { sut, loadSurveysSpy } = makeSut()

    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(ok(loadSurveysSpy.surveyModels))
  })

  it('Should return 204 if LoadSurveys returns empty', async () => {
    const { sut, loadSurveysSpy } = makeSut()
    loadSurveysSpy.surveyModels = []

    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(noContent())
  })

  it('Should return 500 if LoadSurveys throws', async () => {
    const { sut, loadSurveysSpy } = makeSut()
    vi.spyOn(loadSurveysSpy, 'load').mockRejectedValueOnce(new Error())

    const httpResponse = await sut.handle(mockRequest())

    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
