/*****  build the query *****/
//   query {
//     dog {
//       displayImage
//     }
//   }

const Photo = ({ breed }) => (
  <Connect variables={{ breed }}>
    {({ data }) => {
      return <Image src={data.dog.displayImage} />;
    }}
  </Connect>
);
