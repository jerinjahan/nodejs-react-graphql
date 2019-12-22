const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require('mongoose');
const PORT = process.env.PORT || 8000;

const graphQLSchema = require('./graphql/schema/index');
const graphQLResolvers = require('./graphql/resolvers/index');

const isAuth = require('./middleware/is-auth'); // Custom middleware for authorization

const app = express();
const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@node-graphql-hg7hv.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
const mongodb_URI = `mongodb+srv://jerin:987654321@node-graphql-hg7hv.mongodb.net/event-react-dev?retryWrites=true&w=majority`;

app.use(bodyParser.json());
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	}
	next();
});
app.use(isAuth);
app.use('/graphql', graphqlHttp({
	schema: graphQLSchema,
	rootValue: graphQLResolvers,
	graphiql: true
}));


// app.listen(PORT, console.log("server is running on ", PORT));
// app.get('/', function (req, res) {
// 	res.json("Hello world");
// });

mongoose
	.connect(mongodb_URI, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
	.then(() => {
		app.listen(PORT, console.log("server is running on ", PORT));
	})
	.catch(err => {
		console.log(err);
	});
