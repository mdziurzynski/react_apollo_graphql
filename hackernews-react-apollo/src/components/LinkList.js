import React, { Component } from "react"
import Link from "./Link"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import { LINKS_PER_PAGE } from '../constants'

class LinkList extends Component {

    _getLinksToRender = (isNewPage) => {
        if (isNewPage) {
            return this.props.allLinksQuery.allLinks
        }
        const rankedList = this.props.allLinksQuery.allLinks.slice()
        rankedList.sort((l1, l2) => l2.votes.length - l1.votes.length)
        return rankedList

    }

    _nextPage = () => {
        const page = parseInt(this.props.match.params.page, 10)
        if (page <= this.props.allLinksQuery._allLinksMeta.count / LINKS_PER_PAGE) {
            const nextPage = page + 1
            this.props.history.push(`/new/${nextPage}`)
        }
    }

    _previousPage = () => {
        const page = parseInt(this.props.match.params.page, 10)
        if (page > 1) {
            const previousPage = page - 1
            this.props.history.push(`/new/${previousPage}`)
        }
    }

    _subscribeToNewLinks = () => {
          this.props.allLinksQuery.subscribeToMore({
            document: gql`
              subscription LinkSubs {
                Link(filter: {
                  mutation_in: [CREATED]
                }) {
                  node {
                    id
                    url
                    description
                    createdAt
                    postedBy {
                      id
                      name
                    }
                    votes {
                      id
                      user {
                        id
                      }
                    }
                  }
                }
              }
            `,
            updateQuery: (previous, { subscriptionData }) => {
                const allNewLinks = [
                    subscriptionData.data.Link.node,
                    ...previous.allLinks
                ]
                console.log(previous)
                const result = {
                    ...previous,
                    allLinks: allNewLinks
                }
                return result
            }
        })
    }

    _updateCacheAfterVote = (store, createVote, linkId) => {
        const isNewPage = this.props.location.pathname.includes('new')
        const page = parseInt(this.props.match.params.page, 10)
        const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
        const first = isNewPage ? LINKS_PER_PAGE : 10
        const orderBy = isNewPage ? 'createdAt_DESC' : null
        console.log("here")
        const data = store.readQuery({ query: ALL_LINKS_QUERY, variables: { first, skip, orderBy }})
        console.log("her2")
        const votedLink = data.allLinks.find(link => link.id === linkId)
        votedLink.votes = createVote.link.votes

        store.writeQuery({ query: ALL_LINKS_QUERY, data })
    }

    _subscribeToNewVotes = () => {
        this.props.allLinksQuery.subscribeToMore({
            document: gql`
                subscription {
                    Vote(filter: {
                        mutation_in: [CREATED]
                    }) {
                        node {
                            id
                            link {
                                id
                                url
                                description
                                createdAt
                                postedBy {
                                    id
                                    name
                                }
                                votes {
                                    id
                                    user {
                                        id
                                    }
                                }
                            }
                            user {
                                id
                            }
                        }
                    }
                }
            `,
            updateQuery: (previous, { subscriptionData }) => {
                const votedLinkIndex = previous.allLinks.findIndex(link => link.id === subscriptionData.data.Vote.node.link.id)
                const link = subscriptionData.data.Vote.node.link
                const newAllLinks = previous.allLinks.slice() // instantiating new table (the same as the old one)
                newAllLinks[votedLinkIndex] = link
                const result = {
                    ...previous,
                    allLinks: newAllLinks
                }
                return result
            }
        })
    }

    componentDidMount() {
        this._subscribeToNewLinks()
        this._subscribeToNewVotes()
    }

    render() {

        if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
            return (<div>Loading</div>)
        }

        if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
            return (<div>Error</div>)
        }

        const isNewPage = this.props.location.pathname.includes('new')
        const linksToRender = this._getLinksToRender(isNewPage)
        const page = parseInt(this.props.match.params.page, 10)

        return (
            <div>
                <div>
                    {linksToRender.map((link, index) => (
                        <Link updateStoreAfterVote={this._updateCacheAfterVote} key={link.id} index={page ? (page -1) * LINKS_PER_PAGE + index : index } link={link} />
                    ))}
                </div>
                { isNewPage &&
                    <div className='flex ml4 mv3 gray'>
                        <div className='pointer mr2' onClick={() => this._previousPage()}>Previous</div>
                        <div className='pointer mr2' onClick={() => this._nextPage()}>Next</div>
                    </div>
                }
            </div>
        )

    }
}

export const ALL_LINKS_QUERY = gql`
    #2
    query AllLinksQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
        allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
            id
            createdAt
            url
            description
            postedBy {
                id
                name
            }
            votes {
                id
                user {
                    id
                }
            }
        }
        _allLinksMeta {
            count
        }
    }

`

export default graphql(ALL_LINKS_QUERY, { 
    name: 'allLinksQuery',
    options: (ownProps) => {
        const page = parseInt(ownProps.match.params.page, 10)
        const isNewPage = ownProps.location.pathname.includes('new')
        const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
        const first = isNewPage ? LINKS_PER_PAGE : 10
        const orderBy = isNewPage ? 'createdAt_DESC' : null
        return {
            variables: {first, skip, orderBy}
        }
    }
}) (LinkList)