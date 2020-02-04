import React from 'react'
import { hot } from 'react-hot-loader/root'
import { Router } from 'react-router-dom'

import styles from './root.module.scss'

import { rootStore, history } from '../stores/root'

const RootComponent = (): JSX.Element => {
    return (
        <Router history={history}>
            <link href={`semantic/${rootStore.theme}/semantic.min.css`} rel='stylesheet' type='text/css'></link>
            <div className={styles['root']}></div>
        </Router>
    )
}

export const Root = hot(RootComponent)
