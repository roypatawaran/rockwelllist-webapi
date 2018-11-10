module.exports = {
    error_msgs: {
        //auth
        InvalidPassword: {message: "Error: Invalid password."},
        UserNotValidated: {message: "Error: User is not yet validated."},
        UserNotExist: {message: "Error: Username is not registered."},
        InvalidPasswordToken: {message: "Error: Invalid Password Token."},
        InvalidInputSex: {message: "Error: Invalid input for sex."},
        EmailNotValid: {message: "Error: Email is not valid."},
        EmailTaken: {message: "Error: Email already taken."}
    },
    success_msgs: {
        //auth
        PasswordReset: {message: "Password reset successful"},
        EmailSent: {message: "Email sent successfully"},
        Logout: {message: "Successfully logged out."}
    }
}