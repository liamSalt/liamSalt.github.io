
function runSim(H_init = 10, L_init = 2, max_gens=15) {

	let H =  Number(H_init);
	let L =  Number(L_init);

	let generations = [[H, L, 0, 0]];

	const data = [];
	const hare = [];
	const lynx = [];

	for (let i = 0; i < max_gens; i++) {
		let T = L;
		for (let j = 0; j < T; j++) {
			
			let kills = Math.floor(Math.random() * 100);
			if (H===0) {
				kills = 0;
			} else {
				if (kills >= 0 && kills < 5) {
					kills = Math.max(6,Math.floor(0.3*H));
				} else if (kills >= 5 && kills < 10) {
					kills = Math.max(5,Math.floor(0.25*H));
				} else if (kills >= 10 && kills < 20) {
					kills = Math.max(4,Math.floor(0.2*H));
				} else if (kills >= 20 && kills < 50) {
					kills = Math.max(3,Math.floor(0.15*H));
				} else if (kills >= 50 && kills < 80) {
					kills = Math.max(2,Math.floor(0.1*H));
				} else if (kills >= 80 && kills < 95) {
					kills = Math.max(1,Math.floor(0.05*H));
				} else {
					kills = 0;
				}
			}

			kills = Math.min(kills, H);

		   console.log(`Lynx ${j + 1} killed ${kills} hares`);

			H -= kills;

			if (kills < 3) {
				L-=1;
			}
		}

		generations[i][2] = H;
		generations[i][3] = L;

		console.log(generations[i]);
		H = 2*H;
		L = 2*L;

		if (H === 0) {
			H = 3;
		}
		if (L === 0) {
			L = 1;
		}

		generations.push([H, L, 0, 0]);
		
		data.push({id:i,row:generations[i]});
		hare.push({x:i+1,y:generations[i][0]});
		lynx.push({x:i+1,y:generations[i][1]});
	}
	return [hare, lynx];
}
