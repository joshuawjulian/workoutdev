import * as jsonObject from './testProgram.json';

import { Movement, Program, WorkoutMetaData, Workout } from '../src/Workout/';

import { expect } from 'chai';
import 'mocha';

describe('Program - Load Movements From JSON', () => {
	let p:Program = new Program();

	let count:number = 0;
	jsonObject.movements.forEach((obj) => {
		p.loadMovementsFromJSON(obj);
		count++;
	})

	it('Should create everything through movements', () => {
		
		expect(p.movements.length).to.equal(count);

	});

	let maxNumMP:number = 3;

	let w:Workout = Program.createRandomWorkoutShell(p.movementPatterns,maxNumMP);
	p.workouts.push(w);

	for(let i:number = 0; i < 6; i++) {
		w = Program.createSemiRandomWorkoutShell(p.workouts, p.movementPatterns,maxNumMP);
		p.workouts.push(w);
		console.log(w.toString());
		console.log(JSON.stringify(w));
	}
	console.log(Program.nextNumberOfMovementPatterns(p.workouts,5));

	/*
	p.movementPatterns.forEach((pattern:string) => {
		console.log(`PATTERN : ${pattern}`);
		console.log(`\t---------`);
		p.allMovementsWithPattern(pattern).forEach((m:Movement) => {
			console.log(`\t ${m.name}`);
		});
	});
	*/
});

