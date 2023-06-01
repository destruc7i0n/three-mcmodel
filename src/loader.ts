import { LoadingManager, DefaultLoadingManager, Loader } from 'three'

export type OnLoad<T> = (response: T) => void
export type OnProgress = (request: ProgressEvent) => void
export type OnError = (error: any) => void

export abstract class AbstractLoader<T> extends Loader {
  public path = ''

  constructor (public manager: LoadingManager = DefaultLoadingManager) {
    super(manager)
  }

  public abstract load (url: string, onLoad?: OnLoad<T>, onProgress?: OnProgress, onError?: OnError): void

  public async loadAsync (url: string, onProgress?: OnProgress): Promise<T> {
    return new Promise((resolve, reject) => {
      this.load(url, resolve, onProgress, reject)
    })
  }

  public setPath (value: string) {
    this.path = value
    return this
  }
}
