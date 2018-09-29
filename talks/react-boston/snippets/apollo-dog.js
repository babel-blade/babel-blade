const GET_DOG_PHOTO = gql`
  query {
    dog {
      id
      displayImage
    }
  }
`;

const Photo = ({ breed }) => (
  <Query query={GET_DOG_PHOTO}>
    {({ data }) => {
      return <Image src={data.dog.displayImage} />;
    }}
  </Query>
);
// data.dog.id not used
