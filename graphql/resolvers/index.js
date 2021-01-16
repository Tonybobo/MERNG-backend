const postsResolvers = require('./posts');
const userResolvers = require('./user');
const commentResolver = require('./comments');

module.exports = {
	Query: {
		...postsResolvers.Query
	},
	Mutation: {
		...userResolvers.Mutation,
		...postsResolvers.Mutation,
		...commentResolver.Mutation
	}
};
