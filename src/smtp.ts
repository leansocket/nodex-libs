import path from 'path';
import { Mail, createTransport } from 'nodemailer';

/**
 * SMTP选项
*/
export interface ChannelOptions {
    /**
     * 邮件服务主机，IP或域名。
    */
    host: string;
    /**
     * 邮件服务端口
    */
    port?: number;
    /**
     * 是否启用安全发送
    */
    secure?: boolean;
    /**
     * 是否启用安全连接
    */
    secureConnection?: boolean;
    /**
     * 邮件服务用户名
    */
    user: string;
    /**
     * 邮件服务用户密码
    */
    pass: string;
}

/**
 * 邮件附件数据
*/
export interface MailAttachment {
    /**
     * cid可被邮件使用，如'0000001'
    */
    cid: string;
    /**
     * 附件文件名
    */
    filename: string;
    /**
     * 附件文件的路径
    */
    path: string;
}

/**
 * 邮件选项，发送邮件时需要填充此类型的对象。
*/
export interface MailOptions {
    /**
     * '"你的名字" <你的邮箱地址>'
    */
    from: string;
    /**
     * '"用户1" <邮箱地址1>, "用户2" <邮箱地址2>'
    */
    to: string;
    /**
     * 抄送
    */
    cc?: string;
    /**
     * 密送
    */
    bcc?: string;
    /**
     * 主题
    */
    subject: string;
    /**
     * 纯文本内容
    */
    text?: string;
    /**
     * HTML内容
    */
    html?: string;
    /**
     * 附件列表
    */
    attachments?: MailAttachment[];
}

/**
 * 邮件发送通道
*/
export class Channel {
    private options: ChannelOptions;
    private transport: Mail;

    constructor(options: ChannelOptions) {
        (options as any) = options || {};
        options.port = options.port || 465;
        options.secure = options.secure !== false;
        options.secureConnection = options.secureConnection !== false;

        this.options = options;

        this.transport = createTransport({
            host: options.host,
            port: options.port,
            secure: options.secure,
            secureConnection: options.secureConnection,
            auth: {
                user: options.user,
                pass: options.pass
            }
        });
    }

    /**
     * 发送邮件
    */
    public async send(mail: MailOptions): Promise<any> {
        console.log(`smtp: send mail from '${mail.from}' to '${mail.to}'`);

        return await new Promise((resolve, reject) => {
            this.transport.sendMail(mail, (err, info) => {
                if (err) {
                    return reject(err);
                }
                return resolve(info);
            });
        });
    };

    /**
     * 发送邮件，参数比send更简洁。
    */
    public async sendQuickly(to: string, subject: string, content: string, attachments?: string[]): Promise<any> {
        let mail: MailOptions = {
            from: this.options.user,
            to: to,
            subject: subject,
            html: content,
            attachments: []
        };

        if (!!attachments && attachments.length > 0) {
            let attachmentList: MailAttachment[] = [];
            for (let i = 0; i < attachments.length; i++) {
                let filePath = attachments[i];
                if (!filePath) {
                    continue;
                }

                let pinfo = path.parse(filePath);

                attachmentList.push({
                    cid: `attach-${i}`,
                    path: filePath,
                    filename: pinfo.base
                });
            }

            mail.attachments = attachmentList;
        }

        return await this.send(mail);
    };
};
