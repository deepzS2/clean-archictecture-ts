import { describe, expect, it, vi } from 'vitest'

import { Validation } from '@/presentation/protocols/validation'
import { EmailValidator } from '@/validation/protocols/email-validator'
import { RequiredFieldValidation, EmailValidation, ValidationComposite } from '@/validation/validators'

import { makeLoginValidation } from './login-validation-factory'

vi.mock('@/validation/validators/validation-composite')

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

describe('LoginValidation Factory', () => {
  it('Should call ValidationComposite with all validations', () => {
    makeLoginValidation()

    const emailValidator = makeEmailValidator()
    const validations: Validation[] = []

    for (const field of ['email', 'password']) {
      validations.push(new RequiredFieldValidation(field))
    }

    expect(ValidationComposite).toHaveBeenCalledWith(...validations, new EmailValidation('email', emailValidator))
  })
})
