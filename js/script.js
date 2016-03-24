'use strict'

var fieldContainer = document.querySelector('[data-content="minerContainer"]');
var field;
var fieldMatrix;
var fieldCols = 9;
var fieldRows = 9;
var minesCount = 10;
var gameEnd;
var restartBtn;
var mineCounter;
var topBar;
var selectedDif;
var mouseRightDown = false;
var mouseLeftDown = false;
var mouseDoubleDown = false;

miner();

/*Функция, отмечающая, какая клавиша мыши нажата в данный момент,
и проверяющая, нажаты ли обе одновременно*/
function mouseDownTrue(e) {
	
	if (e.which == 1) {
		mouseLeftDown = true;
	}
	
	if (e.which == 3) {
		mouseRightDown = true;
	}
	
	if (mouseLeftDown && mouseRightDown) {
		mouseDoubleDown = true;
	}

}

/*Функция, отмечающая, какая клавиша мыши была отпущена,
и, если до этого были нажаты обе клавиши, запускающая соответствующую функцию*/
function mouseDownFalse(e) {
	
	if (e.which == 1) {
		mouseLeftDown = false;
	}
	
	if (e.which == 3) {
		mouseRightDown = false;
	}
	
	if ((e.target.tagName == 'TD')&&(e.target.dataset.content == 'opened')&&mouseDoubleDown&&!gameEnd) {
		var col = e.target.cellIndex;
		var row = e.target.parentElement.rowIndex;
		openAllAroud(row, col, e.target.innerHTML);
		mouseDoubleDown = false;
	}
	
}

/*Функция, устанавливающая/убирающая флаг по правому клику на клетку поля,
и изменяющая цифру на счетчике мин*/
function setFlag(e) {
	
	e.preventDefault();
	
	if ((e.target.tagName != 'TD')||(e.target.dataset.content == 'opened')||(gameEnd)) {
		return;
	}
	
	if (e.target.dataset.content != 'flag') {
		e.target.dataset.content = 'flag';
		mineCounter.innerHTML = parseInt(mineCounter.innerHTML) - 1;
	} else {
		e.target.dataset.content = '';
		mineCounter.innerHTML = parseInt(mineCounter.innerHTML) + 1;
	}
	
}

/*Функция, отлавливающая левый клик на элементах контейнера fieldContainer и запускающая соответствующее действие*/
function pushBtn(e) {
	
	if (e.target.dataset.action == 'restart') {
		gameInit();
		return;
	}
	
	if (e.target.tagName == 'LI') {
		menuAction(e.target);
		return;
	}
	
	if ((e.target.tagName != 'TD')||(e.target.dataset.content == 'flag')||(e.target.dataset.content == 'opened')||(gameEnd)) {
		return;
	}
	
	var col = e.target.cellIndex;
	var row = e.target.parentElement.rowIndex;
	
	openCell(row, col);
	
	isGameEnd();
}


/*Функция, проверяющая условия победы и поражения*/
function isGameEnd() {
	
	if (gameEnd == 'lost') {
		gameOver();
		return;
	}
	
	isWin();
}

/*Функция, открывающая предположительно безопасные клетки вокруг выбранной, 
если кол-во мин указанное в ней совпадает с кол-вом флагов вокруг нее*/
function openAllAroud(row, col, minesNum) {
	
	if (!minesNum) {
		return;
	}
	
	var flagsNum = 0;
	var wrongFlags = false;
	
	for (var i = row - 1; i < row + 2; i++) {
		for (var j = col -1; j < col + 2; j++) {
			if ((i < 0)||(j < 0)||(i > fieldRows - 1)||(j > fieldCols - 1)||(field.rows[i].cells[j].dataset.content != 'flag')) {
				continue;
			}
			flagsNum++;
		}
	}
	
	if (minesNum != flagsNum) {
		return;
	}
	
	
	for (var i = row - 1; i < row + 2; i++) {
		for (var j = col -1; j < col + 2; j++) {
			if ((i < 0)||(j < 0)||(i > fieldRows - 1)||(j > fieldCols - 1)||(field.rows[i].cells[j].dataset.content == 'flag')||(field.rows[i].cells[j].dataset.content == 'opened')) {
				continue;
			}
			openCell(i, j);
			if (gameEnd) {
				wrongFlags = gameEnd;
				gameEnd = false;
				
			}
		}
	}

	gameEnd = wrongFlags;
	
	isGameEnd();
}

