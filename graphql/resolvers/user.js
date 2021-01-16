const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");
const {
	validateRegisterInput,
	validateLoginInput,
} = require("../../utils/validator");

function generateToken(user) {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		SECRET_KEY,
		{ expiresIn: "1h" }
	);
}
module.exports = {
	Mutation: {
		async login(_, { username, password }) {
			const { errors, valid } = validateLoginInput(username, password);
			const user = await User.findOne({ username });
			if (!valid) {
				throw new UserInputError("Error", { errors });
			}
			if (!user) {
				errors.general = "User not found";
				throw new UserInputError("User not found", { errors });
			}
			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				error.general = "Wrong credentail";
				throw new UserInputError("Wrong credentail", { errors });
			}
			const token = generateToken(user);
			return {
				...user._doc,
				id: user._id,
				token,
			};
		},
		async register(
			_,
			{ registerInput: { username, email, password, confirmPassword } }
		) {
			//TODOS : Validate user Data
			const { valid, errors } = validateRegisterInput(
				username,
				email,
				password,
				confirmPassword
			);
			if (!valid) {
				throw new UserInputError("Errors", { errors });
			}
			//TODO: Make sure user doesnt already exist
			const user = await User.findOne({ username });
			if (user) {
				throw new UserInputError("username is taken", {
					error: {
						username: " This username is taken",
					},
				});
			}
			//TODO:  Hash password and create token
			password = await bcrypt.hash(password, 12);

			const newUser = new User({
				email,
				username,
				password,
				createdAt: new Date().toISOString(),
			});
			const res = await newUser.save();
			const token = generateToken(res);
			return {
				...res._doc,
				id: res._id,
				token,
			};
		},
	},
};