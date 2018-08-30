const GET_DOG_PHOTO = gql`
  query getDogPhoto($breed: String) {
    dog(breed: $breed) {
      id
      displayImage
    }
  }
`;

const Photo = ({ breed }) => (
  <Query query={GET_DOG_PHOTO} variables={breed && { breed }}>
    {({ data, loading }) => {
      if (loading) return <Loading />;
      return <Image src={data.dog.displayImage} />;
    }}
  </Query>
);
