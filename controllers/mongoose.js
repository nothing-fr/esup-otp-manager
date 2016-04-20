var mongoose = require('mongoose');

exports.initialize = function(callback) {
    mongoose.connect('mongodb://localhost/test-otp', function(error) {
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
        random_code: {
            code: String,
            validity_time: Number,
            active: {
                type: Boolean,
                default: false
            },
            transport: {
                sms: {
                    type: Boolean,
                    default: false
                },
                mail: {
                    type: Boolean,
                    default: false
                },
            }
        },
        bypass: {
            codes: Array,
            active: {
                type: Boolean,
                default: false
            },
            transport: {
                sms: {
                    type: Boolean,
                    default: false
                },
                mail: {
                    type: Boolean,
                    default: false
                },
            }
        },
        totp: {
            secret: Object,
            window: Number,
            active: {
                type: Boolean,
                default: false
            },
            transport: {
                sms: {
                    type: Boolean,
                    default: false
                },
                mail: {
                    type: Boolean,
                    default: false
                },
            }
        },
    });

    mongoose.model('User', UserSchema, 'User');
    UserModel = mongoose.model('User');
    exports.UserModel = UserModel;
}


