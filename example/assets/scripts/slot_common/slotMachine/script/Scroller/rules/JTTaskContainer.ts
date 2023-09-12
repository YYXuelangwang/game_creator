import JTTask from "../com/tasks/JTTask";
import JTContainerMode from "./JTContainerMode";
import JTContainer from "../com/base/JTContainer";
import JTCollection from "../com/datas/JTCollection";
import JTDataInfo from "../com/datas/JTDataInfo";

/*
* name;
*/
export default class JTTaskContainer extends JTTask
{
    protected _target:JTTask = null;
    protected _type:string = null;
    protected _mode:number = JTContainerMode.SUPPORT_RESTORE;0;
    constructor()
    {
          super();
    }

    public bind(owner:JTContainer, caller:any):void
    {
          super.bind(owner, caller);
          (this._target as JTTask).bind(this, this._caller);
    }

    public contact(task:JTTask, type:string):void
    {
           this._target = task;
           this._type = type;
    }

    public runningCallTask():boolean
    {
            if (this._mode != JTContainerMode.SUPPORT_RESTORE)
            {
                return false;
            }
            return this.runningTask();
    }

    public runningTask():boolean
    {
            this._target.clear();
            return this._target.runningTask();
    }

    public get task():JTTask
    {
            return this._target;
    }

    public get dataProvider():JTCollection<JTDataInfo>
    {
            return this._dataProvider;
    }

    public set dataProvider(value:JTCollection<JTDataInfo>)
    {
            this._dataProvider = value;
            this._target.dataProvider = value;
    }

    public get type():string
    {
            return this._type;
    }

    public set mode(value:number)
    {
            this._mode = value;
    }

    public get mode():number
    {
            return this._mode;
    }
}