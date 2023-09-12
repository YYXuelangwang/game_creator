import JTProduct from "../../lines/JTProduct";

/*
* name;数据的基类
*/
export default class JTDataInfo extends JTProduct
{
    constructor()
    {
        super();
    }
    
    //深度复制
    public clone():JTDataInfo
    {
        return null;
    }
}