/*Функция, выполняющая смену сложности при клике на пункт выпадающего меню
и перезапускающая игру*/
function menuAction(target) {
	var action = target.dataset.action;
	if (action) {
		
		if (action == 'tip') {
				alert('П О Д С К А З К А:\n\n'+
				'Правая кнопка мыши: открывает ячейку.\n'+
				'Левая кнопка мыши: ставит/убирает флаг.\n'+
				'Правая+левая кнопки мыши: открывают все безопасные ячейки вокруг выбранной,\n'+
				'если цифра в ней совпадает с количеством флагов вокруг.\n\n'+
				'Для победы надо открыть все безопасные ячейки (флаги ставить не обязательно).');
				return;
		}
		
		selectedDif.classList.remove('selected');
		target.classList.add('selected');
		selectedDif = target;
		
		switch (action) {
			
			case 'easy':
				fieldCols = 9;
				fieldRows = 9;
				minesCount = 10;
				break;
			case 'medium':
				fieldCols = 16;
				fieldRows = 16;
				minesCount = 40;
				break;
			case 'hard':
				fieldCols = 30;
				fieldRows = 16;
				minesCount = 99;
				break;
			case 'custom':
				fieldCols = prompt('Введите ширину', 10)||10;
				fieldRows = prompt('Введите высоту', 10)||10;
				minesCount = prompt('Введите кол-во мин', 10)||10;
				break;
			
		}
		
		gameInit();
	}
}

/*Функция, проверяющая победу:
если кол-во неоткрытых ячеек = кол-ву мин, то победа.*/
function isWin() {
	var cellsLeft = field.querySelectorAll('td:not([data-content="opened"])');
	
	if (cellsLeft.length == minesCount) {
		gameEnd = 'win';
		restartBtn.dataset.content = 'win';
		
		for (var i = 0; i < cellsLeft.length; i++) {
			if (cellsLeft[i].dataset.content != 'flag') {
				cellsLeft[i].dataset.content = 'flag';
			}
		}
		
		mineCounter.innerHTML = '0';
		alert('Вы выйграли!');
	}
}

/*Функция, завершающая игру при проигрыше:
открыавет все мины, неправильные флаги зачеркивает*/
function gameOver() {
	
	restartBtn.dataset.content = 'lost';
	
	for (var i = 0; i < fieldRows; i++) {
		for (var j = 0; j < fieldCols; j++) {
			
			if ((fieldMatrix[i][j] != 'mine')&&(field.rows[i].cells[j].dataset.content == 'flag')) {
				field.rows[i].cells[j].dataset.content = 'wrong';
			}
			if ((field.rows[i].cells[j].dataset.content != 'mine')&&(fieldMatrix[i][j] == 'mine')&&(field.rows[i].cells[j].dataset.content != 'flag')) {
				openCell(i, j);
			}
		}
	}
	alert('Вы проиграли!');
}

/*Функция, открывающая ячейку по левому клику и
отображающая в ней мину/число мин рядом/открывающая соседние ячейки.*/
function openCell(row, col) {
	
	if (fieldMatrix[row][col] == 'mine') {
		
		if (!gameEnd) {
			field.rows[row].cells[col].style.borderColor = 'red';
			field.rows[row].cells[col].style.backgroundColor = 'red';
			gameEnd = 'lost';
		}

		field.rows[row].cells[col].dataset.content = 'mine';	
	} else {
		field.rows[row].cells[col].dataset.content = 'opened';
		if (fieldMatrix[row][col] == '0') {
			for (var i = row - 1; i < row + 2; i++) {
				for (var j = col -1; j < col + 2; j++) {
					if ((i < 0)||(j < 0)||(i > fieldRows - 1)||(j > fieldCols - 1)||(field.rows[i].cells[j].dataset.content == 'opened')||(field.rows[i].cells[j].dataset.content == 'flag')) {
						continue;
					}
					openCell(i, j);
				}
			}
		} else {
			field.rows[row].cells[col].innerHTML = fieldMatrix[row][col];
		}
	}
}

