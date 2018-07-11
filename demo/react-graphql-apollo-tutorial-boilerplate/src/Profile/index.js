import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { createQuery } from 'blade.macro';

// const GET_CURRENT_USER = gql`
// 	{
// 		viewer {
// 			login
// 			name
// 		}
// 	}
// `;

const ProfileQuery = createQuery();
const Profile = () => (
	<Query query={gql(ProfileQuery)}>
		{({ data, loading }) => {
			const DATA = ProfileQuery(data);
			const { viewer } = DATA;

			if (loading || !viewer) {
				return <div>Loading ...</div>;
			}

			return (
				<div>
					{viewer.name} {viewer.login}
				</div>
			);
		}}
	</Query>
);

export default Profile;
