module.exports = {
    error_msgs: {
        //egc
        QRNotRecongized: {error_code: 1000, error_message: "QR Code not recognized."},
        QRAlreadyUserd: {error_code: 1001, error_message: "QR Code already used."},
        RequestCouldNotBeSaved: {error_code: 1002, error_message: "Request could not be saved."},  
        NotFound: {error_code: 1003, error_message: "Resource under given ID does not exist."}, 
        RequestCantBeProcessed: {error_code: 1004, error_message: "Request could not be processed."},

        //Payment
        InsufficientWallet: {error_code: 1005, error_message: "Insufficient Balance on Wallet."},
        PaymentTokenUsed: {error_code: 1006, error_message: "Payment token already used"},
        PaymentTokenNotRecognized: {error_code: 1007, error_message: "Payment Token not recognized."},
        InvalidTenant: {error_code: 1008, error_message: "Invalid Tenant ID."},
        AmoungLessThanZero: {error_code: 1009, error_message: "Amount could not be negative."},
        JWTExpired: {error_code: 1010, error_message: "JWT Expired."},
        PaymentTokenNotRecognize: {error_code: 1011, error_message: "Payment Token not recognized."},
        PaymentUnsuccessful: {error_code: 1012, error_message: "Payment Unsuccessful."},
        PaymentPending: {error_code: 1013, error_message: "Payment Pending."},

        //Wallet
        InvalidCoupon: {error_code: 1014, error_message: "Invalid Coupon code supplied."},
        EGCClaimed: {error_code: 1015, error_message: "E-GC already claimed."},
        EGCExpired: {error_code: 1016, error_message: "E-GC already expired."},
        WalletNotFound: {error_code: 1017, error_message: "Wallet not found."},
        InvalidWalletId: {error_code: 1018, error_message: "Invalid wallet id supplied."},

        //AUTH
        UserNotValidated: {error_code: 1019, message: "Error: User is not yet validated."},
        UserNotExist: {error_code: 1020, message: "Error: Username is not registered."},
        InvalidPassword: {error_code: 1021, message: "Error: Invalid password."},
        EmailNotValid: {error_code: 1022, message: "Error: Email is not valid."},
        EmailTaken: {error_code: 1023, message: "Error: Email already taken."},
        InvalidInputSex: {error_code: 1024, message: "Error: Invalid input for sex."},
    
        //Check APP version
        NeedToUpdate: {error_code: 1025, error_message: "Application needs to be updated."},
        AppVersionInvalid: {error_code: 1026, error_message: "Invalid app version supplied."},
        TokenExpire: {error_code: 1027, error_message: "Token already expired."},

        PaymentTokenExpired: {error_code: 1028, error_message: "Payment token already expired."},
        InvalidPasswordToken: {error_code: 1029, message: "Error: Invalid Password Token."},
    },
    success_msgs: {
        //auth
        PasswordReset: {message: "Password reset successful"},
        EmailSent: {message: "Email sent successfully"},
        Logout: {message: "Successfully logged out."}
    }
}