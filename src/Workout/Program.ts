import { Movement } from '.';
import { Intensity, Workout, WorkoutMetaData } from './Workout';

export class Program {

	movements:Movement[];
	movementPatterns:string[];

	workouts:Workout[];

	constructor() {
		this.movements = new Array<Movement>();
		this.movementPatterns = new Array<string>();
		this.workouts = new Array<Workout>();
	}

	public loadMovementsFromJSON(obj:any) {
		this.addMovement(
			new Movement(
				obj['name'], 
				obj['modality'], 
				obj['weighted'], 
				obj['primaryPattern'],
				obj['secondaryPatterns']
			)
		);
	}

	public addMovement(move:Movement):void {
		let found:boolean = false;
		this.movements.forEach((currMove:Movement) => {
			if(currMove.compare(move) === 0) found = true;
		});
		if(found) throw new Error('Duplicate Movement Error');
		this.movements.push(move);
		found = false;
		this.addMovementPatternFromMovement(move);
	}

	public addMovements(moves:Movement[]):void {
		moves.forEach((move:Movement) => {
			this.addMovement(move);
		});
	}

	public addMovementPatternFromMovement(move:Movement):void {
		this.addMovementPattern(move.primaryPattern);
		this.addMovementPatterns(move.secondaryPatterns);
	}

	public addMovementPatterns(patterns:string[]):void {
		patterns.forEach((pattern:string) => {
			this.addMovementPattern(pattern);
		});
	}

	public addMovementPattern(pattern:string):void {
		if(this.movementPatterns.indexOf(pattern) < 0)
			this.movementPatterns.push(pattern);
	}

	public allMovements():Movement[] {
		return this.movements;
	}

	public allMovementsWithPattern(pattern:string):Movement[] {
		return this.movements.filter((m:Movement) => {
			return m.primaryPattern === pattern;
		});
	}

	static createRandomWorkoutShell(allPatterns:string[], maxNumMP:number = 5):Workout {
		let w:Workout = new Workout();

		w.timeDomain = Program.getRandomIntensity();

		let numMovePattern:number = Program.getRandomInt(maxNumMP) + 1;
		for(let i:number = 1; i <= numMovePattern;i++){
			let meta:WorkoutMetaData = {
				pattern : allPatterns[Program.getRandomInt(allPatterns.length)]
			};
			w.addWorkoutMovement(meta);
		}

		return w;
	}

	/**
	 * using this as a transition function to test the new functionality
	 * @param prevWorkouts 
	 * @param allPatterns 
	 */
	static createSemiRandomWorkoutShell(prevWorkouts:Workout[], allPatterns:string[], maxNumMP:number):Workout {
		let w:Workout = new Workout();

		w.timeDomain = Program.nextTimeDomain(prevWorkouts);

		let numMovePattern:number = Program.nextNumberOfMovementPatterns(prevWorkouts,maxNumMP);
		for(let i:number = 1; i <= numMovePattern;i++)
			w.addWorkoutMovement(Program.nextWorkoutMetaData(prevWorkouts, allPatterns));
		
		return w;
	}

	static getRandomIntensity():Intensity {
		return Program.getRandomInt(3)+1;
	}

	// Random int between 0 and max
	static getRandomInt(max:number):number {
		return Math.floor(Math.random() * Math.floor(max));
	}

	static shuffleArray(arr:any[]):any[] {
		let currentIndex:number = arr.length;
		let temporaryValue:number; 
		let randomIndex:number;

  // While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = arr[currentIndex];
			arr[currentIndex] = arr[randomIndex];
			arr[randomIndex] = temporaryValue;
		}

