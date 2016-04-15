var AllocationsDAO = require("../data/allocations-dao").AllocationsDAO;

function AllocationsHandler(db) {
    "use strict";

    var allocationsDAO = new AllocationsDAO(db);


    this.displayAllocations = function(req, res, next) {

        /*************** SECURITY ISSUE ****************
         ** 'allocations' is a page that requires     **
         ** a user to be logged in to access.         **
         ** As you can see, accessing this page is    **
         ** simply a request with a userId field.     **
         ** What would happen if someone made a       **
         ** request with a different userId here?     **
         ** Would anything prevent an attacker from   **
         ** accessing a different user account?       **
         ***********************************************/
        var userId = req.session.userId;

        allocationsDAO.getByUserId(userId, function(err, docs) {
            if (err) return next(err);

            docs.userId = userId; //set for nav menu items

            return res.render("allocations", docs);
        });
    };
}

module.exports = AllocationsHandler;
