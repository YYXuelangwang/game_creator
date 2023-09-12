/*
* name;
*/
export default class JTLogger {
    private static Log: String = '[Log]：';
    private static Warn: String = "[Warn]: ";
    private static Error: String = "[Error]";

    public static info(...msgs: any[]): void
     {
        var msg = JTLogger.getTime() + msgs.toString();
        console.log(JTLogger.Log + msg);
    }

    public static error(...msgs: any[]): void
     {
        var msg = JTLogger.getTime() + msgs.toString(); 
        throw new Error(JTLogger.Error + msg);
    }

    public static infos(msgs:any[], propertys:string[]):void
    {
                let c:string = "";
                for (let i:number = 0; i < propertys.length; i++)
                {
                        for (let j:number = 0; j < msgs.length; j++)
                        {
                                let obj:any = msgs[j];
                                c += obj[propertys[i]] + "  ,"
                        }
                }
                this.info(c);
    }

    public static warn(...msgs: any[]): void 
    {
        var msg = JTLogger.getTime() + msgs.toString();
        console.log(JTLogger.Warn + msg);
    }

    private static getTime(): String 
    {
        var date: Date = new Date();
        var time: String = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+":"+date.getMilliseconds()+"---";
        return time;
    }
}