  return arr;
	}


	/*
	static fromJSONObj(obj:any):Program {
		let p:Program;
		let patterns:MovementPattern[] = new Array<MovementPattern>();
		for(let o in obj.MovementPatterns) {
			patterns.push(MovementPattern.fromJSONObj(o));
		}

		let m:Movement[] = new Array<Movement>();
		for(let o in obj.Movements) {
			let move:Movement = Movement.fromJSONObj(o);
			for(let pattern in patterns)
				m.push(Movement.fromJSONObj(o));

		}
		return p;
	}
	*/

	static nextTimeDomain(prevWorkouts:Workout[]):Intensity {
		let total:number = 0;
		let count:number[] = [0,0,0];
		let desiredPercent = 1 / 3;

		prevWorkouts.forEach((w:Workout) => {
			count[w.timeDomain-1] = count[w.timeDomain-1] + 1;
			total = total + 1;
		});

		count.forEach((value:number, idx:number) => {
			count[idx] = count[idx] / total;
		});

		total = 0;
		count.forEach((value:number, idx:number) => {
			if(count[idx] === 0) count[idx] = 0.0001;
			count[idx] = desiredPercent/count[idx];
			total += count[idx];
		});

		count.forEach((value:number, idx:number) => {
			count[idx] = count[idx]/total;
		});

		return Program.arrayOfPercentPick(count)+1;
	}

	static nextRepCount(prevWorkouts:Workout[]):Intensity{
		return Program.getRandomIntensity();
	}

	static nextWorkoutMetaData(prevWorkouts:Workout[], allPatterns:string[]):WorkoutMetaData {
		let heatmap:Map<string,number> = Program.movementPatternHeatMapPercentage(prevWorkouts, allPatterns);
		
		let meta:WorkoutMetaData = {
			pattern : Program.nextMovementPattern(prevWorkouts,allPatterns)
		};
		return meta;
	}

	static nextMovementPattern(prevWorkouts:Workout[], allPatterns:string[]):string {
		let heatmap:Map<string,number> = Program.movementPatternHeatMapPercentage(prevWorkouts,allPatterns);
		let desiredPercent:number = 1 / allPatterns.length;

		let total:number = 0;

		//console.log(`before: ${Program.mapToString(heatmap)}`);

		allPatterns.forEach((pattern) => {
			let percent:number = heatmap.get(pattern);
			if(percent !== 0) {
				let perAway:number = desiredPercent / heatmap.get(pattern);
				heatmap.set(pattern, perAway);
			} else {
				heatmap.set(pattern, 1.0);
			}
			total += heatmap.get(pattern);
		});

		//console.log(`transition: ${Program.mapToString(heatmap)}`);
		//console.log(`total : ${total}`);

		allPatterns.forEach((pattern) => {
			heatmap.set(pattern, heatmap.get(pattern) / total);
		});

		//console.log(`after: ${Program.mapToString(heatmap)}`);

		let patternPercent:number[] = new Array<number>(allPatterns.length);
		for(let i:number = 0; i < patternPercent.length; i++)
			patternPercent[i] = heatmap.get(allPatterns[i]);

		return allPatterns[Program.arrayOfPercentPick(patternPercent)];
	}

	static nextNumberOfMovementPatterns(prevWorkouts:Workout[], maxNum:number = 4):number {
		let count:number[] = new Array<number>(maxNum - 1);
		let countPercent:number[] = new Array<number>(maxNum -1);
		let countPerDiff:number[] = new Array<number>(maxNum -1);
		let total:number = 0;
		let desiredPercent:number = 1 / maxNum;

		//initalize
		//i number of movement patterns is in count[i-1]
		for(let i = 0; i < maxNum; i++) {
			count[i] = 0;
			countPercent[i] = 0.0;
		}

		//count all the previous workouts numbers
		prevWorkouts.forEach((w:Workout) => {
			count[w.metaData.length-1] = count[w.metaData.length-1] + 1;
			total += 1;
		});
		//console.log(`total ${total}`);

		//figure out the percenttage for each one
		count.forEach((number, idx) => {
			countPercent[idx] = number / total;
		});

		//console.log(`count ${count}`);
		//console.log(`countPercent ${countPercent}`);
		//console.log(`countPercent Total ${Program.arrayTotal(countPercent)}`);

		//for each number of movement patterns, figure out the % off of the desired one
		countPercent.forEach((countPer:number, idx:number) => {
			if(countPer !== 0) {
				let percentFromDesired:number = desiredPercent / countPer;
				countPerDiff[idx] = percentFromDesired;
			} else {
				countPerDiff[idx] = 1.0;
			}
		});

		//console.log(`countPerDiff ${countPerDiff}`);
		
		//add up that total number
		let countPerDiffTotal:number = Program.arrayTotal(countPerDiff);

		//replace each number with the new percent of selection
		countPerDiff.forEach((perDiff:number, idx:number) => {
			countPerDiff[idx] = perDiff / countPerDiffTotal;
		});

		//console.log(`countPerDiff ${countPerDiff}`);
		//console.log(`countPerDiffTotal ${Program.arrayTotal(countPerDiff)}`);

		return Program.arrayOfPercentPick(countPerDiff) + 1;

	}

	/*
	static nextWorkoutMetaData(prevWorkouts:Workout[], allPatterns:string[]):WorkoutMetaData[] {
		let heatmap:Map<string,number> = Program.movementPatternHeatMapPercentage(prevWorkouts, allPatterns);
	}
	*/

	/**
	 * 
	 * @param arr array of percents (must add up to 1)
	 */
	static arrayOfPercentPick(arr:number[]):number {
		let total:number = Program.arrayTotal(arr);
		if (total > .9999 && total <= 1.00001) total = 1;
		if(total !== 1) throw new Error('Array must add up to 1');
		let r:number = Math.random();
		//console.log(`arr ${arr}`);
		//console.log(`r ${r}`);
		let t:number = 0;
		for(let i:number = 0; i < arr.length - 1; i++) {
			if(r < (t + arr[i])) return i;
			else t = t + arr[i];
		}
		return arr.length - 1;
	}

	/**
	 * Returns a map consisting of movementpatterns mapped to what percent they where used.
	 * @param prevWorkouts 
	 */
	static movementPatternHeatMapPercentage(prevWorkouts:Workout[], allPatterns:string[]):Map<string,number> {
		let heatmapnum = new Map<string,number>();
		let heatmapper = new Map<string,number>();

		allPatterns.forEach((mp:string) => {
			heatmapnum.set(mp, 0);
			heatmapper.set(mp, 0);
		});

		let total:number = 0;
		prevWorkouts.forEach((workout:Workout) => {
			workout.metaData.forEach((meta:WorkoutMetaData) => {
				total += 1;
				heatmapnum.set(meta.pattern, heatmapnum.get(meta.pattern) + 1);
			})
		});

		heatmapnum.forEach((value:number, key:string, map:Map<string,number>) => {
			heatmapper.set(key, heatmapnum.get(key) / total);
		});

		return heatmapper;

	}

	static arrayTotal(arr:number[]):number {
		return arr.reduce((accum:number, val:number) => { 
			return accum + val
		});
	}

	static mapToString(m:Map<string,number>):string {
		let str:string = "";
		m.forEach((value:number, key:string,map:Map<string,number>) => {
			str += `[${key}] => ${value}\n`;
		})
		return str;
	}

	public toString():string {
		let str:string;
		str += `Movement Patterns = ${this.movementPatterns}\n`;
		str += `Movements = ${this.movements}\n`;
		return str;
	}

}

