const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require('mongoose');

const graphQLSchema = require('./graphql/schema/index');
const graphQLResolvers = require('./graphql/resolvers/index');

const app = express();
const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@node-graphql-hg7hv.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
	schema: graphQLSchema,
	rootValue: graphQLResolvers,
	graphiql: true
}));

mongoose.connect(URI, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
	.then(() => {
		app.listen(4300, console.log("server is running on 4300"));
	}).catch(err => {
		console.log(' msg', err);
	})

