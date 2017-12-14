///*jsxhint esversion: 6 */ 

import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'

import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache`-inmemory'

const httplink = new HttpLink({uri: '__SIMPLE_API_ENDPOINT__' })

const client = new ApolloClient({
    link: httplink,
    cache: new InMemoryCache()
})

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
    , document.getElementById('root'))

registerServiceWorker()
