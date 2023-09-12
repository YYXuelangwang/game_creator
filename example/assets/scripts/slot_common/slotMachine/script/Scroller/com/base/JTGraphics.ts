export default class JTGraphics extends cc.Node
{
    public graphics:cc.Graphics;
    constructor()
    {
        super();
        this.graphics=this.addComponent(cc.Graphics);//cocos
    }
}