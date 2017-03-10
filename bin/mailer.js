var mailgun = require('mailgun-js')({apiKey: 'key-29adb5133eef42bc85569ef458d2aff4', domain: 'mailgun.loanfactory.com'});
var mailcomposer = require('mailcomposer');
var mailer = {};
var fs = require('fs');
var jade = require('jade');

exports.init = function (_now, cb) {
    now = _now;
    now.mailer = mailer;
    cb();
}

mailer.sendMail = function (data ,template, cb) {
    var template = process.cwd() + '/views/email-templates/' + template + '.jade';
    fs.readFile(template, 'utf8', function(err, file){
        if(err){
            console.log('ERROR!');
            cb(err);
        }
        else {
            data.baseUrl = now.ini.web.url;
            var compiledTmpl = jade.compile(file, {filename: template});
            var html = compiledTmpl(data);

            var mail = mailcomposer({
                from: now.ini.mailgun.user,
                to: data.to || data.email,
                subject: data.subject,
                html: html
            });

            mail.build(function(mailBuildError, message) {

                var dataToSend = {
                    to: data.to || data.email,
                    message: message.toString('ascii')
                };

                mailgun.messages().sendMime(dataToSend, function (sendError, body) {
                    console.log(body);
                    cb(sendError);
                });
            });

        }
    });
}

mailer.createMailingList = function (data, cb) {
    data.address = data.address + '@mail.amiqualified.com';
    mailgun.lists().create(data, function (err, body) {
        cb(err);
    });
}

mailer.deleteMailingList = function (address, cb) {
    mailgun.lists(address).delete(function (err, body) {
        cb(err);
    });
}

mailer.getRecipientList = function (address, cb) {
    mailgun.lists(address).members().list(function (err, body) {
        cb(err, body.items);
    });
}

mailer.addMember = function (data, cb) {
    console.log(data.address)
    var members = [{name: data.name, address: data.address, vars: {}}];
    mailgun.lists(data.mailing_list).members().add({
        members: members,
        subscribed: true
    }, function (err, body) {
        console.log(body)
        cb(err);
    });
}

mailer.getMailingLists = function (cb) {
    mailgun.lists().list(function (err, body) {
        cb(body.items);
    });

}

mailer.deleteMember = function (data, cb) {
    mailgun.lists(data.mailingList).members(data.member).delete(function (err, body) {
        cb(err);
    });
}


