import { DbAuthentication } from '@/data/usecases/account/authentication/db-authentication'
import { Authentication } from '@/domain/usecases/account/authentication'
import { BcryptAdapter } from '@/infra/criptography/bcrypt-adapter/bcrypt-adapter'
import { JwtAdapter } from '@/infra/criptography/jwt-adapter/jwt-adapter'
import { AccountMongoRepository } from '@/infra/database/mongodb/account/account-mongo-repository'
import env from '@/main/config/env'

export const makeDbAuthentication = (): Authentication => {
  const hashComparer = new BcryptAdapter(12)
  const tokenGenerator = new JwtAdapter(env.jwtSecret)
  const accountRepository = new AccountMongoRepository()

  return new DbAuthentication(accountRepository, hashComparer, tokenGenerator, accountRepository)
}
