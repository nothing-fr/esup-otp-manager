var mongoose = require('mongoose');

exports.initialize = function(callback) {
    mongoose.connect('mongodb://localhost/test_otp', function(error) {
        if (error) {
            console.log(error);
        } else {
            initiatilize_user_model(mongoose);
            console.log("mongoose models initialized");
            if (typeof(callback) === "function") callback();
        }
    });
}

/** User Model **/
function initiatilize_user_model(mongoose) {
    var UserModel;
    var Schema = mongoose.Schema;

    var UserSchema = new Schema({
        uid: {
            type: String,
            required: true,
            unique: true
        },
        simple_generator: {
            code: String,
            validity_time: Number
        },
        bypass: {
            codes: Array
        },
        google_authenticator: {
            secret: Object,
            window: Number
        },
    });

    mongoose.model('User', UserSchema, 'User');
    UserModel = mongoose.model('User');
    exports.UserModel = UserModel;
}


