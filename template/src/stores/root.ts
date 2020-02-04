import { createHashHistory } from 'history'
import { observable } from 'mobx'
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router'

type TThemes = 'default'

const hashHistory = createHashHistory()

class RootStore {
    readonly router = new RouterStore()

    @observable theme: TThemes = 'default'

    initialize(): void {
        //TODO
    }
}

export const rootStore = new RootStore()
export const history = syncHistoryWithStore(hashHistory, rootStore.router)

export const { router } = rootStore
