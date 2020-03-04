
let mailer = require("nodemailer");

exports.Channel = function(args){
    let host = args.host;
    let port = args.port || 465;
    let secure = args.secure !== undefined ? args.secure : true;
    let secureConnection = args.secureConnection !== undefined ? args.secureConnection : true;
    let user = args.user;
    let pass = args.pass;

    let transport = mailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        secureConnection: secureConnection,
        auth: {
            user: user,
            pass: pass
        }
    });

    /*
    var options = {
        from: '"你的名字" <你的邮箱地址>',
        to: '"用户1" <邮箱地址1>, "用户2" <邮箱地址2>',
        cc: '' //抄送
        bcc: '' //密送
        subject: '一封来自Node Mailer的邮件',
        text: '一封来自Node Mailer的邮件',
        html: '<h1>你好，这是一封来自NodeMailer的邮件！</h1><p><img src="cid:00000001"/></p>',
        attachments: [
            {
                filename: 'img1.png', // 改成你的附件名
                path: 'public/images/img1.png', // 改成你的附件路径
                cid: '00000001' // cid可被邮件使用
            }, {
                filename: 'img2.png', // 改成你的附件名
                path: 'public/images/img2.png', // 改成你的附件路径
                cid: '00000002' // cid可被邮件使用
            }
        ]
    };
    */
    this.send = function(options, callback){
        console.log(`smtp: send mail from '${options.from}' to '${options.to}'`);

        transport.sendMail(options, (error, info)=>{
            if(error){
                console.log(`smtp: ${error.message}`);
            }

            if(typeof(callback) === 'function'){
                callback(error, info);
            }
        });
    };

    this.quick_send = function(to, subject, content, attachments){
        let options = {
            from: user,
            to: to,
            subject: subject,
            html: content,
            attachments: []
        };

        if(!!attachments && attachments.length > 0){
            let path = require("path");

            for(let p of attachments){
                let pinfo = path.parse(p);

                options.attachments.push({
                    path: p,
                    filename: pinfo.base
                });
            }
        }

        this.send(options);
    };
};
