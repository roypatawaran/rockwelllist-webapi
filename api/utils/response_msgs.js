module.exports = {
    error_msgs: {
        //auth
        InvalidPassword: {error_code: 1000, message: "Error: Invalid password."},
        UserNotValidated: {error_code: 1001, message: "Error: User is not yet validated."},
        UserNotExist: {error_code: 1002, message: "Error: Username is not registered."},
        InvalidPasswordToken: {error_code: 1003, message: "Error: Invalid Password Token."},
        InvalidInputSex: {error_code: 1004, message: "Error: Invalid input for sex."},
        EmailNotValid: {error_code: 1005, message: "Error: Email is not valid."},
        EmailTaken: {error_code: 1006, message: "Error: Email already taken."},
        //create_coupon
        QRNotRecongized: {error_code: 1007, error_message: "QR Code not recognized."},
        QRAlreadyUserd: {error_code: 1008, error_message: "QR Code already used."},
        RequestCouldNotBeSaved: {error_code: 1009, error_message: "Request could not be saved."},  
        //getCouponDetails
        NotFound: {error_code: 1010, error_message: "Resource under given ID does not exist."}, 
        RequestCantBeProcessed: {error_code: 1011, error_message: "Request could not be processed."},
        //payment
        InsufficientWallet: {error_code: 1012, error_message: "Insufficient Balance on Wallet."},
        PaymentTokenExpired: {error_code: 1013, error_message: "Payment token already expired."},
        PaymentTokenUsed: {error_code: 1014, error_message: "payment token already used"},
        PaymentTokenNotRecognized: {error_code: 1015, error_message: "Payment Token not recognized."},
        InvalidTenant: {error_code: 1016, error_message: "Invalid Tenant ID."},
        AmoungLessThanZero: {error_code: 1017, error_message: "Amount could not be negative."},
        PaymentUnsuccessful: {error_code: 1018, error_message: "Payment Unsuccessful."},
        PaymentPending: {error_code: 1019, error_message: "Payment Pending."},
        //Wallet
        InvalidCoupon: {error_code: 1020, error_message: "Invalid Coupon code supplied."},
        EGCClaimed: {error_code: 1021, error_message: "E-GC already claimed."},
        EGCExpired: {error_code: 1022, error_message: "E-GC already expired."},
        WalletNotFound: {error_code: 1023, error_message: "Wallet not found."},
        //Check APP version
        NeedToUpdate: {error_code: 1024, error_message: "Application needs to be updated."},
        AppVersionInvalid: {error_code: 1025, error_message: "Invalid app version supplied."},
        TokenExpire: {error_code: 1026, error_message: "Token already expired."},
    },
    success_msgs: {
        //auth
        PasswordReset: {message: "Password reset successful"},
        EmailSent: {message: "Email sent successfully"},
        Logout: {message: "Successfully logged out."}
    }
}