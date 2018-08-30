/*****  not needed *****/
// const GET_DOG_PHOTO = gql`
//   query getDogPhoto($breed: String) {
//     dog(breed: $breed) {
//       id
//       displayImage
//     }
//   }
// `;

const Photo = ({ breed }) => (
  <Connect variables={breed && { breed }}>
    {({ data, loading }) => {
      if (loading) return <Loading />;
      return <Image src={data.dog.displayImage} />;
    }}
  </Connect>
);
