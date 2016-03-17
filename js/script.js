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

miner();

/*Функция, устанавливающая/убирающая флаг по правому клику на клетку поля,
и изменяющая цифру на счетчике мин*/
function setFlag(e) {
	
	if ((e.target.tagName != 'TD')||(e.target.dataset.content == 'mine')||(e.target.dataset.content == 'opened')||(gameEnd)) {
		e.preventDefault();
		return;
	}

	if (e.target.dataset.content != 'flag') {
		e.target.dataset.content = 'flag';
		mineCounter.innerHTML = parseInt(mineCounter.innerHTML) - 1;
	} else {
		e.target.dataset.content = '';
		mineCounter.innerHTML = parseInt(mineCounter.innerHTML) + 1;
	}
	e.preventDefault();
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
	
	if ((e.target.tagName != 'TD')||(e.target.dataset.content == 'flag')||(gameEnd)) {
		return;
	}
	
	var col = e.target.cellIndex;
	var row = e.target.parentElement.rowIndex;
	
	openCell(row, col);
	
	if (gameEnd == 'lost') {
		gameOver();
		return;
	}
	
	isWin();
}

/*Функция, выполняющая смену сложности при клике на пункт выпадающего меню
и перезапускающая игру*/
function menuAction(target) {
	var action = target.dataset.action;
	if (action) {
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
		field.rows[row].cells[col].style.borderColor = '#e4e3e3';
		field.rows[row].cells[col].style.backgroundColor = '#e4e3e3';
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
		while ((!row)||(!col)||(fieldMatrix[row][col] == 'mine')) {
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
	
	for (var i = 0; i < 4; i++) {
		listItem = listItem.cloneNode(false);
		dropdownMenu.appendChild(listItem);
	}
	
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