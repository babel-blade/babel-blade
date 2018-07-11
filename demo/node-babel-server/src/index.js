import 'cross-fetch/polyfill';
import dotenv from 'dotenv';
import ApolloClient, { gql } from 'apollo-boost';

dotenv.config();

const foo = { foo: 'foo' };
const bar = { bar: 'bar' };
const fooBar = { ...foo, ...bar };

const GET_ORGANIZATION = gql`
	{
		organization(login: "the-road-to-learn-react") {
			name
			url
		}
	}
`;
// console.log(fooBar);

// console.log(process.env.GHAPI);

const client = new ApolloClient({
	uri: 'https://api.github.com/graphql',
	request: operation => {
		operation.setContext({
			headers: {
				authorization: `Bearer ${process.env.GHAPI}`
			}
		});
	}
});
const GET_REPOSITORIES_OF_ORGANIZATION = gql`
	query($organization: String!) {
		organization(login: $organization) {
			name
			url
			repositories(first: 5) {
				edges {
					node {
						name
						url
					}
				}
			}
		}
	}
`;

const ADD_STAR = gql`
	mutation AddStar($repositoryId: ID!) {
		addStar(input: { starrableId: $repositoryId }) {
			starrable {
				id
				viewerHasStarred
			}
		}
	}
`;

client
	// .query({
	// 	query: GET_REPOSITORIES_OF_ORGANIZATION,
	// 	variables: {
	// 		organization: 'the-road-to-learn-react'
	// 	}
	// })
	.mutate({
		mutation: ADD_STAR,
		variables: {
			repositoryId: 'MDEwOlJlcG9zaXRvcnk2MzM1MjkwNw=='
		}
	})
	.then(console.log);
