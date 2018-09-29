// src/lambda/graphql.js
const { ApolloServer, gql } = require("apollo-server-lambda");

const fetch = require("node-fetch");
const { unique } = require("shorthash");
const _ = require("lodash");

const API = "https://dog.ceo/api";

const sleep = delay => new Promise(res => setTimeout(res, delay));

const typeDefs = gql`
  type Query {
    hello: String
    dogPhotoUrl: String
    dogs: [Dog]
    dog(breed: String = "retriever"): Dog
  }

  type Dog {
    id: String!
    breed: String!
    displayImage: String
    images: [Image]
    subbreeds: [String]
  }

  type Image {
    url: String!
    id: String!
  }
`;

const createDog = (subbreeds, breed) => ({
  breed,
  id: unique(breed),
  subbreeds: subbreeds.length > 0 ? subbreeds : null
});

const resolvers = {
  Query: {
    hello: (root, args, context) => {
      return "Hello, React Boston!";
    },
    dogPhotoUrl: (root, args, context) => {
      return "https://images.dog.ceo/breeds/pomeranian/n02112018_1090.jpg";
    },
    dog: async (root, { breed }) => {
      const results = await fetch(`${API}/breed/${breed}/list`);
      const { message: subbreeds } = await results.json();

      await sleep(2000);

      return createDog(subbreeds, breed);
    }
  },
  Dog: {
    displayImage: async ({ breed }) => {
      const results = await fetch(`${API}/breed/${breed}/images/random`);
      const { message: image } = await results.json();
      return image;
    },
    images: async ({ breed }) => {
      const results = await fetch(`${API}/breed/${breed}/images`);
      const { message: images } = await results.json();
      return images.map(image => ({ url: image, id: unique(image) }));
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

exports.handler = server.createHandler();
