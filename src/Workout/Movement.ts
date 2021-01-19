
export type Modality = 'Gymnastics' | 'Weightlifting' | 'Cardio';

export class Movement {
	primaryPattern:string;
	secondaryPatterns:string[];
	name:string;
	modality:Modality;
	weighted:boolean;

	constructor(name:string, modality:Modality, weighted:boolean, primaryPattern:string, secondaryPatterns?:string[]) {
		this.name = name;
		this.primaryPattern = primaryPattern;
		this.modality = modality;
		this.weighted = weighted;
		if(secondaryPatterns) 
			this.secondaryPatterns = secondaryPatterns;
		else 
			this.secondaryPatterns = new Array<string>();
	}

	public toStringVerbose():string {
		let str:string = `Movement: ${this.name} | Modality: ${this.modality} | Primary: ${this.primaryPattern}`;
		this.secondaryPatterns.forEach((mp:string) => {
			str += ` | ${mp}`;
		});
		return str;
	}

	toJSON():string {
		let json:string = "";
		json = JSON.stringify(this);
		return json;
	}
/*
	static fromJSON(json:string):Movement {
		return Movement.fromJSONObj(JSON.parse(json));
	}
	*/

	/*
	static fromJSONObj(obj:any):Movement {
		let m:Movement;

		let name:string = obj.name;
		let primary:MovementPattern = MovementPattern.fromJSONObj(obj.primary);
		let secondary:MovementPattern[] = new Array<MovementPattern>();
		for(let o in obj.secondary) {
			secondary.push(MovementPattern.fromJSONObj(o));
		}

		m = new Movement(name,primary,secondary);

		return m;
	}
	*/

	public compare(other:Movement):number {
		return this.name.localeCompare(other.name);
	}
}