import { describe, expect, it, vi } from 'vitest'

import { Validation } from '@/presentation/protocols/validation'
import { EmailValidator } from '@/validation/protocols/email-validator'
import { RequiredFieldValidation, EmailValidation, ValidationComposite, CompareFieldsValidation } from '@/validation/validators'

import { makeSignUpValidation } from './signup-validation-factory'

vi.mock('@/validation/validators/validation-composite')

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

describe('SignUpValidation Factory', () => {
  it('Should call ValidationComposite with all validations', () => {
    makeSignUpValidation()

    const emailValidator = makeEmailValidator()
    const validations: Validation[] = []

    for (const field of ['name', 'email', 'password', 'passwordConfirmation']) {
      validations.push(new RequiredFieldValidation(field))
    }

    expect(ValidationComposite).toHaveBeenCalledWith(...validations, new CompareFieldsValidation('password', 'passwordConfirmation'), new EmailValidation('email', emailValidator))
  })
})
