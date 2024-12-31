// Get all cells and the popup elements
const cells = document.querySelectorAll('.clue');
const cats = document.querySelectorAll('.category');
const cluePopup = document.querySelector('.clue-popup');
const clueText = document.querySelector('.clue-text');
const closeButton = document.querySelector('.close-button');
let playerCount = 1;

// Add click event to each cell
cells.forEach(cell => {
    cell.addEventListener('click', function() {
        const clueX = this.getAttribute('clue-text');
		document.getElementById("wager").innerHTML = "Wager: ".concat(this.innerHTML);
		document.getElementById("wager").points = this.innerHTML;
        showClue(clueX);
	cell.innerHTML = "";
	
    });
});

// Function to display the clue popup
function showClue(clueX) {
	cells.forEach(cell => {
        cell.style.display = "none";  // Make cells visible again
    });
	cats.forEach(cell => {
        cell.style.display = "none";  // Make cells visible again
    });
    clueText.textContent = clueX;
    cluePopup.style.display = 'block';
}

// Close the clue popup
closeButton.addEventListener('click', function() {
    cluePopup.style.display = 'none';
	 cells.forEach(cell => {
        cell.style.display = "block";  // Make cells visible again
    });
	cats.forEach(cell => {
        cell.style.display = "block";  // Make cells visible again
    });
});
function increment(playerNum){
	const value = document.getElementById("myRange").value;
	const win = document.getElementById("wager");
	const ID = 'player'.concat(playerNum.toString()).concat('score');
	console.log(ID);
	const player = document.getElementById(ID);
							
	player.innerHTML = (parseInt(player.innerHTML)+ Math.ceil(parseInt(win.points)*(1+0.5*(10-value)))).toString();
}
function decrement(playerNum){
	const value = document.getElementById("myRange").value;
	const win = document.getElementById("wager");
	const ID = 'player'.concat(playerNum.toString()).concat('score');
	console.log(ID);
	const player = document.getElementById(ID);
							
	player.innerHTML = (parseInt(player.innerHTML)- Math.ceil(parseInt(win.points)*(1+0.5*(10-value)))).toString();
}
function playerInc(){playerCount+=1};