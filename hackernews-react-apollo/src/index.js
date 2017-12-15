///*jsxhint esversion: 6 */ 

import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'

import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const httplink = new HttpLink({uri: 'https://api.graph.cool/simple/v1/cjb6q2uy303cd0191yiayum5z' })

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
