const { User, Book } = require("../models");
const { signToken } = require("../utils/auth")


const resolvers = {
    // Query for me
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw new Error("Not logged in");
        },
    },



    // Mutation for login, add user, save book, remove book
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new Error("Incorrect email or password");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new Error("Incorrect email or password");
            }

            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },

        saveBook: async (parent, { input }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: input } },
                    { new: true }
                );

                return updatedUser;
            }
            throw new Error("You need to be logged in!");
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );

                return updatedUser;
            }
            throw new Error("You need to be logged in!");
        },
    },
};

module.exports = resolvers;