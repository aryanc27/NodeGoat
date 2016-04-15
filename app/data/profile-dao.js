/* The ProfileDAO must be constructed with a connected database object */
function ProfileDAO(db) {

    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof ProfileDAO)) {
        console.log("Warning: ProfileDAO constructor called without 'new' operator");
        return new ProfileDAO(db);
    }

    var users = db.collection("users");
    
    // Use crypto module to save sensitive data such as ssn, dob in encrypted format
    var crypto = require("crypto");
    var config = require("../../config/config");
    // Helper function to encrypt data
    var encrypt = function(toEncrypt) {
        var ci = crypto.createCipher(config.cryptoAlgo, config.cryptoKey);
        return ci.update(toEncrypt, "utf8", "hex") + ci.final("hex");
    };
    // Helper function to decrypt data
    var decrypt = function(toDecrypt) {
        var de = crypto.createDecipher(config.cryptoAlgo, config.cryptoKey);
        return de.update(toDecrypt, "hex", "utf8") + de.final("utf8");
    };

    /*************** SECURITY ISSUE ****************
     ** Sensitive data should be handled with     **
     ** encyrption. Check out the "crypto" module **
     ***********************************************/

    this.updateUser = function(userId, firstName, lastName, ssn, dob, address, bankAcc, bankRouting, callback) {

        // Create user document
        var user = {};
        if (firstName) {
            user.firstName = firstName;
        }
        if (lastName) {
            user.lastName = lastName;
        }
        if (address) {
            user.address = address;
        }
        if (bankAcc) {
            user.bankAcc = bankAcc;
        }
        if (bankRouting) {
            user.bankRouting = bankRouting;
        }
        if (ssn) {
            user.ssn = encrypt(ssn); 
            //encrypt sensitive fields using encrypt
        }
        if (dob) {
            user.dob = encrypt(dob);
        }

        users.update({
                _id: parseInt(userId)
            }, {
                $set: user
            },
            function(err, result) {
                if (!err) {
                    console.log("Updated user profile");
                    return callback(null, user);
                }

                return callback(err, null);
            }
        );
    };

    this.getByUserId = function(userId, callback) {
        users.findOne({
                _id: parseInt(userId)
            },
            function(err, user) {
                if (err) return callback(err, null);
                user.ssn = user.ssn ? decrypt(user.ssn) : "";
                user.dob = user.dob ? decrypt(user.dob) : "";
                // Here, we're finding the user with userID and
                // sending it back to the user, so if you encrypted
                // fields when you inserted them, you need to decrypt
                // them before you can use them.
                callback(null, user);
            }
        );
    };
}

module.exports.ProfileDAO = ProfileDAO;
