import { AccountModel, Decrypter, LoadAccountByToken, LoadAccountByTokenRepository } from './db-load-acccount-by-token-protocols'

export class DbLoadAccountByToken implements LoadAccountByToken {
  constructor (private readonly _decrypter: Decrypter, private readonly _loadAccountByTokenRepository: LoadAccountByTokenRepository) {}

  async load (accessToken: string, role?: string | undefined): Promise<AccountModel | null> {
    const token = await this._decrypter.decrypt(accessToken)

    if (!token) return null

    const account = await this._loadAccountByTokenRepository.loadByToken(accessToken, role)

    if (!account) return null

    return account
  }
}
