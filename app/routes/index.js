var SessionHandler = require("./session");
var ProfileHandler = require("./profile");
var BenefitsHandler = require("./benefits");
var ContributionsHandler = require("./contributions");
var AllocationsHandler = require("./allocations");
var ErrorHandler = require("./error").errorHandler;

// This page handles ROUTES. It checks whether a user is logged in, whether
// they're an admin, and sends a user to whichever route they requested.

var exports = function(app, db) {

    "use strict";

    var sessionHandler = new SessionHandler(db);
    var profileHandler = new ProfileHandler(db);
    var benefitsHandler = new BenefitsHandler(db);
    var contributionsHandler = new ContributionsHandler(db);
    var allocationsHandler = new AllocationsHandler(db);

    // Middleware to check if a user is logged in
    var isLoggedIn = sessionHandler.isLoggedInMiddleware;
    var isUserAdmin = sessionHandler.isUserAdminMiddleware;

    // The main page of the app
    app.get("/", sessionHandler.displayWelcomePage);

    // Login form
    app.get("/login", sessionHandler.displayLoginPage);
    app.post("/login", sessionHandler.handleLoginRequest);

    // Signup form
    app.get("/signup", sessionHandler.displaySignupPage);
    app.post("/signup", sessionHandler.handleSignup);

    // Logout page
    app.get("/logout", sessionHandler.displayLogoutPage);

    // The main page of the app
    // There are two callbacks here. The first checks if the user is logged in 
    // (see session.js 'isLoggedInMiddleware')
    // The req and res is send to this function. If it returns next(),
    // then it sends the req and res to displayWelcomePage.
    // You can add more callbacks! (you could to fix the issue below!
    app.get("/dashboard", isLoggedIn, sessionHandler.displayWelcomePage);

    // Profile page
    app.get("/profile", isLoggedIn, profileHandler.displayProfile);
    app.post("/profile", isLoggedIn, profileHandler.handleProfileUpdate);

    // Contributions Page
    app.get("/contributions", isLoggedIn, contributionsHandler.displayContributions);
    app.post("/contributions", isLoggedIn, contributionsHandler.handleContributionsUpdate);


    /*************** SECURITY ISSUE ****************
     ** The benefits page is only visible to      **
     ** the administrator. However, is there      **
     ** anything here preventing other users from **
     ** directly accessing the route?             **
     ***********************************************/
    // Benefits Page
    app.get("/benefits", isLoggedIn, isUserAdmin, benefitsHandler.displayBenefits);
    app.post("/benefits", isLoggedIn, isUserAdmin, benefitsHandler.updateBenefits);

    // Allocations Page
    app.get("/allocations/:userId", isLoggedIn, allocationsHandler.displayAllocations);

    // Handle redirect for learning resources link
    app.get("/learn", isLoggedIn, function(req, res, next) {
        // Insecure way to handle redirects by taking redirect url from query string
        return res.redirect(req.query.url);
    });

    // Handle redirect for learning resources link
    app.get("/tutorial", function(req, res, next) {
        return res.render("tutorial/a1");
    });
    app.get("/tutorial/:page", function(req, res, next) {
        return res.render("tutorial/" + req.params.page);
    });

    // Error handling middleware
    app.use(ErrorHandler);
};

module.exports = exports;
