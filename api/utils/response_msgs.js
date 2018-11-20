module.exports = {
    error_msgs: {
        //auth
        InvalidPassword: {message: "Error: Invalid password."},
        UserNotValidated: {message: "Error: User is not yet validated."},
        UserNotExist: {message: "Error: Username is not registered."},
        InvalidPasswordToken: {message: "Error: Invalid Password Token."},
        InvalidInputSex: {message: "Error: Invalid input for sex."},
        EmailNotValid: {message: "Error: Email is not valid."},
        EmailTaken: {message: "Error: Email already taken."},
        //create_coupon
        QRNotRecongized: {error_code: 400, error_message: "QR Code not recognized."},
        QRAlreadyUserd: {error_code: 400, error_message: "QR Code already used."},
        RequestCouldNotBeSaved: {error_code: 400, error_message: "Request could not be saved."},  
        //getCouponDetails
        NotFound: {error_code: 404, error_message: "Resource under given ID does not exist."}, 
        RequestCantBeProcessed: {error_code: 400, error_message: "Request could not be processed."},
        //payment
        InsufficientWallet: {error_code: 400, error_message: "Insufficient Balance on Wallet."},
        PaymentTokenExpired: {error_code: 400, error_message: "Payment token already expired."},
        PaymentTokenUsed: {error_code: 400, error_message: "payment token already used"},
        PaymentTokenNotRecognized: {error_code: 400, error_message: "Payment Token not recognized."},
        InvalidTenant: {error_code: 400, error_message: "Invalid Tenant ID."},
        AmoungLessThanZero: {error_code: 400, error_message: "Amount could not be negative."},
        PaymentUnsuccessful: {error_code: 400, error_message: "Payment Unsuccessful."},
        PaymentPending: {error_code: 400, error_message: "Payment Pending."},
        //Wallet
        InvalidCoupon: {error_code: 400, error_message: "Invalid Coupon code supplied."},
        EGCClaimed: {error_code: 400, error_message: "E-GC already claimed."},
        EGCExpired: {error_code: 400, error_message: "E-GC already expired."},
        WalletNotFound: {error_code: 404, error_message: "Wallet not found."},
        //Check APP version
        NeedToUpdate: {error_code: 426, error_message: "Application needs to be updated."},
        AppVersionInvalid: {error_code: 400, error_message: "Invalid app version supplied."},
    },
    success_msgs: {
        //auth
        PasswordReset: {message: "Password reset successful"},
        EmailSent: {message: "Email sent successfully"},
        Logout: {message: "Successfully logged out."}
    }
}