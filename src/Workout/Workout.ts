import { Movement} from '.';

export enum Intensity {
	low = 1,
	mod = 2,
	high = 3
}

export interface WorkoutMetaData {
	pattern: string;
	movement?: Movement;
}

export class Workout {

	name:string;
	text:string;
	timeDomain:Intensity


	//meta data
	metaData:WorkoutMetaData[];

	constructor() {
		this.metaData = new Array<WorkoutMetaData>();
		this.name = this.text = 'Unassigned';
	}

	public addWorkoutMovement(move:WorkoutMetaData):void {
		this.metaData.push(move);
	}

	public toString():string {
		let str:string = `Name: ${this.name}\n`;
		str += `Time Domain: ${Intensity[this.timeDomain]}\n`;
		str += `Text:\n`;
		str += this.text + '\n';
		this.metaData.forEach((data:WorkoutMetaData) => {
			str += `Pattern: ${data.pattern}`;
			str += ` | Movement: ${(data.movement) ? data.movement.name : 'unassigned'}`;
			str += '\n';
		});
		return str;
	}


}