/*Функция, создающая игровое поле field*/
function createField() {
	var table = document.createElement('table');
	table.dataset.content = 'field';
	if (field) {
		fieldContainer.removeChild(field);
	}
	field = table;
	var row = document.createElement('tr');
	for (var i = 0; i < fieldCols; i++) {
		var col = document.createElement('td');
		row.appendChild(col);
	}
	
	for (var i = 0; i < fieldRows; i++) {
		row = row.cloneNode(true);
		table.appendChild(row);
	}
	fieldContainer.appendChild(table);
}

/*Функция, создающая матрицу игрового поля fieldMatrix*/
function createFieldMatrix() {
	
	fieldMatrix = [];
	
	for (var j = 0; j < fieldRows; j++) {
		fieldMatrix[j] = [];
		for (var i = 0; i < fieldCols; i++) {
			fieldMatrix[j][i] = 0;
		}
	}
}

/*Функция, генерирующая мины, заносящая их в fieldMatrix,
и посчитывающая числа в ячейках вокруг мин*/
function randomizeMines() {
	for (var i = 0; i < minesCount; i++) {
		while ((isNaN(row))||(isNaN(col))||(fieldMatrix[row][col] == 'mine')) {
			var row = getRandomInt(0, fieldRows - 1);
			var col = getRandomInt(0, fieldCols - 1);
		}
		
		fieldMatrix[row][col] = 'mine';
		for (var j = row - 1; j < row + 2; j++) {
			for (var k = col -1; k < col + 2; k++) {
				if ((j < 0)||(k < 0)||(j > fieldRows - 1)||(k > fieldCols - 1)||(fieldMatrix[j][k] == 'mine')) {
					continue;
				}
				fieldMatrix[j][k] += 1;
			}
		}

	}
}

/*Функция, возвращающая случайное целое между min и max*/
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*Функция, создающая верхню панель с меню*/
function createTopBar() {
	var topBar = document.createElement('div');
	topBar.classList.add('topbar');

	var menu = createMenu();
	topBar.appendChild(menu);
	
	return topBar;
}

/*Функция, создающая выпадающее меню (выбор сложности)*/
function createMenu() {
	var menu = document.createElement('ul');
	var dropdownMenu = menu.cloneNode(false);
	menu.classList.add('menu');
	dropdownMenu.classList.add('dropdown');
	
	var listItem = document.createElement('li');
	listItem.innerHTML = 'Сложность';
		
	menu.appendChild(listItem);
	listItem.appendChild(dropdownMenu);
	
	listItem = listItem.cloneNode(false);
	listItem.innerHTML = 'Подсказка';
	menu.appendChild(listItem);
	
	for (var i = 0; i < 4; i++) {
		listItem = listItem.cloneNode(false);
		dropdownMenu.appendChild(listItem);
	}
	
	menu.children[1].dataset.action = 'tip';
	selectedDif = dropdownMenu.children[0];
	dropdownMenu.children[0].classList.add('selected');
	dropdownMenu.children[0].innerHTML = 'Новичок';
	dropdownMenu.children[0].dataset.action = 'easy';
	dropdownMenu.children[1].innerHTML = 'Любитель';
	dropdownMenu.children[1].dataset.action = 'medium';
	dropdownMenu.children[2].innerHTML = 'Профессионал';
	dropdownMenu.children[2].dataset.action = 'hard';
	dropdownMenu.children[3].innerHTML = 'Особые...';
	dropdownMenu.children[3].dataset.action = 'custom';
	
	return menu;
}

/*Функция, создающая игровое "окно"*/
function miner() {
	restartBtn = document.createElement('button');
	restartBtn.dataset.action = 'restart';
	
	mineCounter = document.createElement('span');
	mineCounter.dataset.content = 'mineCounter';
	
	topBar = createTopBar();
	
	fieldContainer.appendChild(topBar);
	fieldContainer.appendChild(mineCounter);
	fieldContainer.appendChild(restartBtn);
	gameInit();
	
	fieldContainer.addEventListener('click', pushBtn);
	fieldContainer.addEventListener('contextmenu', setFlag);
	fieldContainer.addEventListener('mousedown', mouseDownTrue);
	fieldContainer.addEventListener('mouseup', mouseDownFalse);
}

/*Функция, обновляющая игровые переменные и запускающая игру*/
function gameInit() {
	gameEnd = false;
	restartBtn.dataset.content = '';
	mineCounter.innerHTML = minesCount;
	createField();
	createFieldMatrix();
	randomizeMines();
}