
/*
* n
*/
export default class JTRollerData 
{

    public elements:number[] = [];
    public roller:{rollerId:number,start:number,end:number}[] = [];
    constructor()
    {

    }   

    getElementsByRollerId(rollerId:number):number[]{
        let roller:{rollerId:number,start:number,end:number};
        for(let r of this.roller){
            if(r.rollerId == rollerId){
                 roller = r;
            }
        }
        if(!roller){
            return this.elements;
        }
        
        let result = [];
        for(let i=roller.start-1;i<roller.end;i++){
            let e = this.elements[i];
            if(e==undefined){
                continue;
            }
            result.push(e);
        }
        
        return result;

    }

}

