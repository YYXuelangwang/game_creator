import JTTextureBounds from "./JTTextureBounds";
import JTGrid from "./JTGrid";
import JTLogger from "../../JTLogger";

/*
* name;
*/
export default class JTComputeUtils extends JTTextureBounds
{
	private boundsList:JTTextureBounds[] = null;
    constructor()
    {
            super();
			this.boundsList = [];
    }

    public addToAtlas(texture:JTTextureBounds):void
	{
					var grid:JTGrid = this.getTextureGrids(texture);
					for (var i:number = 0; i < texture.col; i++)
					{
							var list:JTGrid[] = this.grids[grid.col + i];
							for (var j:number = 0; j < texture.row; j++)
							{
									var g:JTGrid = list[grid.row + j];
									if (i == 0 && j == 0) 
									{
										texture.x = g.x + 5;
										texture.y = g.y + 5;
									}
									if (g.value == 1)
									{
									}
									g.value = texture.value;
									texture.grids[i][j] = g; 
							}
					}
					this.boundsList.push(texture);
				//	this.showLogger();
	}
		
	public showLogger():void
	{
			var content:string = "";
			for (var i:number = 0; i < this.grids.length; i++)
			{
				var list:JTGrid[] = this.grids[i];
				content += "\n";
				for (var j:number = 0; j < list.length; j++)
				{
					var grid:JTGrid = list[j];
					content += "" + grid.value + ",";
				}
			}
			JTLogger.info(content);
	}
		
	public getTextureGrids(texture:JTTextureBounds):JTGrid
	{
				for (var i:number = 0; i < this.grids.length; i++)
				{
						var list:JTGrid[] = this.grids[i];
						for (var j:number = 0; j < list.length; j++)
						{
								var grid:JTGrid = list[j];
								if (grid.value != 0)
								{
									continue;
								}
								var rowIndex:number = (list.length - j);
								if (texture.row > rowIndex)
								{
										break;
								}
								var colIndex:number = this.grids.length - i;
								if (texture.col > colIndex)
								{
										break;
								}
								var isCanNext:boolean = false;
								for (var k:number = 0; k < texture.col; k++)
								{ 
										var g:JTGrid = this.grids[i][k + j];
										if(!g){
											break;
										}
										if (g.value != 0)
										{
											isCanNext = true;
											break;
										}
								}
								if (isCanNext) break;
								return grid;
						}
				}
				return null;
	}
		
	public get value():number
	{
			return this._value;
	}
		
	public set value(value:number)
	{
			this._value = value;
	}
}