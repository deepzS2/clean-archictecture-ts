import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { SurveyModel } from '../../../../domain/models/survey'
import { LoadSurveysController } from './load-surveys-controller'
import { LoadSurveys } from './load-surveys-protocols'
import MockDate from 'mockdate'
import { noContent, ok, serverError } from '../../../helpers/http/http-helper'

interface SutTypes {
  sut: LoadSurveysController
  loadSurveysStub: LoadSurveys
}

const makeFakeSurveys = (): SurveyModel[] => {
  return [{
    id: 'any_id',
    question: 'any_question',
    answers: [{
      image: 'any_image',
      answer: 'any_answer'
    }],
    date: new Date()
  }, {
    id: 'other_id',
    question: 'other_question',
    answers: [{
      image: 'other_image',
      answer: 'other_answer'
    }],
    date: new Date()
  }]
}

const makeLoadSurveysStub = (): LoadSurveys => {
  class LoadSurveysStub implements LoadSurveys {
    async load (): Promise<SurveyModel[]> {
      return await Promise.resolve(makeFakeSurveys())
    }
  }

  return new LoadSurveysStub()
}

const makeSut = (): SutTypes => {
  const loadSurveysStub = makeLoadSurveysStub()
  const sut = new LoadSurveysController(loadSurveysStub)

  return { sut, loadSurveysStub }
}

describe('LoadSurveys Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  it('Should call LoadSurveysUseCase', async () => {
    const { sut, loadSurveysStub } = makeSut()
    const loadSpy = vi.spyOn(loadSurveysStub, 'load')

    await sut.handle({})

    expect(loadSpy).toHaveBeenCalled()
  })

  it('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(ok(makeFakeSurveys()))
  })

  it('Should return 204 if LoadSurveys returns empty', async () => {
    const { sut, loadSurveysStub } = makeSut()
    vi.spyOn(loadSurveysStub, 'load').mockReturnValueOnce(Promise.resolve([]))
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(noContent())
  })

  it('Should return 500 if LoadSurveys throws', async () => {
    const { sut, loadSurveysStub } = makeSut()
    vi.spyOn(loadSurveysStub, 'load').mockReturnValueOnce(Promise.reject(new Error()))

    const httpResponse = await sut.handle({})

    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
