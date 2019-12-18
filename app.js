const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//ABED CHANGED THIS
const Event = require('./models/event');
const User = require('./models/user');

const app = express();
const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@node-graphql-hg7hv.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority'`;

app.use(bodyParser.json());
app.use('/graphql', graphqlHttp({
	schema: buildSchema(`
		type Event {
			_id: ID!
			title: String!
			description: String!
			price: Float!
			date: String! 
		}

		type User {
			_id: ID!
			email: String!
			password: String
		}

		input EventInput{
			title: String!
			description: String!
			price: Float!
			date: String! 
		}

		input UserInput{
			email: String!
			password: String!
		}

		type RootQuery{
			events: [Event!]!
		}

		type RootMutation{
			createEvent(eventInput: EventInput) : Event
			createUser(userInput: UserInput) : Event
		}

		schema{
			query: RootQuery
			mutation: RootMutation
		}
	`),
	rootValue: {
		events: () => {
			return Event.find().then(events => {
				return events.map(event => {
					return { ...event._doc, _id: event._doc._id.toString() };
				});
			}).catch(err => {
				throw err;
			})
		},
		createEvent: (args) => {
			const event = new Event({
				title: args.eventInput.title,
				description: args.eventInput.description,
				price: +args.eventInput.price,
				date: new Date(args.eventInput.date)
			});
			return event.save().then(result => {
				console.log(result);
				return { ...result._doc };
			}).catch(err => {
				console.log(err);
				throw err;
			});

		},
		createUser: args => {
			return bcrypt
				.hash(args.userInput.password, 12)
				.then(hashedPassword => {
					const user = new User({
						email: args.userInput.email,
						password: args.userInput.password
					});
					return user.save();
				})
				.then(result => {
					return { ...result._doc, _id: result.id };
				})
				.catch(err => {
					throw err;
				});
		}
	},
	graphiql: true
}));

mongoose.connect(URI, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
	.then(() => {
		app.listen(4300, console.log("server is running on 4300"));
	}).catch(err => {
		console.log(' msg', err);
	})

