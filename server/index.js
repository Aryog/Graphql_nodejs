const express = require('express')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const bodyParser = require('body-parser')
const cors = require('cors')
const { default: axios } = require('axios')
async function startServer() {
    const app = express();
    const server = new ApolloServer({
        typeDefs: `
            type User {
                id: ID!
                name: String!
                username: String!
                email: String!
                phone: String!
                website: String!
            }
            type Todo {
                id: ID!
                title: String!
                completed: Boolean
                userId: ID!
                user: User
            }
            type Post {
                id: ID!
                userId: ID!
                title: String!
                body: String!
                user: User
            }
            type Comments {
                id: ID!
                postId: ID!
                name: String!
                email: String!
                body: String!
                post: Post
            }
            type Query {
                getTodos: [Todo]
                getAllUsers: [User]
                getUser(id: ID!): User
                getPosts: [Post]
                getPost(id: ID!): Post
                getComments: [Comments]
                getPostComment(postId: ID!): [Comments]
            }
        `,
        resolvers: {
            Todo: {
                user: async (todo) => (await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`)).data
            },
            Post: {
                user: async (post) => (await axios.get(`https://jsonplaceholder.typicode.com/users/${post.userId}`)).data,
            },
            Comments: {
                post: async (comment) => (await axios.get(`https://jsonplaceholder.typicode.com/posts/${comment.id}`)).data,
            },
            Query: {
                getTodos: async () => (await axios.get('https://jsonplaceholder.typicode.com/todos/')).data,
                getAllUsers: async () => (await axios.get('https://jsonplaceholder.typicode.com/users/')).data,
                getUser: async (parent, { id }) => (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data,
                getPosts: async () => (await axios.get('https://jsonplaceholder.typicode.com/posts/')).data,
                getPost: async (parent, { id }) => (await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`)).data,
                getComments: async () => (await axios.get('https://jsonplaceholder.typicode.com/comments')).data,
                getPostComment: async (parent, { postId }) => (await axios.get(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`)).data,
            }
        },
    });

    app.use(bodyParser.json());
    app.use(cors())
    await server.start();
    app.use('/graphql', expressMiddleware(server));
    app.listen(8000, () => console.log('Server started at PORT 8000'))
}
startServer();

// ToDo (Get all users with their Post and Comments within it)