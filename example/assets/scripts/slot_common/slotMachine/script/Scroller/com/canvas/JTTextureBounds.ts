import JTGrid from "./JTGrid";

/*
* name;
*/
export default class JTTextureBounds
{
        public grids:JTGrid[][] = null;
		public row:number = 0;
		public col:number = 0;
		protected _value:number = 0;
        public name:string = null;
		public width:number = 0;
		public height:number = 0;
		public x:number = 0;
		public y:number = 0;
		public rect:cc.Rect = null;
	    constructor()
		{
			this.grids = [];
		}
		
		public get value():number
		{
			return this._value;
		}

		public set value(value:number)
		{
			this._value = value;
		}

		public config(rect:cc.Rect):void
		{	
			this.grids = [];
			this.rect = rect;
			this.row = Math.ceil((rect.width) / JTGrid.GRIDUINT);
			this.col = Math.ceil((rect.height) / JTGrid.GRIDUINT);
			this.width = this.row * JTGrid.GRIDUINT;
			this.height = this.col * JTGrid.GRIDUINT;
			for (var i:number = 0; i < this.col; i++)
			{
				var list:JTGrid[] = [];
				for (var j:number = 0; j < this.row; j++)
				{
					var g:JTGrid = new JTGrid();
					g.value = this.value;
					g.x = j * JTGrid.GRIDUINT;
					g.y = i * JTGrid.GRIDUINT;
					g.row = j;
					g.col = i;
					list.push(g);
				}
				this.grids.push(list);
			}
		}
}