
const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } })
        events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            };
        });
        return events;
    } catch (err) {
        throw err;
    }
}

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event.creator)
        };
    } catch (err) {
        throw err;
    }
}

const user = async userId => {
    try {
        const user = await User.findById(userId)
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
}
module.exports = {
    bookings: async args => {
        try {
            const booking = await Booking.find();
            return booking.map(booking => {
                return {
                    ...booking._doc,
                    _id: booking.id,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                }
            });
        } catch (err) {
            throw err;
        }
    },
    events: async () => {
        try {
            const events = await Event.find()
            events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
            });
            return events;
        } catch (err) {
            throw err;
        }
    },
    createEvent: async args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5df9b45f89bf754aa04facb4'
        });
        let createdEvents;
        try {
            const result = await event.save()
            createdEvents = {
                ...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(result._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };
            const creator = await User.findById('5df9b45f89bf754aa04facb4')
            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createdEvents.push(event);
            await creator.save();
            return createdEvents;
        } catch (err) {
            throw err;
        }
    },
    createUser: async args => {
        try {
            const existinguser = await User.findOne({ email: args.userInput.email })
            if (existinguser) {
                throw new Error('User exists already.');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return { ...result._doc, password: null, _id: result.id };
        } catch (err) {
            throw err;
        };
    },
    bookEvent: async args => {
        const fetchedEvent = await Event.findOne({ _id: args.eventId });
        const booking = new Booking({
            user: '5df9b45f89bf754aa04facb4',
            event: fetchedEvent
        });
        const result = await booking.save();
        return {
            ...result._doc,
            _id: result.id,
            user: user.bind(this, result._doc.user),
            event: singleEvent.bind(this, result._doc.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
        }
        // try {

        // } catch (err) {
        //     throw err;
        // }
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('Event');
            const event = {
                ...booking.event._doc,
                _id: booking.event.id,
                creator: user.bind(this, booking.creator)
            };
            // console.log('booking = ', booking);
            // console.log('event = ', event);
            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (err) {
            throw err;
        }
    },
};